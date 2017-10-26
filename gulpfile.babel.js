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
const modernizr = require('gulp-modernizr');

/* =============================================================
    Handlebars
============================================================= */
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');

// handlebars cmpile
gulp.task('templating', () => {
    const options = {
        ignorePartials: true,
        batch : ['app/partials'],
        helpers : {
            capitals : function(str){
                return str.toUpperCase();
            }
        }
    }
 
    return gulp.src('./app/**/*.{html, hbs}')
        .pipe(handlebars(null, options))
        .pipe(rename(path => {
            path.extname = '.html';
        }))
        .pipe(gulp.dest('dist'));
});

/* =============================================================
    Scan HTML files, optimise and copy
============================================================= */
gulp.task('html', () => {
    return gulp.src('app/**/*.html')
  
      // Minify any HTML
      .pipe($.htmlmin({
        removeComments: true
      }))
      // Output files
      .pipe(gulp.dest('dist'));
  });

/* =============================================================
    Styles
============================================================= */
gulp.task('styles', () => {
    return gulp.src([
            'app/sass/**/*.scss',
            '!app/sass/directory.scss'
        ])
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('dist/styles'));
});

/* =============================================================
    Styles
============================================================= */
gulp.task('directory-styles', () => {
    return gulp.src('app/sass/directory.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('dist/styles'));
});

/* =============================================================
    Lint scripts
============================================================= */
gulp.task('lint', () => {
    gulp.src(['app/scripts/**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/* =============================================================
    Scripts
============================================================= */
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

/* =============================================================
    Modernizr
============================================================= */
gulp.task('modernizr', () => {
    return gulp.src([
        '!app/scripts/modernizr.js',
        'app/scripts/main.js',
        'app/sass/**/*.scss'
    ])
    .pipe(modernizr({
        options: [],
        "files" : {
            "src": [
                "app/scripts/main.js",
                "styles/**/*.scss"
            ]
        },
    }))
    .pipe(gulp.dest("dist/scripts"));
  });

/* =============================================================
    build initial template listing page
============================================================= */
gulp.task('directory', () => {
    var fs = require('fs');
    var files = fs.readdirSync('app/templates');

    gulp.src('app/directory.hbs')
        .pipe(handlebars(files))
        .pipe(rename('directory.html'))
        .pipe(gulp.dest('dist'));
});

/* =============================================================
    Serve
============================================================= */
gulp.task('serve', ['directory', 'directory-styles', 'styles', 'scripts', 'templating'], () => {

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
        server: {
            baseDir: "dist",
            index: "directory.html"            
        },
        port: 3000
    });

    // Directory modification
    gulp.watch(['app/directory.hbs'], ['directory', reload]);
    gulp.watch(['app/sass/directory.scss'], ['directory-styles', reload]);

    gulp.watch(['app/**/*.html'], ['templating', reload]);
    gulp.watch(['app/partials/*.{html,hbs}'], ['templating', 'directory', reload]);
    gulp.watch(['app/sass/**/*.{scss,css}'], ['styles', 'modernizr', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', 'modernizr', reload]);
    gulp.watch(['app/images/**/*'], reload);
});