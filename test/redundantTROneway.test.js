'use strict'
var test = require('tape')
var path = require('path')
var readline = require('readline')
var fs = require('fs')
var processors = require('../index.js')
var osm = path.join(__dirname, '/fixtures/redundantTROneway.osm')
var outputFile = path.join(__dirname, '/fixtures/redundantTROneway.output.json')
test('redundant TR in oneways', function (t) {
  t.plan(2)
  processors.redundantTROneway(null, osm, outputFile, function () {
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
        t.equal(feature.properties['@id'], 7496343, 'Should be 7496343')
        t.equal(feature.properties._osmlint, 'redundanttroneway', 'Should be redundanttroneway')
        t.end()
      }
    })
  })
})
