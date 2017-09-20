'use strict'
var test = require('tape')
var path = require('path')
var readline = require('readline')
var fs = require('fs')
var processors = require('../index.js')
var osm = path.join(__dirname, '/fixtures/FilterTRByUsers.osm')
var outputFile = path.join(__dirname, '/fixtures/FilterTRByUsers.output.json')
test('Filter TR by user', function (t) {
  t.plan(2)
  processors.FilterTRByUsers({
    users: 'calfarome'
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
        t.equal(feature.properties['@id'], 7578080, 'Should be 7578080')
        t.equal(feature.properties._osmlint, 'filtertrbyusers', 'Should be invalidroletr')
        t.end()
      }
    })
  })
})
