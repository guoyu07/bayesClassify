var fs = require("fs");
var process = require("process");
var classifier = require("../lib/bayes/bayesian");
var bayes = new classifier();
var ls = fs.readLines("./data/tag.csv");

var res = {};
ls.forEach(function(each) {
	var sp = each.split(","),
		k = sp[0],
		ar = sp.slice(1, sp.length);

	res[k] = ar;
})

for (var k in res) {
	bayes.train(res[k], k);
}
var testKeyWords = ["玫瑰", "浪漫", "惊喜", "大学", "毕业"]
var classRes = bayes.classify(testKeyWords),
	classResMore = bayes.classifyMore(testKeyWords, 2);

console.log("key:", testKeyWords)
console.error("tag:", classRes);
console.error("more-tag:", classResMore);

process.system("rm -r bayesian")

// bayes.train(text, '1');
//assert.equal(bayes.classify("come buy these cheap pills"), "2");