'use strict'
var fs = require('fs')
var osmium = require('osmium')
var _ = require('underscore')
var turf = require('@turf/turf')
var time = require('time')(Date)
var util = require('../../util')
var users = require('mapbox-data-team').getUsernames()
users = users.reduce(function (memo, currentValue) {
  memo[currentValue.toString()] = true
  return memo
}, {})

module.exports = function (opts, pbfFile, outputFile, callback) {
  var wstream = fs.createWriteStream(outputFile)
  var relationMembers = {}
  var nodes = {}
  var ways = {}
  var relations = {}
  var osmlint = 'filterbycommunity'
  opts.since = opts.since || 360 // 360 day by default.
  var since = (time.time() - opts.since * 24 * 60 * 60)
  var handlerA = new osmium.Handler()
  handlerA.on('relation', function (relation) {
    if (!users.hasOwnProperty(relation.user) &&
      since <= relation.timestamp_seconds_since_epoch &&
      relation.tags('type') === 'restriction') {
      var members = relation.members()
      var relationFeature = util.relationFeature(relation)
      relations[relation.id] = relationFeature
      for (var i = 0; i < members.length; i++) {
        var member = members[i]
        member.idrel = relation.id

        // Check nodes
        if (member.type === 'n') {
          if (nodes[member.ref]) {
            nodes[member.ref].push(member)
          } else {
            nodes[member.ref] = [member]
          }
        }
        // Check ways
        if (member.type === 'w') {
          if (ways[member.ref]) {
            ways[member.ref].push(member)
          } else {
            ways[member.ref] = [member]
          }
        }
      }
    }
  })

  var reader = new osmium.BasicReader(pbfFile)
  osmium.apply(reader, handlerA)

  var handlerB = new osmium.Handler()
  handlerB.on('node', function (node) {
    if (nodes[node.id]) {
      // one node can belong to many relations
      var nodeRols = nodes[node.id]
      for (var n = 0; n < nodeRols.length; n++) {
        var nodeRel = nodeRols[n]
        var nodeFeature = util.mergeNodeRelationFeature(node, relations[nodeRel.idrel], nodeRel)
        if (relationMembers[nodeFeature.properties['@idrel']]) {
          relationMembers[nodeFeature.properties['@idrel']].push(nodeFeature)
        } else {
          relationMembers[nodeFeature.properties['@idrel']] = [nodeFeature]
        }
      }
    }
  })

  reader = new osmium.Reader(pbfFile)
  osmium.apply(reader, handlerB)

  var handlerC = new osmium.Handler()
  handlerC.on('way', function (way) {
    if (ways[way.id]) {
      // one way can belong to many relations
      var wayRols = ways[way.id]
      for (var m = 0; m < wayRols.length; m++) {
        var wayRol = wayRols[m]
        var wayFeature = util.mergeWayRelationFeature(way, relations[wayRol.idrel], wayRol)
        if (relationMembers[wayFeature.properties['@idrel']]) {
          relationMembers[wayFeature.properties['@idrel']].push(wayFeature)
        } else {
          relationMembers[wayFeature.properties['@idrel']] = [wayFeature]
        }
      }
    }
  })

  reader = new osmium.Reader(pbfFile)
  var locationHandler = new osmium.LocationHandler()
  osmium.apply(reader, locationHandler, handlerC)

  handlerC.on('done', function () {
    for (var rel in relationMembers) {
      if (relationMembers[rel].length > 0) {
        var fc = {
          type: 'FeatureCollection',
          features: relationMembers[rel]
        }
        var line = turf.polygonToLineString(turf.bboxPolygon(turf.bbox(fc)))
        line.properties = _.extend(relations[rel].props, {
          members: relations[rel].members
        }, relations[rel].tags, {
          relations: relationMembers[rel]
        }, {
          _osmlint: osmlint
        })
        wstream.write(JSON.stringify(line) + '\n')
      }
    }
  })

  handlerA.end()
  handlerB.end()
  handlerC.end()
  wstream.end()
  wstream.on('close', callback)
}
