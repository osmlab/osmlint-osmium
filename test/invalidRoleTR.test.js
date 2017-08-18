'use strict';
var test = require('tape');
var path = require('path');
var readline = require('readline');
var fs = require('fs');
var processors = require('../index.js');
var osm = path.join(__dirname, '/fixtures/invalidRoleTR.osm');
var outputFile = path.join(__dirname, '/fixtures/invalidRoleTR.output.json');
test('Invalid role in TR', function(t) {
  t.plan(2);
  processors.invalidRoleTR(null, osm, outputFile, function() {
    var flag = true;
    var rd = readline.createInterface({
      input: fs.createReadStream(outputFile),
      output: process.stdout,
      terminal: false
    });
    rd.on('line', function(line) {
      if (flag) {
        flag = false;
        var feature = JSON.parse(line);
        t.equal(feature.properties['@id'], 3871355, 'Should be 3871355');
        t.equal(feature.properties._osmlint, 'invalidroletr', 'Should be invalidroletr');
        t.end();
      }
    });
  });
});
