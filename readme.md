# Combine your gulp transform stream into a single one. [![Build Status](https://travis-ci.org/WuChu/gulp-piece.svg?branch=master)](https://travis-ci.org/WuChu/gulp-piece)

> Combine transform actions (stream), just in buffer mode.

It could let you custom 'pack' your gulp's pipe. Even your 'packed' stream could include another one.

## Install

```
$ npm install --save-dev gulp-piece
```

## Usage

### Just don't want too many pipe here.

```js

var gulp = require('gulp');
var piece = require('gulp-piece');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');

gulp.src('**/*.js')
    .pipe(piece([
        rev(),
        uglify()
    ]))
    .pipe(gulp.dest('dist/'));

// Or, it would also work well whitout the array wrap []...

gulp.src('**/*.js')
    .pipe(piece(
        uglify()
        rev()
    ))
    .pipe(gulp.dest('dist/'));

```

### Sometimes, you just want to left them in another js file, and want to invoke them in gulp code style.

task/js-process.js
```js

var piece = require('gulp-piece');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');

module.exports = function () {
    return piece(
        uglify(),
        rev()
    );
};

```

gulpfile.js
```js

var gulp = require('gulp');
var jspr = require('./task/js-process');

gulp.src('**/*.js')
    .pipe(jspr())
    .pipe(gulp.dest('dist/'));

```

### Piece in piece ?

task/js-process.js
```js

var piece = require('gulp-piece');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');

module.exports = function () {
    var jsFilter = filter('**/*.js', {restore: true});
    return piece(
        jsFilter,
        uglify(),
        jsFilter.restore
    );
};

```

task/css-process.js
```js

var piece = require('gulp-piece');
var csso = require('gulp-csso');
var filter = require('gulp-filter');

module.exports = function () {
    var cssFilter = filter('**/*.css', {restore: true});
    return piece(
        cssFilter,
        csso(),
        cssFilter.restore
    );
};

```

task/process.js
```js

var piece = require('gulp-piece');
var jspr = require('./task/js-process');
var csspr = require('./task/css-process');

module.exports = function () {
    return piece(
        jspr(),
        csspr()
    );
};

```

gulpfile.js
```js

var gulp = require('gulp');
var process = require('./task/process');

gulp.src('**/*.(js|css)')
    .pipe(process())
    .pipe(gulp.dest('dist/'));

```

## API

### piece([stream...])

Returns a [transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform).

#### pattern

Type: `array`, `stream`

Accepts a streams array or stream-arguments.

## License

MIT © Joo Wu