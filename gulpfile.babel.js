const gulp = require('gulp')
const bump = require('gulp-bump');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PACKAGE = {
  name: 'dgraph-query-manager',
  root: 'packages/dgraph-query-manager',
  src: 'packages/dgraph-query-manager/src/**/*.ts',
  dest: 'packages/dgraph-query-manager/dist'
};

function buildPackage() {
  return gulp
    .src(PACKAGE.src)
    .pipe(sourcemaps.init())
    .pipe(ts({
        target: "ES2017",
        module: "commonjs",
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: "dist",
        strict: true,
        lib: ["esnext"],
        noImplicitAny: false,
        // jsx: 'react',
        moduleResolution: 'node',
        strictPropertyInitialization: false,
        // types: ['node']
      }))
    .pipe(
      sourcemaps.write('maps', {
        sourceRoot: './',
        includeContent: false
      })
    )
    .pipe(gulp.dest(PACKAGE.dest));
}

function bumpVersion() {
  // return await PACKAGES.map(data => {
  return gulp.src(`${PACKAGE.root}/package.json`)
    .pipe(bump())
    .pipe(gulp.dest(`${PACKAGE.root}`));
  // });
}

function cleanupPackageDirectories() {
  return execCommandAsync('rm -rf node_modules && rm -rf dist && rm -f yarn.lock', { cwd: PACKAGE.root });
}

function execCommandAsync(command, options) {
  return exec(command, options)
    .catch(e => {
      console.log(e);
    });
}

function installPackageModules() {
  return execCommandAsync('yarn install', { cwd: PACKAGE.root })
    .catch(e => {
      console.log(e);
      return reject();
    });
}

function publishToYalc() {
  return execCommandAsync('yalc publish', { cwd: PACKAGE.root })
    .catch(e => {
        console.log(e);
        return reject();
    });
}

gulp.task('packages:remove:modules', gulp.series(cleanupPackageDirectories));

gulp.task('packages:install:modules', gulp.series(installPackageModules));

gulp.task('packages:cleanup', gulp.series(['packages:remove:modules', 'packages:install:modules']));

gulp.task('packages:build', gulp.series(buildPackage, bumpVersion, publishToYalc))

gulp.task('default', gulp.series(
  'packages:remove:modules', 
  'packages:install:modules',
  'packages:build'
));