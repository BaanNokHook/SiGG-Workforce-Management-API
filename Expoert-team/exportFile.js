/* @flow */
'use strict';

var path = require('path');
var config = require('config');
var Winnow = require('winnow');
var FeatureParser = require('feature-parser');

var createKoop = require('koop');
var koop = createKoop(config);
var log = koop.log;

if (config.cache !== 'local') {
  var cache = require('koop-pgcache');
  koop.register(cache);
}
if (config.filesystem.local) {
  var LocalFs = require('koop-localfs');
  koop.register(LocalFs);
} else {
  var S3FS = require('koop-s3fs');
  koop.register(S3FS);
}

var contentTypes = {
  geojson: 'application/json',
  geohash: 'application/json',
  kml: 'application/vnd.google-earth.kml+xml',
  csv: 'text/csv',
  zip: 'application/octet-stream'
};

var GeoXForm = require('geo-xform');
var _ = require('highland');

function exportFile(options, callback) {
  var output = undefined;
  var source = undefined;
  var filter = undefined;
  var transform = undefined;
  var finished = false;
  var failed = false;
  options.tempPath = config.data_dir;

  options.format = options.format || path.extname(options.output).replace(/\./, '');

  createSource(options, function (err, newSource, info) {
    if (err) return callback(err);
    filter = createFilter(options);
    transform = createTransform(options);
    output = createOutput(options, info);
    source = newSource;

    source.on('log', function (l) {
      return log[l.level](l.message);
    }).on('error', function (e) {
      failed = true;
      e.recommendRetry = true;
      finish(e);
    }).pipe(filter).on('error', function (e) {
      failed = true;
      if (e.message.match(/Unexpected token \]/i)) e.recommendRetry = true;
      finish(e);
    }).pipe(transform).on('log', function (l) {
      return log[l.level](l.message);
    }).on('error', function (e) {
      failed = true;
      if (e.message.match(/Unexpected token \]/i)) e.recommendRetry = true;
      finish(e);
    }).pipe(output).on('log', function (l) {
      return log[l.level](l.message);
    }).on('error', function (e) {
      failed = true;
      e.recommendRetry = true;
      finish(e);
    }).on('finish', function () {
      // TODO figure out why finish is firing on failures
      if (!failed) finish();
    });
  });

  function finish(error) {
    // Make sure to clean up anything that is running if the jobs fails
    if (error && !finished) tryAbort();
    // guard against the job ending multiple times
    if (!finished) callback(error);
    finished = true;
  }

  function tryAbort() {
    [source, filter, transform, output].forEach(function (x) {
      try {
        if (x && x.abort) x.abort();
      } catch (e) {
        log.error(e);
      }
    });
  }

  return {
    abort: function abort(message) {
      finish(new Error(message));
    }
  };
}

function createSource(options, callback) {
  checkSourceExists(options.source, function (err, info) {
    if (err) callback(null, createCacheStream(options));else callback(null, createFileStream(options), info);
  });
}

function createOutput(options, info) {
  info = info || {};
  var writeOptions = { ContentType: contentTypes[options.format] };
  if (info.lastModified) writeOptions.metadata = { retrieved_at: info.LastModified };

  return koop.fs.createWriteStream(options.output, writeOptions);
}

function checkSourceExists(source, callback) {
  if (!source) return callback(null, false);
  koop.fs.stat(source, callback);
}

function createFilter(options) {
  var filtered = options.where || options.geometry;
  var isGeohash = /geohash/.test(options.output);
  // if the query is not filtered or the output isn't geohash we just return a noop
  if (!filtered && !isGeohash) return _();
  // if the query is actually filtered then we use Winnow, otherwise it's a noop
  var winnower = filtered ? Winnow.prepareQuery(options) : function (feature) {
    return feature;
  };
  var output = _.pipeline(function (stream) {
    return stream.pipe(FeatureParser.parse()).stopOnError(function (e) {
      return output.emit('error', e);
    }).map(JSON.parse).stopOnError(function (e) {
      return output.emit('error', e);
    }).map(winnower).stopOnError(function (e) {
      return output.emit('error', e);
    }).flatten().compact()
    // if we are cooking a geohash we need to send objects to the transform stage
    // otherwise we just need to send a geojson stream in string forms
    .pipe(isGeohash ? _() : GeoXForm.GeoJSON.createStream({ json: true }));
  });

  return output;
}

function createTransform(options) {
  switch (options.format) {
    case 'geojson':
      return _();
    case 'geohash':
      return cookGeohash();
    default:
      return GeoXForm.createStream(options.format, options);
  }
}

function cookGeohash() {
  var cooker = _.pipeline(function (stream) {
    var geohash = {};
    var output = _();
    var cooker = Winnow.prepareSql('SELECT geohash(geometry, 7) as geohash FROM ?');
    stream.map(cooker).errors(function (e, push, next) {
						console.log(e)
      return next();
    }).each(function (row) {
      if (row[0]) {
        var hash = row[0].geohash;
        if (geohash[hash]) geohash[hash]++;else geohash[hash] = 1;
      }
    }).done(function () {
      output.write(JSON.stringify(geohash));
      output.write(_.nil);
    });
    return output;
  });
  // noop for compatibility with the ogr transform
  cooker.abort = function () {};
  return cooker;
}

function createCacheStream(options) {
  var output = _();
  koop.cache.createStream(options.table, options).on('log', function (l) {
    return log[l.level](l.message);
  }).on('error', function (e) {
    return output.emit('error', e);
  }).pipe(GeoXForm.GeoJSON.createStream()).on('log', function (l) {
    return log[l.level](l.message);
  }).on('error', function (e) {
    return output.emit('error', e);
  }).pipe(output);

  return output;
}

function createFileStream(options) {
  var output = _();
  koop.fs.createReadStream(options.source).on('log', function (l) {
    return log[l.level](l.message);
  }).on('error', function (e) {
    return output.emit('error', e);
  }).pipe(output);

  return output;
}

module.exports = exportFile;
