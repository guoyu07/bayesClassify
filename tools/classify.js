"use strict"
var util = require("util");
var bbsData = require("../data/bbs");
var bbsData1 = require("../data/bbs1");
var classifier = require("../lib/bayes/bayesian");
var fs = require("fs");
var ls = fs.readLines("./data/tag.csv");
var bayes = new classifier();
var htmlUtil = require("../utils/index");
var Segment = require('../lib/segment/');
var zhseg = require("../lib/zhseg/");
var rpc = require("rpc");
var coroutine = require("coroutine");
var usedWords = require("../data/used_word");
var segment = new Segment();
segment.useDefault();

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

// var bbsDataLength = bbsData.length,
// 	_l = parseInt(bbsDataLength * 0.95),
// 	learnData = bbsData.slice(0, _l),
// 	testData = bbsData.slice(_l, bbsDataLength);

// // 根据学习结果打标签
// var open = fs.openTextStream("./res/tag_result.json", "w+");
// var _step = 0,
// 	res = [];
// coroutine.parallel(new Array(16), function() {
// 	while (true) {
// 		var a = new Date().getTime();
// 		var r = testData[_step++];
// 		if (!r) break;
// 		var word = toWordArr(r);
// 		var classResMore = bayes.classifyMore(word, 3);
// 		r["learn2Tag"] = classResMore;
// 		var content = htmlUtil.fromHtml(r["content"]);
// 		r["content"] = content;
// 		var b = new Date().getTime();
// 		console.error(r["title"] + "||用时:" + (b - a) / 1000)
// 		res.push(r);
// 		if ((_step % 10) == 0)
// 			console.log("learn_2_tags_step:", _step);
// 	}
// });
// open.writeLine(JSON.stringify(res));

var t = {
	"title": "【求教】要怎么做啊啊啊啊啊",
	"content": "我想寄一个信件，想加一个不织布的小物件（很小就是塞了棉花有点鼓）。结果说要走EMS，有没有办法呢QAQ",
	"tags": ["小清新", "SOS"],
}

var learnData = bbsData.concat(bbsData1);
console.log("疑难杂症")
learnData.forEach(function(e) {
	if (e["tags"].indexOf("疑难杂症") > -1) console.log(e)
})

// var classResMore = bayes.classifyMore(toWordArr(t), 3);
// console.error(classResMore)