var util = require('util');
var db = require('db');

var datas = db.openLevelDB("bayesian");

var logger = [{
  type: "console",
  levels: [console.ERROR, console.WARN, console.NOTICE],
}, {
  type: "file",
  levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN],
  path: "./log/error.log",
  split: "hour",
  count: 48
}, {
  type: "file",
  levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN, console.INFO],
  path: "./log/access.log",
  split: "minute",
  count: 128
}, {
  type: "syslog",
  levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN, console.INFO]
}]

console.reset();
console.add(logger);

var Storage = function(options) {
  options = options || {};
  var name = options.name || '_default';
  var prefix = 'classifier.bayesian.' + name + '.';

  this.storage = {
    get: function(k) {
      return datas.get(prefix + k);
    },
    getCounts: function(ks) {
      var l = datas.mget(ks.map(function(v) {
        return prefix + 'words.' + v;
      }));
      if (!l)
        return {};

      var len = ks.length;
      var i;
      var r = {};

      for (i = 0; i < len; i++)
        r[ks[i]] = JSON.parse(l[i] || '{}');

      return r;
    },
    set: function(k, v) {
      datas.set(prefix + k, v);
    },
    setCounts: function(kvs) {
      var bat = datas.begin();
      util.each(kvs, function(v, k) {
        bat.set(prefix + "words." + k, JSON.stringify(v));
      });
      bat.commit();
    },
    has: function(k) {
      return datas.has(prefix + k);
    },
    list: function(k, func) {
      var word_prefix = prefix + k + '.';
      var word_prefix1 = prefix + k + '/';
      var word_prefix_len = word_prefix.length;

      datas.between(word_prefix, word_prefix1, function(v1, k1) {
        var k = k1.toString();
        var v = v1.toString();
        func(k.substr(word_prefix_len), v);
      });
    }
  };

  if (!this.storage.has('cats')) {
    this.storage.set('cats', '{}');
  }
};

Storage.prototype = {
  async: false,

  getCats: function() {
    return JSON.parse(this.storage.get('cats'));
  },

  setCats: function(cats) {
    this.storage.set('cats', JSON.stringify(cats));
  },

  getWordCounts: function(words) {
    return this.storage.getCounts(words);
  },

  incCounts: function(catIncs, wordIncs) {
    var cats = this.getCats();
    util.each(catIncs, function(inc, cat) {
      cats[cat] = cats[cat] + inc || inc;
    }, this);
    this.setCats(cats);

    var counts = this.getWordCounts(util.keys(wordIncs));
    util.each(wordIncs, function(incs, word) {
      var wordCounts = counts[word];
      util.each(incs, function(inc, cat) {
        wordCounts[cat] = wordCounts[cat] + inc || inc;
      }, this);
    }, this);
    this.storage.setCounts(counts);
  },

  toJSON: function() {
    var words = {};

    this.storage.list('words', function(k, v) {
      words[k] = JSON.parse(v);
    });
    return {
      cats: JSON.parse(this.storage.get('cats')),
      words: words
    };
  },

  fromJSON: function(json) {
    this.incCounts(json.cats, json.words);
  }
};

var Bayesian = function(options) {
  options = options || {};

  this.thresholds = options.thresholds || {};
  this.default = options.default || 'unclassified';
  this.weight = options.weight || 1;
  this.assumed = options.assumed || 0.5;
  this.backend = new Storage(options);
}

