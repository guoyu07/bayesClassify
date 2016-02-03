var test = require("test");
test.setup();

var classifier = require("../lib/bayes/bayesian");

describe('synchronous backends', function() {
  it('classify', function() {
    var bayes = new classifier();

    var spam = ["vicodin pharmacy",
      "all quality replica watches marked down",
      "cheap replica watches",
      "receive more traffic by gaining a higher ranking in search engines",
      "viagra pills",
      "watches chanel tag heuer",
      "watches at low prices"
    ];
    spam.forEach(function(text) {
      bayes.train(text, 'spam');
    });

    var not = ["unknown command line parameters",
      "I don't know if this works on Windows",
      "recently made changed to terms of service agreement",
      "does anyone know about this",
      "this is a bit out of date",
      "the startup options need linking"
    ];
    not.forEach(function(text) {
      bayes.train(text, 'notspam');
    });

    assert.equal(bayes.classify("replica watches"), "spam");
    assert.equal(bayes.classify("check out the docs"), "notspam");
    assert.equal(bayes.classify("recently, I've been thinking that I should"), "notspam");
    assert.equal(bayes.classify("come buy these cheap pills"), "spam");
  })
})

test.run(console.DEBUG);