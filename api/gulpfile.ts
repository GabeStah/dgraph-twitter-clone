import * as gulp from 'gulp';
// tslint:disable-next-line:no-duplicate-imports
import { series, watch } from 'gulp';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import bump from 'gulp-bump';
import { DgraphAdapterHttp } from 'dgraph-query-manager';
import config from './src/config';
import { Generator } from './src/helpers/generator';

const adapter = new DgraphAdapterHttp();

const sourceDirectory = 'src/**/*.ts';

const project = ts.createProject('tsconfig.json');

function buildTypescript() {
  return project
    .src()
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(
      sourcemaps.write('../maps', { sourceRoot: './', includeContent: false })
    )
    .pipe(gulp.dest('dist'));
}

function bumpVersion() {
  return gulp
    .src(`package.json`)
    .pipe(bump())
    .pipe(gulp.dest(`.`));
}

function dbDrop() {
  return adapter.dropAll();
}

function dbAlterSchema() {
  return adapter.alterSchema(config.dgraph.schema);
}

function dbGenerateData() {
  return Generator.generateInitialData();
}

gulp.task('db:drop', dbDrop);
gulp.task('db:schema:alter', dbAlterSchema);
// Drop database and reset schema.
gulp.task('db:reset', gulp.series(dbDrop, dbAlterSchema));
gulp.task('db:generate:data', dbGenerateData);
// Drop database, reset schema, and reload initial data.
gulp.task('db:regenerate', gulp.series(dbDrop, dbAlterSchema, dbGenerateData));

gulp.task('build:typescript', buildTypescript);

gulp.task('watch:typescript', () => {
  gulp.watch(sourceDirectory, buildTypescript);
});

gulp.task('default', series(buildTypescript));
