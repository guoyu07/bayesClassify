var codeHtml = require('utils/codeHTML');
var removeTags = ['colgroup', 'applet', 'area', 'audio', 'base', 'basefont', 'bdi', 'bdo', 'button', 'canvas', 'command', 'datalist', 'del', 'dir', 'dfn', 'embed', 'head', 'iframe', 'img', 'input', 'isindex', 'keygen', 'map', 'meta', 'meter', 'noframes', 'noscript', 'object', 'optgroup', 'option', 'output', 'param', 'progress', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'select', 'source', 'strike', 'style', 'track', 'textarea', 'video', 'xmp'];

var filterBlockTags = ['address', 'article', 'aside', 'blockquote', 'body', 'caption', 'center', 'dd', 'dt', 'div', 'dl', 'details', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'menu', 'ol', 'p', 'pre', 'table', 'ul', 'legend', 'li', 'tbody', 'dfoot', 'thead', 'tr', 'figure', 'figcaption', 'footer', 'header', 'section', 'summary', 'nav'];

function fromHtml(richText) {
	var cleaner = new htmlCleaner(richText);
	return handleContent(htmlDecode(cleaner.handle()));
}

function toHtml(plainText) {
	plainText = codeHtml.HtmlEncode(plainText);
	return plainText.replace(/(\r\n)|[\n ]/g, function(r) {
		switch (r) {
			case '\r\n':
			case '\n':
				return '<br>';
			case ' ':
				return '&nbbp;';
			default:
				return r;
		}
	});
}

function htmlCleaner(richText) {
	function handleAngle(richText) {
		richText = richText.replace(/(\s*<\s*)+(\s*>\s*)+|(\s*>\s*)+(\s*<)+/g, '\n');
		richText = richText.replace(/(\s*<)+|(\s*>\s*)+/g, "\n").replace(/\n{3,}/g, "\n\n");
		return richText;
	}

	function encodePreTag() {
		return richText.match(/<pre[^>]*>[\s\S]*?<\/pre>/g);
	}

	function decodePreTag(preContents) {
		var i = 0;
		richText = richText.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, function(str) {
			return preContents[i++];
		})
	}

	function fRemoveTags() {
		var preContent = encodePreTag();
		var whiteSpaceRegex = /[\r\t\n]+/gm;
		richText = richText.replace(whiteSpaceRegex, ' ');
		decodePreTag(preContent);
		var regex = new RegExp('<((' + removeTags.join(')|(') + '))[^>]*>[\\s\\S]*?</\\1>', 'gi');
		richText = richText.replace(/(<!--[\s\S]*?-->)|(<input[\s\S]*?\/?>)|(<img[\s\S]*?\/?>)|(<col [\s\S]*?\/?>)/g, '');
		// richText = richText.replace(/(<!--[\s\S]*?-->)|(<input[\s\S]*?\/?>)|(<img[\s\S]*?\/?>)/g, '');
		richText = richText.replace(regex, function(str) {
			return '';
		});
	}

	function fFilterBlockTags() {
		var reg = new RegExp('(<br[^>]*\/?>)|(<hr[^>]*\/?>)', 'gi');
		richText = richText.replace(reg, '><');

		reg.compile('<((' + filterBlockTags.join(')|(') + '))[^>]*>', 'gi');
		richText = richText.replace(reg, function(str) {
			return '<';
		});
		reg.compile(' *</((' + filterBlockTags.join(')|(') + '))>', 'gi');
		richText = richText.replace(reg, function(str) {
			return '>';
		});

		fFilterOtherTags();
		richText = handleAngle(richText);
	}

	function fFilterOtherTags() {
		var fotRegex = /<(\w+) [^>]*>([\s\S]*?)<\/\1>/gi;
		while (fotRegex.test(richText) === true) {
			richText = richText.replace(fotRegex, "$2");
		}
		fotRegex = /<(\w+)>([\s\S]*?)<\/\1>/gi;
		while (fotRegex.test(richText) === true) {
			richText = richText.replace(fotRegex, "$2");
		}
	}

	this.handle = function() {
		fRemoveTags();
		fFilterBlockTags();
		return richText;
	};
}

function htmlDecode(txt) {
	return codeHtml.HTMLDecode(txt);
}

function handleContent(content) {
	var lines = content.split('\n');
	lines = lines.map(function(line) {
		return line.replace(/^\s*\s$/g, '');
	});

	var handledLines = [],
		s = 0,
		e = lines.length,
		nil = false;
	while (lines[s++] === '');
	while (lines[--e] === '');
	for (--s; s <= e; s++) {
		if (lines[s] !== '') {
			nil = false;
		} else {
			if (nil) {
				continue;
			}
			nil = true;
		}
		handledLines.push(lines[s]);
	}
	if (/^TO \d+L @.*? ：/.test(handledLines[0])) {
		var head = handledLines.shift();
		if (handledLines[0] === '') {
			if (handledLines.length > 2) handledLines.shift();
			else {
				handledLines.shift();
				head += handledLines.shift();
			}
		} else {
			if (handledLines.length === 1) {
				head += handledLines.shift();
			}
		}
		handledLines.unshift(head);
	}
	return handledLines.join('\n');
}

module.exports = {
	fromHtml: fromHtml,
	toHtml: toHtml
};