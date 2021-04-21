const gulp = require("gulp");
const filter = require("gulp-filter");
const clean = require("gulp-clean");
const rename = require("gulp-rename");
const replace = require("gulp-string-replace");
const { series } = require("gulp");
const sriHash = require('gulp-sri-hash');

const CDN_PATH = 'https://cdn.atomex.net/ui_release/beta_atomexui/release/uiApp/';
const SITE24_X_7_KEY = 'd8c4c9f5acb1e8ba6b6e2af8ef0e64d4';

gulp.task('subResourceIntegrity', () => {
  return gulp.src('./dist/uiApp/*.html')
    .pipe(sriHash())
    .pipe(gulp.dest('./dist/uiApp'));
});

/*
  Copy index.html file from src(./dist/uiApp) to temp directory
*/
gulp.task('copyIndexToTemp', function () {
  return gulp.src("./dist/uiApp/index.html").pipe(gulp.dest("./dist/temp"));
});

/*
  Remove index.html from src directory
*/
gulp.task("removeIndexFromSrc", () => {
  return gulp
    .src("./dist/uiApp/*")
    .pipe(filter(["**/index.html"]))
    .pipe(clean({ force: true }));
});

/*
  Modify index.html as required and save it back in src directory.
*/
gulp.task('modifyIndex', function () {
  return gulp.src("./dist/temp/index.html")
    // replace style.*.css
    // .pipe(replace('<link rel="stylesheet" href="styles.', '<link rel="stylesheet" href="' + CDN_PATH + 'styles.'
    // ))

    // replace syncfusion.*.css
    // .pipe(replace('<link rel="stylesheet" href="syncfusion.', '<link rel="stylesheet" href="' + CDN_PATH + 'syncfusion.'))

    // replace runtime-es2015.*.js
    .pipe(replace('<script src="runtime.', '<script src="' + CDN_PATH + 'runtime.'))

    // replace runtime-es5.*.js
    .pipe(replace('<script src="runtime.', '<script src="' + CDN_PATH + 'runtime.'))

    // replace polyfills-es2015.*.js
    .pipe(replace('<script src="polyfills.', '<script src="' + CDN_PATH + 'polyfills.'))

    // replace polyfills-es5.*.js
    .pipe(replace('<script src="polyfills.', '<script src="' + CDN_PATH + 'polyfills.'))

    // replace scripts.*.js
    .pipe(replace('<script src="scripts.', '<script src="' + CDN_PATH + 'scripts.'))

    // replace vendor-es2015.*.js
    .pipe(replace('<script src="vendor.', '<script src="' + CDN_PATH + 'vendor.'))

    // replace vendor-es5.*.js
    .pipe(replace('<script src="vendor.', '<script src="' + CDN_PATH + 'vendor.'))

    // replace main-es2015.*.js
    .pipe(replace('<script src="main.', '<script src="' + CDN_PATH + 'main.'))

    // replace main-es5.*.js
    .pipe(replace('<script src="main.', '<script src="' + CDN_PATH + 'main.'))

    .pipe(replace('.js" type="module"></script>', '.js?v=1" type="module"></script>'))
    .pipe(replace('.js" nomodule defer></script>', '.js?v=1" nomodule defer></script>'))
    .pipe(replace('.js" defer></script>', '.js?v=1" defer></script>'))

    // replace rumMOKey
    .pipe(replace('var rumMOKey = \'\';', 'var rumMOKey = \'' + SITE24_X_7_KEY + '\';'))

    .pipe(
      rename(path => {
        path.extname = ".html";
      })
    )
    .pipe(gulp.dest("./dist/uiApp"))
});

/*
  Remove the generated temp folder
*/
gulp.task("removeTemp", () => {
  return gulp
    .src("./dist/temp/", { read: false })
    .pipe(clean({ force: true }));
});

exports.default = series(
  "subResourceIntegrity",
  "copyIndexToTemp",
  "removeIndexFromSrc",
  "modifyIndex",
  "removeTemp"
);
