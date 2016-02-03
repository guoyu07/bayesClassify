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
// 	_l = parseInt(bbsDataLength * 1),
// 	learnData = bbsData.slice(0, _l);

bbsData = bbsData.slice(0, bbsData.length * 0.95);
var learnData = bbsData.concat(bbsData1);

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
	var _tag = each["tags"];
	_tag.forEach(function(_each) {
		bayes.train(words, _each);
	})

	step++;
	if ((step % 10) == 0)
		console.error("step:", step);
});