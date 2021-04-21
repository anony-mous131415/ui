const gulp = require("gulp");
const filter = require("gulp-filter");
const purify = require("gulp-purify-css");
const gzip = require("gulp-gzip");
const brotli = require("gulp-brotli");
const clean = require("gulp-clean");
const rename = require("gulp-rename");
const replace = require("gulp-string-replace");
const { series, parallel } = require("gulp");

//#region CSS Optimizations
/*
  Filter the CSS files to be optimized
  Based on their usage in Build JS files
  & Store the optimize file in the given location
*/
gulp.task("copyCssToTemp", () => {
  return gulp
    .src("./dist/uiApp/*")
    .pipe(filter(["**/*.css"]))
    .pipe(purify(["./dist/uiApp/*.js"],
      {
        info: true,
        minify: true,
        rejected: true,
        whitelist: []
      })
    )
    .pipe(gulp.dest("./dist/temp/"));
});

/*
  Read the optimized CSS in the Step #1
  Apply gzip compression
*/
gulp.task("gzipCompress", () => {
  return gulp
    .src("./dist/temp/*")
    .pipe(filter(["**/*.css", "!**/*.br.*", "!**/*.gzip.*"]))
    .pipe(gzip({ append: false }))
    .pipe(
      rename(path => {
        path.extname = path.extname + ".gzip";
      })
    )
    .pipe(gulp.dest("./dist/temp/"));
});

/*
  Read the optimized CSS in the Step #1
  Apply brotli compression
*/
gulp.task("brCompress", () => {
  return gulp
    .src("./dist/temp/*")
    .pipe(filter(["**/*.css", "!**/*.br.*", "!**/*.gzip.*"]))
    .pipe(brotli.compress())
    .pipe(
      rename(path => {
        path.extname = ".br";
      })
    )
    .pipe(gulp.dest("./dist/temp"));
});

/*
  Delete style output of Angular prod build
*/
gulp.task("removeCssFilesFromSrc", () => {
  return gulp
    .src("./dist/uiApp/*")
    .pipe(filter(["**/*.css"]))
    .pipe(clean({ force: true }));
});

/*
  Once the optimization & compression is done,modify_indexmodify_index
  Replace the files in angular build output location
*/
gulp.task("copyCssFromTemp", () => {
  return gulp.src("./dist/temp/*").pipe(gulp.dest("./dist/uiApp"));
});

/*
  Remove the generated temp folder
*/
gulp.task("removeTemp", () => {
  return gulp
    .src("./dist/temp/", { read: false })
    .pipe(clean({ force: true }));
});
//#endregion

/*
 ### Order of Tasks ###
 * Optimize the styles generated from ng build
 * Create compressed files for optimized css
 * Clear the angular build output css
 * Copy the optimized css to ng-bundle folder
 * Clear the temp folder
 */
exports.default = series(
  "copyCssToTemp",
  parallel("gzipCompress", "brCompress"),
  "removeCssFilesFromSrc",
  "copyCssFromTemp",
  "removeTemp"
);
