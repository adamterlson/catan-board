var gulp = require('gulp');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
  return gulp.src('lib/*.js')
    .pipe(watch('lib/*.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});