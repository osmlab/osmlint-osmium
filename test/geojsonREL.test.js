'use strict';
var test = require('tape');
var path = require('path');
var readline = require('readline');
var GJV = require('geojson-validation');
var fs = require('fs');

var processors = require('../index.js');
var osm = path.join(__dirname, '/fixtures/nouturn.osm');
var outputFile = path.join(__dirname, '/fixtures/output.json');
var tags = {
  type: 'restriction'
};

test('geojson Relation', function(t) {
  t.plan(1);
  processors.geojsonREL(tags, osm, outputFile, function() {
    var flag = true;
    var rd = readline.createInterface({
      input: fs.createReadStream(outputFile),
      output: process.stdout,
      terminal: false
    });
    rd.on('line', function(line) {
      if (flag) {
        flag = false;
        var geojson = JSON.parse(line);
        t.equal(GJV.isFeatureCollection(geojson), true, 'Should be a FeatureCollection');
        t.end();
      }
    });
  });
});
