"use strict";
var test = require("tape");
var path = require("path");
var readline = require("readline");
var fs = require("fs");
var processors = require("../index.js");
var osm = path.join(__dirname, "/fixtures/missingTypeRestrictionTR.osm");
var outputFile = path.join(
  __dirname,
  "/fixtures/missingTypeRestrictionTR.output.json"
);
test("Missing type in restriction TR", function(t) {
  t.plan(2);
  processors.missingTypeRestrictionTR(null, osm, outputFile, function() {
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
          1655470,
          "Should be 1655470"
        );
        t.equal(
          feature.name._osmlint,
          "missingtyperestrictiontr",
          "Should be missingTypeRestrictionTR"
        );
        t.end();
      }
    });
  });
});
