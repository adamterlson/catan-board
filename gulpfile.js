var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var gulp = require('gulp');

var b = watchify(browserify({
  entries: './lib/main.js',
  debug: true
}));


gulp.task('sass', function () {
  gulp.src('./css/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./css/**/*.scss', ['sass']);
});

gulp.task('bundle', bundle)

b.on('update', bundle);

function bundle() {
  return b
    .transform(babelify)
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./dist'));
}

gulp.task('default', ['bundle', 'sass:watch']);