"use strict"
var util = require("util");
var bbsData2 = require("../data/bbs");
var bbsData1 = require("../data/bbs1");
var fs = require("fs");
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

var statWord = {},
	statWordArr = [];

bbsData1.forEach(function(e) {
	var words = toWordArr(e);
	words.forEach(function(each) {
		statWord[each] = !statWord[each] ? 1 : statWord[each] + 1;
	})
})

bbsData2.forEach(function(e) {
	var words = toWordArr(e);
	words.forEach(function(each) {
		statWord[each] = !statWord[each] ? 1 : statWord[each] + 1;
	})
})

for (var k in statWord) {
	var d = {};
	d["word"] = k;
	d["p"] = statWord[k];

	statWordArr.push(d);
}

statWordArr.sort(function(a, b) {
	return a.p > b.p ? -1 : 1;
})

var open = fs.openTextStream("./data/word_frequency.json", "w+");
open.writeLine(JSON.stringify(statWordArr));