/**  
分为中零个，一个，两个，三个统计
 */


"use strict"

var fs = require("fs");
var tag_result = require("../res/tag_result");
var tag_id = require("../data/bbs");
var open = fs.openTextStream("./res/exact_rate_result.json", "w+");
var hash = require("hash");
var htmlUtil = require("../utils/index");

var exactOne = [],
	exactTwo = [],
	exactThree = [],
	exactZero = [];

tag_result.forEach(function(e) {
	var num = 0;
	var tags = e["tags"],
		learn2Tag = e["learn2Tag"];
	learn2Tag.forEach(function(each) {
		if (tags.indexOf(each) > -1) num++;
	});
	// delete e["content"];
	switch (num) {
		case 0:
			exactZero.push(e);
			break;
		case 1:
			exactOne.push(e);
			break;
		case 2:
			exactTwo.push(e);
			break;
		case 3:
			exactThree.push(e);
			break;
	}
})

open.writeLine("共有帖子数：" + tag_result.length);
open.writeLine("打中零个标签：" + exactZero.length + "个," + "占比：" + (exactZero.length / tag_result.length).toFixed(3) + JSON.stringify(exactZero));
open.writeLine("打中一个标签：" + exactOne.length + "个," + "占比：" + (exactOne.length / tag_result.length).toFixed(3) + JSON.stringify(exactOne));
open.writeLine("打中二个标签：" + exactTwo.length + "个," + "占比：" + (exactTwo.length / tag_result.length).toFixed(3) + JSON.stringify(exactTwo));
open.writeLine("打中三个标签：" + exactThree.length + "个," + "占比：" + (exactThree.length / tag_result.length).toFixed(3) + JSON.stringify(exactThree));


// var dict = {};
// tag_id.forEach(function(e) {
// 	var k = hash.md5(e["title"]).digest().hex()
// 	dict[k] = e["taskid"];
// })

// var r = [];
// exactZero.forEach(function(e) {
// 	if (!e["tags"].length) return;
// 	var k = hash.md5(e["title"]).digest().hex()
// 	if (dict[k]) r.push(dict[k]);
// });
// console.log(r.length);
// open.writeLine(JSON.stringify(r));