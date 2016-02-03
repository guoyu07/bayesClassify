"use strict"
var util = require("util");
var bbsData = require("../data/bbs");
var classifier = require("../lib/bayes/bayesian");
var fs = require("fs");
var ls = fs.readLines("./data/tag.csv");
var bayes = new classifier();
var htmlUtil = require("../utils/index");
var Segment = require('../lib/segment/');
var zhseg = require("../lib/zhseg/");
var segment = new Segment();
segment.useDefault();

function toWordArr(post) {
	var words = [];
	//对标题分词
	var titleNseg = zhseg.seg(post["title"]);
	words = words.concat(titleNseg);
	//对内容分词
	var content = htmlUtil.fromHtml(post["content"]);
	var contentNseg = zhseg.seg(content);
	words = words.concat(contentNseg);
	return words;
}

var bbsDataLength = bbsData.length,
	learnData = bbsData.slice(0, bbsDataLength * 0.8),
	testData = bbsData.slice(bbsDataLength * 0.8, bbsDataLength);
//机器学习过程
var res = {},
	tags = [];
ls.forEach(function(each) {
	var sp = each.split(","),
		k = sp[0],
		ar = sp.slice(1, sp.length);

	res[k] = ar;
})
tags = util.keys(res);
tags.forEach(function(each) {
	bayes.train(res[each], each);
})

var step = 0;
learnData.forEach(function(each) {
	var words = toWordArr(each);
	//利用标签学习
	tags.forEach(function(_each) {
		bayes.train(words, _each);
	})

	step++;
	if ((step % 10) == 0)
		console.error("step:", step);
});

//根据学习结果打标签
var open = fs.openTextStream("./tag_result.json", "w+");
var _step = 0;
testData.forEach(function(e) {
	var word = toWordArr(e);
	var classResMore = bayes.classifyMore(word, 3);
	e["learn2Tag"] = classResMore;
	var content = htmlUtil.fromHtml(e["content"]);
	e["content"] = content;
	open.writeLine(JSON.stringify(e));
	_step++;
	if ((_step % 10) == 0)
		console.error("learn_2_tags_step:", _step);
})

// var t = {
// 	"title": "净水器哪个牌子好 道尔顿3m美的排名怎么样",
// 	"content": "净水器哪个牌子好 道尔顿3m美的排名怎么样",
// 	"tags": ["生活"]
// }


// var classResMore = bayes.classifyMore(toWordArr(t), 3);
// console.log(t);
// console.error(classResMore)