Bayesian.prototype = {
  getCats: function() {
    return this.backend.getCats();
  },

  getWordCounts: function(words) {
    return this.backend.getWordCounts(words);
  },

  getWords: function(doc) {
    if (util.isArray(doc)) {
      return doc;
    }
    var words = doc.split(/\s+/);
    return util.unique(words);
  },

  incDocCounts: function(docs) {
    var wordIncs = {};
    var catIncs = {};
    docs.forEach(function(doc) {
      // console.error(doc)
      var output = doc.output;
      catIncs[output] = catIncs[output] ? catIncs[output] + 1 : 1;

      var words = this.getWords(doc.input);
      // console.error("words==>", words)
      words.forEach(function(word) {
        wordIncs[word] = wordIncs[word] || {};
        wordIncs[word][output] = wordIncs[word][output] ? wordIncs[word][output] + 1 : 1;
      }, this);
    }, this);
    // console.error("catIncs==>", catIncs)
    // console.error("wordIncs==>", wordIncs)
    return this.backend.incCounts(catIncs, wordIncs);
  },

  train: function(input, output) {
    this.incDocCounts([{
      input: input,
      output: output
    }]);
  },

  trainAll: function(data) {
    this.incDocCounts(data);
  },

  wordProb: function(word, cat, cats, counts) {
    // times word appears in a doc in this cat / docs in this cat
    var prob = (counts[cat] || 0) / cats[cat];

    // get weighted average with assumed so prob won't be extreme on rare words
    var total = util.reduce(cats, function(sum, p, cat) {
      return sum + (counts[cat] || 0);
    }, 0, this);

    var a = {}
    a["cat"] = cat;
    a["total"] = total;
    a["prob"] = prob;
    // console.error(word, "==>", a)

    return (this.weight * this.assumed + total * prob) / (this.weight + total);
  },

  getCatProbs: function(cats, words, counts) {
    var numDocs = util.reduce(cats, function(sum, count) {
      return sum + count;
    }, 0);

    var probs = {};
    //遍历每一个标签，判断这个样本中关键词与这个标签的关系是否紧密
    util.each(cats, function(catCount, cat) {
      var catProb = (catCount || 0) / numDocs;

      //针对每一个关键词，计算它对于当前标签的概率，连乘到prob身上，若这个标签对于每个关键词都有关系，则prob比较大
      var docProb = util.reduce(words, function(prob, word) {
        // console.error("prob==>", prob);
        // console.error("word==>", word);
        var wordCounts = counts[word] || {};
        return prob * this.wordProb(word, cat, cats, wordCounts);
      }, 1, this);
      // console.error("docProb==>", docProb, cat, catProb);
      // the probability this doc is in this category
      probs[cat] = catProb * docProb;
    }, this);
    // console.error("probs==>", probs)
    return probs;
  },

  getProbs: function(doc) {
    var words = this.getWords(doc);
    // console.error("words==>", words)
    var cats = this.getCats();
    // console.error("cats==>", cats)
    var counts = this.getWordCounts(words);
    console.error("counts==>", counts)
    return this.getCatProbs(cats, words, counts);
  },

  bestMatch: function(probs) {
    var max = util.reduce(probs, function(max, prob, cat) {
      return max.prob > prob ? max : {
        cat: cat,
        prob: prob
      };
    }, {
      prob: 0
    });

    var category = max.cat || this.default;
    var threshold = this.thresholds[max.cat] || 1;

    util.map(probs, function(prob, cat) {
      if (!(cat == max.cat) && prob * threshold > max.prob) {
        category = this.default; // not greater than other category by enough
      }
    }, this);

    return category;
  },

  bestMatchMore: function(probs, n) {
    var res = [],
      resBySlice = [],
      _res = [];

    for (var k in probs) {
      var x = {};
      x["type"] = k;
      x["value"] = Number(probs[k]);
      res.push(x);
    }
    resBySlice = res.sort(function(a, b) {
      return a["value"] > b["value"] ? -1 : 1;
    }).slice(0, n);
    // console.error("sort==>", res)
    resBySlice.forEach(function(each) {
      _res.push(each["type"]);
    })
    return _res;
  },

  classify: function(doc) {
    var probs = this.getProbs(doc);
    return this.bestMatch(probs);
  },

  classifyMore: function(doc, n) {
    var probs = this.getProbs(doc);
    return this.bestMatchMore(probs, n);
  },

  toJSON: function() {
    return this.backend.toJSON();
  },

  fromJSON: function(json) {
    this.backend.fromJSON(json);
    return this;
  }
}

module.exports = Bayesian;