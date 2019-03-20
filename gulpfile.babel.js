var gulp = require('gulp')
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
// var childProcess = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
// import * as gulp from 'gulp';
// tslint:disable-next-line:no-duplicate-imports
// import * as ts from 'gulp-typescript';
// import * as sourcemaps from 'gulp-sourcemaps';

const sourceDirectory = 'src/**/*.ts';

const project = ts.createProject('tsconfig.json');

const PACKAGES = [
  {
    name: 'dgraph-adapter',
    root: 'packages/dgraph-adapter',
    src: 'packages/dgraph-adapter/src/**/*.ts',
    dest: 'packages/dgraph-adapter/dist'
  },
  {
    name: 'dgraph-adapter-http',
    root: 'packages/dgraph-adapter-http',
    src: 'packages/dgraph-adapter-http/src/**/*.ts',
    dest: 'packages/dgraph-adapter-http/dist'
  },
  {
    name: 'dgraph-query-executor',
    root: 'packages/dgraph-query-executor',
    src: 'packages/dgraph-query-executor/src/**/*.ts',
    dest: 'packages/dgraph-query-executor/dist'
  },
  {
    name: 'dgraph-twitter-models',
    root: 'packages/dgraph-twitter-models',
    src: 'packages/dgraph-twitter-models/src/**/*.ts',
    dest: 'packages/dgraph-twitter-models/dist'
  },
  {
    name: 'serialization',
    root: 'packages/serialization',
    src: 'packages/serialization/src/**/*.ts',
    dest: 'packages/serialization/dist'
  }
];

function build_typescript() {
  return project
    .src()
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(
      sourcemaps.write('../maps', { sourceRoot: './', includeContent: false })
    )
    .pipe(gulp.dest('dist'));
}

async function cleanupPackageDirectories() {
  return await PACKAGES.map(async (data) => {
    return await execCommandAsync('rm -rf node_modules && rm -rf dist && rm -f yarn.lock', { cwd: data.root });
  });
}

async function installPackageModules() {
  return await PACKAGES.map(function(data) {
    return execCommandAsync('yarn install', { cwd: data.root })
      .catch(e => {
        console.log(e);
        return reject();
      });
  });
}

/**
 * Builds custom packages.
 * Transpiled package files must be placed in development directory to accommodate /client app's ability to locate them.
 * In a real-world application packages would be published to NPM and added as normal packages to package.json.
 */
function build_packages() {
  const packageProject = ts.createProject('tsconfig-packages.json');
  return packageProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(packageProject())
    .pipe(
      sourcemaps.write('../maps/packages', {
        sourceRoot: './',
        includeContent: false
      })
    )
    .pipe(
      sourcemaps.write('../packages', {
        sourceRoot: './',
        includeContent: false
      })
    )
    .pipe(gulp.dest('packages'));
}

function buildPackage(data) {
  return gulp
    .src(data.src)
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
        jsx: 'react',
        moduleResolution: 'classic',
        strictPropertyInitialization: false
      }))
    .pipe(
      sourcemaps.write('maps', {
        sourceRoot: './',
        includeContent: false
      })
    )
    .pipe(gulp.dest(data.dest));
}

async function execCommandAsync(command, options) {
  return await exec(command, options)
    .then((result) => {
      console.log(result.stdout);
    })
    .catch(e => {
      console.log(e);
    });
}

function testCommand() {
  return execCommandAsync('yarn install', { cwd: 'packages/dgraph-adapter-http' });
}

function buildPackages() {
  return PACKAGES.map(function(data) {
    return buildPackage(data);
  });
}

function build_a_package() {
  return gulp
    .src('packages/serialization/src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(ts({
        target: "ES2017",
        module: "commonjs",
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: "dist",
        strict: true,
        lib: ["esnext", "dom"],
        noImplicitAny: false,
        jsx: 'react',
        strictPropertyInitialization: false
      }))
    .pipe(
      sourcemaps.write('maps', {
        sourceRoot: './',
        includeContent: false
      })
    )
  //   .pipe(
  //     sourcemaps.write('../packages', {
  //       sourceRoot: './',
  //       includeContent: false
  //     })
  //   )
    .pipe(gulp.dest('packages/serialization/dist'));
}

gulp.task('build:packages', build_packages);

gulp.task('build:typescript', build_typescript);

gulp.task('watch:typescript', () => {
  gulp.watch(sourceDirectory, build_typescript);
});

gulp.task('packages:remove:modules', gulp.series(cleanupPackageDirectories));

gulp.task('packages:install:modules', gulp.series(installPackageModules));

gulp.task('packages:cleanup', gulp.series(['packages:remove:modules', 'packages:install:modules']));

gulp.task('test', testCommand);

gulp.task('default', gulp.series(buildPackages));
