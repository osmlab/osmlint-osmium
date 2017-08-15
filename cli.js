#!/usr/bin/env node

'use strict';
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');

var usage = function() {
  console.log('Usage: osmlinto <validator> <pbfFile> <output file>');
  console.log('e.g: osmlinto missingroletr hawaii.osm.pbf output.json');
};

(function() {
  if (argv._.length < 2) {
    return usage();
  }

  var validator = (function(name) {
    var validators = fs.readdirSync(path.join(__dirname, '/validators/'));
    for (var i = 0; i < validators.length; i++) {
      if (validators[i].toLowerCase() === name) {
        return require(path.join(__dirname, 'validators', validators[i]));
      }
    }
    return null;
  })(argv._[0]);

  if (!validator) {
    console.error('Unknown validator "' + argv._[0] + '"');
    return usage();
  }

  var opts = {};
  for (var tag in argv) {
    if (tag !== '_') {
      opts[tag] = argv[tag];
    }
  }

  // var bbox = argv.bbox ? JSON.parse(argv.bbox) : null;
  // var zoom = argv.zoom ? parseInt(argv.zoom) : 12;
  // var opts = {
  //   bbox: bbox,
  //   zoom: zoom
  // };

  // console.log([opts].concat(argv._.slice(1)))
  validator.apply(null, [opts].concat(argv._.slice(1)));


  // var pbfFile = argv._.slice(0);
  // var output = argv._.slice(1);
  // console.log(opts);


  // validator.apply(pbfFile, output, JSON.stringify(opts));
})();