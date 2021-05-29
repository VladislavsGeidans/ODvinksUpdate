"use strict";

// Load plugins
const browsersync = require("browser-sync").create();
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const webpack = require("webpack");
const webpackconfig = require("./config/webpack.config.js");
const webpackstream = require("webpack-stream");
const autoPrefixer = require("gulp-autoprefixer");

const env = {
    server: {
        path: './',
        port: 3000,
        config: {
            jshint: {
                src: './config/.jshintrc'
            }
        }
    },
    paths: {
        sass: {
            src: ['./dist/scss/**/*.scss'],
            dest: './public/css'
        },
        html: {
            src: ['./*.html'],
            dest: './'
        },
        js: {
            src: ['./dist/js/**/*.js'],
            dest: './public/js'
        },
        images: {
            src: ['./dist/images/**/*'],
            dest: './public/images'
        }
    }
}

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: env.server.path,
    },
    port: env.server.port
  });

  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./public/"]);
}

// Optimize Images
function images() {
  return gulp
    .src(env.paths.images.src)
    .pipe(newer(env.paths.images.dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(env.paths.images.dest));
}

// CSS task
function css() {
  return gulp
    .src(env.paths.sass.src)
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest(env.paths.sass.dest))
    .pipe(rename({ suffix: ".min" }))
    .pipe(autoPrefixer())
    .pipe(gulp.dest(env.paths.sass.dest))
    .pipe(browsersync.stream());
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(env.paths.js.src)
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig, webpack))
      // folder only, filename is specified in webpack config
      .pipe(gulp.dest(env.paths.js.dest))
      .pipe(browsersync.stream())
  );
}

// Watch files
function watchFiles() {
  gulp.watch(env.paths.sass.src, css);
  gulp.watch(env.paths.js.src, gulp.series(scripts));
  gulp.watch(["./*"], gulp.series(browserSyncReload));
  gulp.watch(env.paths.images.src, images);
}

// define complex tasks
const js = gulp.series(scripts);
const build = gulp.series(clean, gulp.parallel(css, images, js));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;