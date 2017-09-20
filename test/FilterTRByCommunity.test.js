'use strict'
var test = require('tape')
var path = require('path')
var readline = require('readline')
var fs = require('fs')
var processors = require('../index.js')
var osm = path.join(__dirname, '/fixtures/excessiveRolesTR.osm')
var outputFile = path.join(__dirname, '/fixtures/filterTRByCommunity.output.json')
test('Filter TR by comunity', function (t) {
  t.plan(2)
  processors.filterTRByCommunity({
    since: 360
  }, osm, outputFile, function () {
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
        t.equal(feature.properties['@id'], 6502134, 'Should be 6502134')
        t.equal(feature.properties._osmlint, 'filterbycommunity', 'Should be filterbycommunity')
        t.end()
      }
    })
  })
})
