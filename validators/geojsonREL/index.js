'use strict';
var fs = require('fs');
var osmium = require('osmium');
var turf = require('@turf/turf');
var _ = require('underscore');

module.exports = function(tags, pbfFile, outputFile, callback) {
  var wstream = fs.createWriteStream(outputFile);
  var relationsMemb = {};
  var nodes = {};
  var ways = {};
  var relations = {};
  var handlerA = new osmium.Handler();
  handlerA.on('relation', function(relation) {
    if (checkTags(relation.tags(), tags)) {
      var members = relation.members();
      relations[relation.id] = _.extend({
        '@id': relation.id,
        '@version': relation.version,
        '@changeset': relation.changeset,
        '@uid': relation.uid,
        '@user': relation.user
      }, {
        tags: relation.tags()
      }, {
        members: members
      });
      for (var i = 0; i < members.length; i++) {
        members[i].relation = relation.id;
        if (members[i].type === 'n') {
          if (nodes[members[i].ref]) {
            nodes[members[i].ref].push(members[i]);
          } else {
            nodes[members[i].ref] = [members[i]];
          }
        }
        if (members[i].type === 'w') {
          if (ways[members[i].ref]) {
            ways[members[i].ref].push(members[i]);
          } else {
            ways[members[i].ref] = [members[i]];
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
      var relationsNode = nodes[node.id];
      for (var n = 0; n < relationsNode.length; n++) {
        var properties = _.extend({
            '@id': node.id,
            '@version': node.version,
            '@changeset': node.changeset,
            '@uid': node.uid,
            '@user': node.user
          }, node.tags(), relationsNode[n], {
            relationId: relationsNode[n].relation
          }, {
            relation: relations[relationsNode[n].relation]
          },
          relations[relationsNode[n].relation].tags);

        var feature = {
          type: 'Feature',
          properties: properties,
          geometry: node.geojson()
        };
        if (relationsMemb[properties.relation]) {
          relationsMemb[properties.relation].push(feature);
        } else {
          relationsMemb[properties.relation] = [feature];
        }
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on('way', function(way) {
    if (ways[way.id]) {
      var relationsWay = ways[way.id];
      for (var m = 0; m < relationsWay.length; m++) {
        var properties = _.extend({
          '@id': way.id,
          '@version': way.version,
          '@changeset': way.changeset,
          '@uid': way.uid,
          '@user': way.user
        }, way.tags(), relationsWay[m], {
          relationId: relationsWay[m].relation
        }, {
          relation: relations[relationsWay[m].relation]
        }, relations[relationsWay[m].relation].tags);
        var feature = {
          type: 'Feature',
          properties: properties,
          geometry: way.geojson()
        };
        if (relationsMemb[properties.relation]) {
          relationsMemb[properties.relation].push(feature);
        } else {
          relationsMemb[properties.relation] = [feature];
        }
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);
  handlerC.on('done', function() {
    for (var rel in relationsMemb) {
      if (relationsMemb[rel].length > 0) {
        var fc = {
          type: 'FeatureCollection',
          features: relationsMemb[rel]
        };
        wstream.write(JSON.stringify(fc) + '\n');
      }
    }
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
  wstream.end();
};

function checkTags(tags, valueTags) {
  var match = 0;
  _.each(valueTags, function(v, k) {
    if (tags[k] === v || (tags[k] && v === '*')) {
      match++;
    }
  });
  if (match === _.size(valueTags)) {
    return true
  }
  return false;
}