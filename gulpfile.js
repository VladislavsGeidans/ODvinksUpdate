'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
    sass: {
        src: ['dist/scss/**/*.scss'],
        dest: 'public/css'
    }
};

gulp.task('sass', (done) => {
    gulp.src(paths.sass.src)
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(minifyCss())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest(paths.sass.dest))
        .on('end', done);
});

gulp.task('watch', () => {
    gulp.watch(paths.sass.src, ['sass', 'reload']);
});