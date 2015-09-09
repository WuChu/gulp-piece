var Readable = require('readable-stream/readable');
var es = require('event-stream');
var through2 = require('through2');
var gulputil = require('gulp-util');
var piece = require('./');
var assert = require('assert');
var path = require('path');

describe('piece(...)', function () {
    it('should work well just one source file .', function (callback) {
        var tStream = piece(
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passB');
                assert.equal(String(chunk.contents), 'passA->passB');
                next(null, chunk);
            }),
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passC');
                assert.equal(String(chunk.contents), 'passA->passB->passC');
                next(null, chunk);
                callback();
            })
        );

        var oStream = new Readable();
        oStream.push('\s');
        oStream.push(null);
        oStream.pipe(through2.obj(function (chunk, encoding, next) {
            chunk = new gulputil.File({
                base: __dirname,
                path: path.join(__dirname, 'ok.js')
            });
            chunk.contents = new Buffer('passA');
            next(null, chunk);
        })).pipe(tStream);
    });

    it('should work well by piece in piece .', function (callback) {
        var tSubStream = piece(
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passSubA');
                assert.equal(String(chunk.contents), 'passA->passB->passSubA');
                next(null, chunk);
            }),
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passSubB');
                assert.equal(String(chunk.contents), 'passA->passB->passSubA->passSubB');
                next(null, chunk);
            })
        );

        var tStream = piece(
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passB');
                assert.equal(String(chunk.contents), 'passA->passB');
                next(null, chunk);
            }),
            tSubStream,
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passC');
                assert.equal(String(chunk.contents), 'passA->passB->passSubA->passSubB->passC');
                next(null, chunk);
                callback();
            })
        );

        var oStream = new Readable();
        oStream.push('\s');
        oStream.push(null);
        oStream.pipe(through2.obj(function (chunk, encoding, next) {
            chunk = new gulputil.File({
                base: __dirname,
                path: path.join(__dirname, 'ok.js')
            });
            chunk.contents = new Buffer('passA');
            next(null, chunk);
        })).pipe(tStream);
    });

    it('should work well not only one source file .', function (callback) {
        var results = [];

        var tStream = piece(
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passB');
                assert.equal(String(chunk.contents), 'passA->passB');
                next(null, chunk);
            }),
            through2.obj(function (chunk, encoding, next) {
                chunk.contents = new Buffer(String(chunk.contents) + '->passC');
                assert.equal(String(chunk.contents), 'passA->passB->passC');
                results.push(path.extname(chunk.path));
                next(null, chunk);
            })
        );

        var oJSStream = new Readable();
        oJSStream.push('\s');
        oJSStream.push(null);
        oJSStream = oJSStream.pipe(through2.obj(function (chunk, encoding, next) {
            chunk = new gulputil.File({
                base: __dirname,
                path: path.join(__dirname, 'ok.js')
            });
            chunk.contents = new Buffer('passA');
            next(null, chunk);
        }));

        var oCSSStream = new Readable();
        oCSSStream.push('\s');
        oCSSStream.push(null);
        oCSSStream = oCSSStream.pipe(through2.obj(function (chunk, encoding, next) {
            chunk = new gulputil.File({
                base: __dirname,
                path: path.join(__dirname, 'ok.css')
            });
            chunk.contents = new Buffer('passA');
            next(null, chunk);
        }));

        es.merge(oJSStream, oCSSStream)
            .pipe(tStream)
            .pipe(through2.obj(function (file, encoding, next) {
                next();
            }, function (done) {
                assert.equal(results.length, 2);
                assert.equal(results.indexOf('.js') !== -1, true);
                assert.equal(results.indexOf('.css') !== -1, true);
                callback();
            }));
    });
});
