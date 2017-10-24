'use strict';

import sass from 'gulp-sass';
import path from 'path';
import gulp from 'gulp';
import runSequence from 'run-sequence';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');

// Scan HTML files, optimise and copy
gulp.task('html', () => {
    return gulp.src('app/**/*.html')
  
      // Minify any HTML
      .pipe($.htmlmin({
        removeComments: true
      }))
      // Output files
      .pipe(gulp.dest('dist'));
  });

// gulp styles
gulp.task('styles', () => {
    return gulp.src('app/sass/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('dist/styles'));
});

// lint scripts
gulp.task('lint', () => {
    gulp.src(['app/scripts/**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// gulp scripts
gulp.task('scripts', () => 
    gulp.src([
        'app/scripts/main.js'
    ])
    // Babel
    .pipe(babel({
        presets: ["env"]
    }))
    .pipe(gulp.dest('dist/scripts'))
);

// gulp Serve
gulp.task('serve', ['styles', 'html'], () => {

    browserSync({
        notify: false,
        // Customize the Browsersync console logging prefix
        logPrefix: 'WSK',
        // Allow scroll syncing across breakpoints
        scrollElementMapping: ['main', '.mdl-layout'],
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: ['dist'],
        port: 3000
    });

    gulp.watch(['app/*.html'], ['html', reload]);
    gulp.watch(['app/sass/**/*.{scss,css}'], ['styles', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
    gulp.watch(['app/images/**/*'], reload);
});