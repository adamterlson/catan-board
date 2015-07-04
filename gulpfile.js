var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var gulp = require('gulp');

var b = watchify(browserify({
  entries: './lib/game.js',
  debug: true
}));

b.on('update', bundle);

function bundle() {
    return b
    .transform(babelify)
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./dist'));
}

gulp.task('default', bundle);