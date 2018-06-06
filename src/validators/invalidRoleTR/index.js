"use strict";
var fs = require("fs");
var osmium = require("osmium");
var turf = require("@turf/turf");
var _ = require("underscore");
var util = require("../../util");

module.exports = function(tags, pbfFile, outputFile, callback) {
  var wstream = fs.createWriteStream(outputFile);
  var relationMembers = {};
  var nodes = {};
  var ways = {};
  var relations = {};
  var roles = ["from", "via", "to"];
  var osmlint = "invalidroletr";

  var handlerA = new osmium.Handler();
  handlerA.on("relation", function(relation) {
    if (relation.tags("type") === "restriction") {
      var tr = {};
      var flagTR = false;
      var members = relation.members();
      for (var d = 0; d < members.length; d++) {
        if (!members[d].role || roles.indexOf(members[d].role) < 0) {
          flagTR = true;
        }
        tr[members[d].ref] = members[d];
      }

      if (flagTR) {
        var relationFeature = util.relationFeature(relation);
        relations[relation.id] = relationFeature;
        for (var i = 0; i < members.length; i++) {
          var member = members[i];
          member.idrel = relation.id;

          // Check nodes
          if (member.type === "n") {
            if (nodes[member.ref]) {
              nodes[member.ref].push(member);
            } else {
              nodes[member.ref] = [member];
            }
          }
          // Check ways
          if (member.type === "w") {
            if (ways[member.ref]) {
              ways[member.ref].push(member);
            } else {
              ways[member.ref] = [member];
            }
          }
        }
      }
    }
  });

  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on("node", function(node) {
    if (nodes[node.id]) {
      // one node can belong to many relations
      var nodeRoles = nodes[node.id];
      for (var n = 0; n < nodeRoles.length; n++) {
        var nodeRole = nodeRoles[n];
        var nodeFeature = util.mergeNodeRelationFeature(
          node,
          relations[nodeRole.idrel],
          nodeRole
        );
        if (relationMembers[nodeFeature.properties["@idrel"]]) {
          relationMembers[nodeFeature.properties["@idrel"]].push(nodeFeature);
        } else {
          relationMembers[nodeFeature.properties["@idrel"]] = [nodeFeature];
        }
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on("way", function(way) {
    if (ways[way.id]) {
      // one way can belong to many relations
      var wayRoles = ways[way.id];
      for (var m = 0; m < wayRoles.length; m++) {
        var wayRole = wayRoles[m];
        var wayFeature = util.mergeWayRelationFeature(
          way,
          relations[wayRole.idrel],
          wayRole
        );
        if (relationMembers[wayFeature.properties["@idrel"]]) {
          relationMembers[wayFeature.properties["@idrel"]].push(wayFeature);
        } else {
          relationMembers[wayFeature.properties["@idrel"]] = [wayFeature];
        }
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);

  handlerC.on("done", function() {
    for (var rel in relationMembers) {
      if (relationMembers[rel].length > 0) {
        var fc = {
          type: "FeatureCollection",
          features: relationMembers[rel]
        };
        fc.name = _.extend({
          _osmlint: osmlint
        });
        wstream.write(JSON.stringify(fc) + "\n");
      }
    }
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
  wstream.end();
  wstream.on("close", callback);
};
