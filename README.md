# Dgraph Twitter Clone

A Twitter clone using [Dgraph.io](https://dgraph.io/) for backend data management.

## Packages

The `dgraph-query-manager` package is not publicly published to NPM, so it is built and published locally for use in the `/client` and `/api` apps.

### Installation

1. Install any missing node packages via `yarn install`.
2. Execute the default Gulp task to rebuild the `dgraph-query-manager` package and redistribute it to the `/client` and `/api` apps:

```bash
$ gulp default
[19:34:45] Requiring external module @babel/register
[19:34:45] Using gulpfile D:\work\dgraph\projects\dgraph-twitter-clone\gulpfile.babel.js
[19:34:45] Starting 'default'...
[19:34:45] Starting 'packages:remove:modules'...
[19:34:45] Starting 'cleanupPackageDirectories'...
[19:34:47] Finished 'cleanupPackageDirectories' after 1.18 s
[19:34:47] Finished 'packages:remove:modules' after 1.18 s
[19:34:47] Starting 'packages:install:modules'...
[19:34:47] Starting 'installPackageModules'...
[19:34:51] Finished 'installPackageModules' after 4.32 s
[19:34:51] Finished 'packages:install:modules' after 4.33 s
[19:34:51] Starting 'packages:build'...
[19:34:51] Starting 'buildPackage'...
[19:34:53] Finished 'buildPackage' after 1.89 s
[19:34:53] Starting 'bumpVersion'...
[19:34:53] Bumped 0.6.54 to 0.6.55 with type: patch
[19:34:53] Finished 'bumpVersion' after 9.52 ms
[19:34:53] Starting 'publishToYalc'...
[19:34:53] Finished 'publishToYalc' after 270 ms
[19:34:53] Finished 'packages:build' after 2.17 s
[19:34:53] Starting 'packages:push'...
[19:34:53] Starting 'pushPackagesToApi'...
[19:34:54] Finished 'pushPackagesToApi' after 850 ms
[19:34:54] Starting 'pushPackagesToClient'...
[19:34:55] Finished 'pushPackagesToClient' after 734 ms
[19:34:55] Finished 'packages:push' after 1.59 s
[19:34:55] Finished 'default' after 9.27 s
```