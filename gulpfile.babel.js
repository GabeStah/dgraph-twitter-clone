const gulp = require('gulp');
const bump = require('gulp-bump');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);

const API = {
  name: 'api',
  root: 'api',
  src: 'api/src/**/*.ts',
  dest: 'api/dist'
};

const BASE = {
  name: 'base',
  root: './',
  src: 'src/**/*.ts',
  dest: 'dist'
};

const CLIENT = {
  name: 'client',
  root: 'client',
  src: 'client/src/**/*.ts',
  dest: 'client/dist'
};

const PACKAGE = {
  name: 'dgraph-query-manager',
  root: 'packages/dgraph-query-manager',
  src: 'packages/dgraph-query-manager/src/**/*.ts',
  dest: 'packages/dgraph-query-manager/dist'
};

const TUTORIAL = {
  name: 'tutorial',
  root: 'tutorial',
  dest: 'tutorial/dist'
};

function execCommandAsync(command, options) {
  return exec(command, options).catch(e => {
    console.log(e);
  });
}

gulp.task('api:docs', async () =>
  execCommandAsync('typedoc --out ../tutorial/static/docs/api ./src', {
    cwd: API.root
  }).catch(e => reject(e))
);

gulp.task('client:docs', async () =>
  execCommandAsync('typedoc --out ../tutorial/static/docs/client ./src', {
    cwd: CLIENT.root
  }).catch(e => reject(e))
);

gulp.task('package:docs', async () =>
  execCommandAsync(
    'typedoc --out ../../tutorial/static/docs/dgraph-query-manager ./src',
    { cwd: PACKAGE.root }
  ).catch(e => reject(e))
);

gulp.task('docs:all', gulp.parallel('api:docs', 'client:docs', 'package:docs'));

gulp.task('tutorial:build', async () => {
  const destination = `${TUTORIAL.root}/content/_index.md`;
  const source = `${TUTORIAL.root}/content/sections`;
  return readdir(source)
    .then(files => {
      console.log('FILES CONTENT:', files);
      files
        // .filter(file => {
        //   console.log('FILTER > ' + file);
        //   return (
        //     file.indexOf('-min.js') != -1 && file.indexOf('-min.js.map') == -1
        //   );
        // })
        .map(file => {
          console.log('MAP (' + destination + ') > ' + path.join(source, file));
          readFile(path.join(source, file), 'utf8').then(data => {
            //console.log('DATA:', data);
            appendFile(destination, data + '\n')
              .then(() => {
                console.log('append done');
              })
              .catch(err => {
                throw err;
              });
          });
        });
    })
    .catch(err => {
      console.log('ERROR:', err);
      throw err;
    });
});

function installPackageModules() {
  return execCommandAsync('yarn install', { cwd: PACKAGE.root }).catch(e => {
    console.log(e);
    return reject();
  });
}

function publishToYalc() {
  return execCommandAsync('yalc publish', { cwd: PACKAGE.root }).catch(e => {
    console.log(e);
    return reject();
  });
}

function pushPackagesToApi() {
  return execCommandAsync('yalc update', { cwd: API.root }).catch(e => {
    console.log(e);
    return reject();
  });
}

function pushPackagesToClient() {
  return execCommandAsync('yalc update', { cwd: CLIENT.root }).catch(e => {
    console.log(e);
    return reject();
  });
}

function buildPackage() {
  return gulp
    .src(PACKAGE.src)
    .pipe(sourcemaps.init())
    .pipe(
      ts({
        target: 'ES2017',
        module: 'commonjs',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: 'dist',
        strict: true,
        lib: ['esnext'],
        noImplicitAny: false,
        // jsx: 'react',
        moduleResolution: 'node',
        strictPropertyInitialization: false
        // types: ['node']
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PACKAGE.dest));
}

function bumpVersion() {
  // return await PACKAGES.map(data => {
  return gulp
    .src(`${PACKAGE.root}/package.json`)
    .pipe(bump())
    .pipe(gulp.dest(`${PACKAGE.root}`));
  // });
}

function cleanupPackageDirectories() {
  return execCommandAsync(
    'rm -rf node_modules && rm -rf dist && rm -f yarn.lock',
    { cwd: PACKAGE.root }
  );
}

gulp.task('packages:bump', gulp.series(bumpVersion));

gulp.task('packages:remove:modules', gulp.series(cleanupPackageDirectories));

gulp.task('packages:install:modules', gulp.series(installPackageModules));

gulp.task(
  'packages:cleanup',
  gulp.series(['packages:remove:modules', 'packages:install:modules'])
);

gulp.task('packages:build', gulp.series(buildPackage, publishToYalc));

gulp.task(
  'packages:push',
  gulp.series(pushPackagesToApi, pushPackagesToClient)
);

gulp.task(
  'default',
  gulp.series(
    'packages:remove:modules',
    'packages:install:modules',
    'packages:build',
    'packages:push'
  )
);

gulp.task('api:yarn:install', async () =>
  execCommandAsync('yarn install', { cwd: API.root }).catch(e => reject(e))
);

gulp.task('client:yarn:install', async () =>
  execCommandAsync('yarn install', { cwd: CLIENT.root }).catch(e => reject(e))
);

gulp.task(
  'packages:publish',
  gulp.series(
    'packages:remove:modules',
    'packages:install:modules',
    'packages:build',
    'packages:push'
  )
);

gulp.task('api:transpile', async () =>
  execCommandAsync('gulp default', { cwd: API.root }).catch(e => reject(e))
);

gulp.task('db:regenerate', async () =>
  execCommandAsync('gulp db:regenerate', { cwd: API.root }).catch(e =>
    reject(e)
  )
);

gulp.task('db:schema:alter', async () =>
  execCommandAsync('gulp db:schema:alter', { cwd: API.root }).catch(e =>
    reject(e)
  )
);

gulp.task('db:generate:data', async () =>
  execCommandAsync('gulp db:generate:data', { cwd: API.root }).catch(e =>
    reject(e)
  )
);

gulp.task('api:start', async () =>
  execCommandAsync('yarn run start', { cwd: API.root }).catch(e => reject(e))
);

gulp.task('client:start', async () =>
  execCommandAsync('yarn run start', { cwd: CLIENT.root }).catch(e => reject(e))
);

gulp.task(
  'install',
  gulp.series(
    'api:yarn:install',
    'client:yarn:install',
    'packages:publish',
    'api:transpile',
    'db:regenerate'
  )
);

/**
 * Installs without dropping Dgraph database (only additive schema alterations and data generation).
 */
gulp.task(
  'install:safe',
  gulp.series(
    'api:yarn:install',
    'client:yarn:install',
    'packages:publish',
    'api:transpile',
    'db:schema:alter',
    'db:generate:data'
  )
);

gulp.task('start', gulp.parallel('api:start', 'client:start'));
