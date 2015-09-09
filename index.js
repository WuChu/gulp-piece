var gulputil = require('gulp-util');
var through2 = require('through2');
var Readable = require('readable-stream/readable');
var es       = require('event-stream');

var PLUGIN_NAME = 'gulp-piece';

var createReadableStreams = function (cachedFiles) {
    var allStreams = [];
    cachedFiles.forEach(function (file) {
        var stream = new Readable();
        stream.push('\s');
        stream.push(null);

        stream = stream.pipe(through2.obj(function (chunk, enc, next) {
            next(null, file);
        }));

        allStreams.push(stream);
    });

    return es.merge.apply(es, allStreams);
};

var piece = function (pipes) {
    var cachedFiles = [];

    if (!Array.isArray(pipes)) {
        pipes = Array.prototype.slice.call(arguments, 0);
    }
    if (pipes.length === 0) {
        return through2.obj();
    }

    return through2.obj(function (file, encoding, done) {
        if (file.isNull()) {
            return done();
        }
        if (file.isBuffer()) {
            cachedFiles.push(file);
            return done();
        }
        if (file.isStream()) {
            throw new gulputil.PluginError(PLUGIN_NAME, 'Streaming not supported');
        }

        done();
    }, function (done) {
        var self = this;
        pipes.unshift(createReadableStreams(cachedFiles));
        pipes.push(through2.obj(function (file, encoding, next) {
            self.push(file);
            next();
        }, function (callback){
            callback();
            done();
            cachedFiles = null;
        }));
        pipes.reduce(function (oStream, transformStream, index) {
            return oStream.pipe(transformStream);
        });
    });
};

module.exports = piece;
