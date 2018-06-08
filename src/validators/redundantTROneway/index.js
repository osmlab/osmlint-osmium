"use strict";
var fs = require("fs");
var osmium = require("osmium");
var _ = require("underscore");
var turf = require("@turf/turf");
var util = require("../../util");

module.exports = function(tags, pbfFile, outputFile, callback) {
  var wstream = fs.createWriteStream(outputFile);
  var relationMembers = {};
  var nodes = {};
  var ways = {};
  var relations = {};
  var osmlint = "redundanttroneway";

  var handlerA = new osmium.Handler();
  handlerA.on("relation", function(relation) {
    var tags = relation.tags();
    if (
      tags.type === "restriction" &&
      ((tags.restriction &&
        (tags.restriction === "no_left_turn" ||
          tags.restriction === "no_right_turn" ||
          tags.restriction === "no_u_turn")) ||
        (tags["restriction:conditional"] &&
          (tags["restriction:conditional"].indexOf("no_left_turn") > -1 ||
            tags["restriction:conditional"].indexOf("no_right_turn") > -1 ||
            tags["restriction:conditional"].indexOf("no_u_turn") > -1)))
    ) {
      var members = relation.members();
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
  });

  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on("node", function(node) {
    if (nodes[node.id]) {
      // one node can belong to many relations
      var nodeRols = nodes[node.id];
      for (var n = 0; n < nodeRols.length; n++) {
        var nodeRel = nodeRols[n];
        var nodeFeature = util.mergeNodeRelationFeature(
          node,
          relations[nodeRel.idrel],
          nodeRel
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
      var wayRols = ways[way.id];
      for (var m = 0; m < wayRols.length; m++) {
        var wayRol = wayRols[m];
        var wayFeature = util.mergeWayRelationFeature(
          way,
          relations[wayRol.idrel],
          wayRol
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
        var relTags = relations[rel].tags;
        var rMenbers = util.sortRoles(relationMembers[rel]);
        var from = rMenbers.from[0];
        var via = rMenbers.via[0];
        var to = rMenbers.to[0];
        var simFrom = util.simpleRole(rMenbers.from);
        var simVia = util.simpleRole(rMenbers.via);
        var simTo = util.simpleRole(rMenbers.to);
        var flag = false;

        if (from && via && to) {
          var restriction =
            relTags.restriction === "no_left_turn" ||
            (relTags["restriction:conditional"] &&
              relTags["restriction:conditional"].indexOf("no_left_turn") >
                -1) ||
            relTags.restriction === "no_right_turn" ||
            (relTags["restriction:conditional"] &&
              relTags["restriction:conditional"].indexOf("no_right_turn") > -1);

          // Case1: When the "to" roles has oneway  and the ending coordinate  is equal  to via
          if (
            restriction &&
            simVia.type === "node" &&
            _.intersection(simTo.end, simVia.start).length === 2 &&
            to.properties.oneway &&
            (to.properties.oneway === "yes" || to.properties.oneway === "1")
          ) {
            flag = true;
          }
          // Case2: When the "to" roles has oneway  and the start coordinate  is equal to via
          if (
            restriction &&
            simVia.type === "node" &&
            _.intersection(simTo.start, simVia.start).length === 2 &&
            (to.properties.oneway && to.properties.oneway === "-1")
          ) {
            flag = true;
          }

          restriction =
            relTags.restriction === "no_u_turn" ||
            (relTags["restriction:conditional"] &&
              relTags["restriction:conditional"].indexOf("no_u_turn") > -1);
          // Case3: When a oneway road has no_u_turn via=node
          if (
            restriction &&
            simVia.type === "node" &&
            from.properties["@id"] === to.properties["@id"] &&
            (from.properties.oneway &&
              (from.properties.oneway === "yes" ||
                from.properties.oneway === "1" ||
                from.properties.oneway === "-1"))
          ) {
            flag = true;
          }
          // Case4: When a oneway road has no_u_turn via=line
          var viaCoords = _.unique(_.flatten([simVia.start, simVia.end]));
          if (
            restriction &&
            simVia.type === "line" &&
            (_.intersection(simFrom.end, viaCoords).length === 2 &&
              _.intersection(simTo.end, viaCoords).length === 2) &&
            (from.properties.oneway &&
              (from.properties.oneway === "yes" ||
                from.properties.oneway === "1")) &&
            (to.properties.oneway &&
              (to.properties.oneway === "yes" ||
                from.properties.oneway === "1"))
          ) {
            flag = true;
          }
          // Case5: When a oneway road has no_u_turn via=node
          if (
            restriction &&
            simVia.type === "node" &&
            (_.intersection(simFrom.end, viaCoords).length === 2 &&
              _.intersection(simTo.end, viaCoords).length === 2) &&
            (from.properties.oneway &&
              (from.properties.oneway === "yes" ||
                from.properties.oneway === "1")) &&
            (to.properties.oneway &&
              (to.properties.oneway === "yes" ||
                from.properties.oneway === "1"))
          ) {
            flag = true;
          }
        }

        if (flag) {
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
    }
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
  wstream.end();
  wstream.on("close", callback);
};
