const gulp = require('gulp');
const bump = require('gulp-bump');
// const ts = require('gulp-typescript');
// const sourcemaps = require('gulp-sourcemaps');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function bumpVersion() {
  return gulp
    .src(`package.json`)
    .pipe(bump())
    .pipe(gulp.dest(`.`));
}

function cleanupPackageDirectories() {
  return execCommandAsync(
    'rm -rf node_modules && rm -rf dist && rm -f yarn.lock',
    { cwd: '.' }
  );
}

function execCommandAsync(command, options) {
  return exec(command, options).catch(e => {
    console.log(e);
  });
}

gulp.task('default', gulp.series(bumpVersion));
