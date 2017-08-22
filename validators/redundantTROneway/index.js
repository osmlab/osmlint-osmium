'use strict';
var fs = require('fs');
var osmium = require('osmium');
var _ = require('underscore');
var turf = require('@turf/turf');
var util = require('../../util');

module.exports = function(tags, pbfFile, outputFile, callback) {
  var wstream = fs.createWriteStream(outputFile);
  var relationMembers = {};
  var nodes = {};
  var ways = {};
  var relations = {};
  var osmlint = 'redundanttroneway';

  var handlerA = new osmium.Handler();
  handlerA.on('relation', function(relation) {
    var tags = relation.tags();
    if (tags.type === 'restriction' &&
      ((tags.restriction &&
          (tags.restriction === 'no_left_turn' ||
            tags.restriction === 'no_right_turn' ||
            tags.restriction === 'no_u_turn')) ||
        (tags['restriction:conditional'] &&
          (tags['restriction:conditional'].indexOf('no_left_turn') > -1 || tags['restriction:conditional'].indexOf('no_right_turn') > -1 || tags['restriction:conditional'].indexOf('no_u_turn') > -1)))) {
      var members = relation.members();
      var relationFeature = util.relationFeature(relation);
      relations[relation.id] = relationFeature;
      for (var i = 0; i < members.length; i++) {
        var member = members[i];
        member.idrel = relation.id;
        //Check nodes
        if (member.type === 'n') {
          if (nodes[member.ref]) {
            nodes[member.ref].push(member);
          } else {
            nodes[member.ref] = [member];
          }
        }
        //Check ways
        if (member.type === 'w') {
          if (ways[member.ref]) {
            ways[member.ref].push(member);
          } else {
            ways[member.ref] = [member];
          }
        }
      }

    }
  });

  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on('node', function(node) {
    if (nodes[node.id]) {
      //one node can belong to many relations
      var nodeRols = nodes[node.id];
      for (var n = 0; n < nodeRols.length; n++) {
        var nodeRel = nodeRols[n];
        var nodeFeature = util.nodeFeature(node, relations[nodeRel.idrel], nodeRel);
        if (relationMembers[nodeFeature.properties['@idrel']]) {
          relationMembers[nodeFeature.properties['@idrel']].push(nodeFeature);
        } else {
          relationMembers[nodeFeature.properties['@idrel']] = [nodeFeature];
        }
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on('way', function(way) {
    if (ways[way.id]) {
      //one way can belong to many relations
      var wayRols = ways[way.id];
      for (var m = 0; m < wayRols.length; m++) {
        var wayRol = wayRols[m];
        var wayFeature = util.wayFeature(way, relations[wayRol.idrel], wayRol);
        if (relationMembers[wayFeature.properties['@idrel']]) {
          relationMembers[wayFeature.properties['@idrel']].push(wayFeature);
        } else {
          relationMembers[wayFeature.properties['@idrel']] = [wayFeature];
        }
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);

  handlerC.on('done', function() {
    for (var rel in relationMembers) {
      if (relationMembers[rel].length > 0) {
        var relTags = relations[rel].tags;
        var rMenbers = util.sortRoles(relationMembers[rel]);
        var from = util.simpleRole(rMenbers.from);
        var via = util.simpleRole(rMenbers.via);
        var to = util.simpleRole(rMenbers.to);
        var flag = false;

        var restriction = (
          relTags.restriction === 'no_left_turn' ||
          (relTags['restriction:conditional'] && relTags['restriction:conditional'].indexOf('no_left_turn') > -1) ||
          relTags.restriction === 'no_right_turn' ||
          (relTags['restriction:conditional'] && relTags['restriction:conditional'].indexOf('no_right_turn') > -1)
        );

        //Case 1: When the "to" roles has oneway  and the ending coordinate  is eqqual  to via.

        if (restriction &&
          via.type == 'node' &&
          _.intersection(to.end, via.start).length == 2 &&
          rMenbers.to[0].properties.oneway &&
          (rMenbers.to[0].properties.oneway === 'yes' || rMenbers.to[0].properties.oneway === '1')) {
          flag = true;
        }

        if (restriction &&
          via.type == 'line' &&
          (_.intersection(to.end, via.start).length == 2 || _.intersection(to.end, via.end).length == 2) &&
          rMenbers.to[0].properties.oneway &&
          (rMenbers.to[0].properties.oneway === 'yes' || rMenbers.to[0].properties.oneway === '1')) {
          flag = true;
        }

        //Cases 2: When the "to" roles has oneway  and the start coordinate  is equal to via.

        if (restriction &&
          via.type == 'node' &&
          _.intersection(to.start, via.start).length == 2 &&
          (rMenbers.to[0].properties.oneway &&
            rMenbers.to[0].properties.oneway === '-1')) {
          flag = true;
        }
        if (restriction &&
          via.type == 'line' &&
          (_.intersection(to.start, via.start).length == 2 || _.intersection(to.start, via.end).length == 2) &&
          (rMenbers.to[0].properties.oneway && rMenbers.to[0].properties.oneway === '-1')) {
          flag = true;
        }


        //Cases 3: When  "to" role has oneway  in no_u_turn.

        restriction = (
          relTags.restriction === 'no_u_turn' ||
          (relTags['restriction:conditional'] && relTags['restriction:conditional'].indexOf('no_u_turn') > -1)
        );



        if (flag) {
          var fc = {
            type: 'FeatureCollection',
            features: relationMembers[rel]
          };
          var line = turf.polygonToLineString(turf.bboxPolygon(turf.bbox(fc)));
          line.properties = _.extend(relations[rel].props, {
            members: relations[rel].members
          }, relations[rel].tags, {
            relations: relationMembers[rel]
          }, {
            _osmlint: osmlint
          });
          wstream.write(JSON.stringify(line) + '\n');
        }
      }
    }
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
  wstream.end();
  callback();
};