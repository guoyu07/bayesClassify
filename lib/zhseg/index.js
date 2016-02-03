var Trie = require("./src/trie.js");
var zhseg = require("./src/zhseg.js");
var words_v2 = require("./dict/words.v2.js");

var decompress_words_v2 = function() {
    var words = [];
    words_v2.split('$').forEach(function(e, i) {
        var basechar = e[0];
        var cursor = 1;
        var length = 0;
        while (cursor < e.length) {
            var ch = e.charAt(cursor);
            if (ch >= '0' && ch <= '9') {
                length = 0;
                do {
                    length = length * 10 + parseInt(ch);
                    cursor += 1;
                    ch = e.charAt(cursor);
                } while (ch >= '0' && ch <= '9');
            }

            var suf = e.substr(cursor, length);
            words.push(basechar + suf);
            cursor += length;
        }
    });
    return words;
};


var trie = new Trie();
var words = decompress_words_v2();
words.forEach(function(e, i) {
    trie.add(e);
});
zhseg.init(trie);


exports.seg = function(txt) {
    return zhseg.seg(txt);
};