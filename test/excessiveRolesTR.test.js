'use strict'
var test = require('tape')
var path = require('path')
var readline = require('readline')
var fs = require('fs')
var processors = require('../index.js')
var osm = path.join(__dirname, '/fixtures/excessiveRolesTR.osm')
var outputFile = path.join(__dirname, '/fixtures/excessiveRolesTR.output.json')
test('Excessive roles in TR', function (t) {
  t.plan(2)
  processors.excessiveRolesTR(null, osm, outputFile, function () {
    var flag = true
    var rd = readline.createInterface({
      input: fs.createReadStream(outputFile),
      output: process.stdout,
      terminal: false
    })
    rd.on('line', function (line) {
      if (flag) {
        flag = false
        var feature = JSON.parse(line)
        t.equal(feature.properties['@id'], 6502134, 'Should be 3858794')
        t.equal(feature.properties._osmlint, 'excessiverolestr', 'Should be excessiverolestr')
        t.end()
      }
    })
  })
})
