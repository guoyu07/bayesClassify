"use strict"
var util = require("util");
var wordFrequency = require("../data/word_frequency");
var fs = require("fs");

var arr = {},
	word = "";

wordFrequency.forEach(function(e) {
	if (e["p"] > 2 && e["p"] < 800) {
		word = e["word"];
		arr[word] = 1;
	}
})

var open = fs.openTextStream("./data/used_word.json", "w+");
open.writeLine(JSON.stringify(arr));