"use strict"
var util = require("util");
var rpc = require("rpc");
var bbsData = require("../data/bbs");
var classifier = require("../lib/bayes/bayesian");
// var bayes = rpc.open("/Users/sunpeiqi/lianxi/classifier/lib/bayes/bayesian.js")
var fs = require("fs");
var ls = fs.readLines("./data/tag.csv");
var bayes = new classifier();
// var htmlUtil = require("../utils/index");
var htmlUtil = rpc.open("/Users/sunpeiqi/lianxi/classifier/utils/index.js");
// var zhseg = require("../lib/zhseg/");
var zhseg = rpc.open("/Users/sunpeiqi/lianxi/classifier/lib/zhseg/index.js");
var usedWords = require("../data/used_word");
var coroutine = require("coroutine");

function toWordArr(post) {
	var words = [];
	//对标题分词
	var titleNseg = zhseg.seg(post["title"]);
	titleNseg.forEach(function(e) {
		if (!usedWords[e]) return;
		words.push(e);
	});
	// words = words.concat(titleNseg);
	//对内容分词
	var content = htmlUtil.fromHtml(post["content"]);
	var contentNseg = zhseg.seg(content);
	contentNseg.forEach(function(e) {
		if (!usedWords[e]) return;
		words.push(e);
	});
	// words = words.concat(contentNseg);
	return words;
}

var bbsDataLength = bbsData.length,
	_l = parseInt(bbsDataLength * 0.8),
	learnData = bbsData.slice(0, _l),
	testData = bbsData.slice(_l, bbsDataLength);

//根据学习结果打标签
var open = fs.openTextStream("./res/tag_result.json", "w+");
var _step = 0,
	res = [];
coroutine.parallel(new Array(16), function() {
	while (true) {
		var a = new Date().getTime();
		var r = testData[_step++];
		if (!r) break;
		var word = toWordArr(r);
		var classResMore = bayes.classifyMore(word, 3);
		r["learn2Tag"] = classResMore;
		var content = htmlUtil.fromHtml(r["content"]);
		r["content"] = content;
		var b = new Date().getTime();
		console.error(r["title"] + "||用时:" + (b - a) / 1000)
		res.push(r);
		if ((_step % 10) == 0)
			console.log("learn_2_tags_step:", _step);
	}
});
open.writeLine(JSON.stringify(res));

// var t = {
// 	"title": "净水器哪个牌子好 道尔顿3m美的排名怎么样",
// 	"content": "净水器哪个牌子好 道尔顿3m美的排名怎么样",
// 	"tags": ["生活"]
// }


// var classResMore = bayes.classifyMore(toWordArr(t), 3);
// console.log(t);
// console.error(classResMore)