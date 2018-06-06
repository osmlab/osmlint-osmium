"use strict";
var test = require("tape");
var path = require("path");
var readline = require("readline");
var fs = require("fs");
var processors = require("../index.js");
var osm = path.join(__dirname, "/fixtures/missingRoleTR.osm");
var outputFile = path.join(__dirname, "/fixtures/missingRoleTR.output.json");
test("Missing role in TR", function(t) {
  t.plan(2);
  processors.missingRoleTR(null, osm, outputFile, function() {
    var flag = true;
    var rd = readline.createInterface({
      input: fs.createReadStream(outputFile),
      output: process.stdout,
      terminal: false
    });
    rd.on("line", function(line) {
      if (flag) {
        flag = false;
        var feature = JSON.parse(line);
        t.equal(
          feature.features[0].properties["@idrel"],
          3858794,
          "Should be 3858794"
        );
        t.equal(
          feature.name._osmlint,
          "missingroletr",
          "Should be missingroletr"
        );
        t.end();
      }
    });
  });
});
