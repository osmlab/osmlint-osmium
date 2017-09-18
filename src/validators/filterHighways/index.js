'use strict'
var fs = require('fs')
var osmium = require('osmium')
var util = require('../../util')
module.exports = function (opts, pbfFile, outputFile, callback) {
  var wstream = fs.createWriteStream(outputFile)
  var osmlint = 'filterhighways'
  var handler = new osmium.Handler()
  var prevent = {
    motorway: true,
    trunk: true,
    motorway_link: true,
    trunk_link: true,
    primary: true,
    secondary: true,
    tertiary: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true,
    residential: true,
    unclassified: true,
    living_street: true,
    road: true
  }
  handler.on('way', function (way) {
    if (prevent[way.tags().highway]) {
      var wayFeature = util.wayFeature(way)
      wayFeature.properties._osmlint = osmlint
      wstream.write(JSON.stringify(wayFeature) + '\n')
    }
  })
  var reader = new osmium.Reader(pbfFile)
  var locationHandler = new osmium.LocationHandler()
  osmium.apply(reader, locationHandler, handler)
  handler.on('done', function () {})
  handler.end()
  wstream.end()
}
