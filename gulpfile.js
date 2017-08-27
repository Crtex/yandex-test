var gulp = require('gulp');
var stylus = require('gulp-stylus');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');

gulp.task('styles', function () {
  return gulp.src('./src/index.styl')
    .pipe(stylus())
    .pipe(gulp.dest('.'));
});

gulp.task("watch", function() {
  gulp.watch('./**/*.styl', ["styles"]);
  gulp.watch('*', refresh);
});

gulp.task('serve', function () {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(__dirname));
  app.listen(4000);
  lr = require('tiny-lr')();
  lr.listen(35729);
});

gulp.task("default", ["styles", "watch", "serve"]);

refresh = function(event) {
  var fileName = require('path').relative(__dirname, event.path);
  gutil.log.apply(gutil, [gutil.colors.magenta(fileName), gutil.colors.cyan('built')]);
  lr.changed({
    body: { files: [fileName] }
  });
}