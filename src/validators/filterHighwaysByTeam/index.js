'use strict'
var fs = require('fs')
var osmium = require('osmium')
var util = require('../../util')
var turf = require('@turf/turf')

module.exports = function(opts, pbfFile, outputFile, callback) {

  var wstream = fs.createWriteStream(outputFile)
  var osmlint = 'filterhighwaysbyteam'
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

  var filterbyuser = {
    Rub21: true,
    Richrico: true,
    karitotp: true,
    dannykath: true,
    ridixcr: true,
    calfarome: true,
    ediyes: true,
    piligab: true
  }

  var disbyuser = {
    Rub21: 0,
    Richrico: 0,
    karitotp: 0,
    dannykath: 0,
    ridixcr: 0,
    calfarome: 0,
    ediyes: 0,
    piligab: 0
  }
  
  var teamDistance = 0;

  handler.on('way', function(way) {
 
    if (prevent[way.tags().highway] && filterbyuser[way.user] && way.timestamp_seconds_since_epoch >= opts.date) {      
      var wayFeature = util.wayFeature(way)
      wayFeature.properties._osmlint = osmlint
      var distance = SegmentDistance(wayFeature);

      disbyuser[way.user]=disbyuser[way.user] + distance;
      teamDistance = teamDistance + distance;
      console.log('Team distance = ' + teamDistance + ' MK');
      console.log('Distance by user:')
      console.log(disbyuser);
      wstream.write(JSON.stringify(wayFeature) + '\n')
    }
  })

  var reader = new osmium.Reader(pbfFile)
  var locationHandler = new osmium.LocationHandler()
  osmium.apply(reader, locationHandler, handler)
  handler.on('done', function() {})
  handler.end()
  wstream.end()
}

function SegmentDistance(line) {
  var lineDistance = 0;
  for (var i = 0; i < line.geometry.coordinates.length - 1; i++) {
    var coord1 = line.geometry.coordinates[i];
    var coord2 = line.geometry.coordinates[i + 1];
    var from = turf.point(coord1);
    var to = turf.point(coord2);
    var d = turf.distance(from, to, 'kilometers');
    lineDistance += d;
  }
  return lineDistance;
}