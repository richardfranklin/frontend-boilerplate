'use strict';

import sass from 'gulp-sass';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';

const reload = browserSync.reload;

// gulp styles
gulp.task('styles', () => {
    return gulp.src('app/sass/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('dist/styles'));
});

// gulp scripts
gulp.task('scripts', () => 
    gulp.src([
        'app/scripts/main.js'
    ])
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(gulp.dest('dist/scripts'))
);

// lint scripts


// gulp Serve
gulp.task('serve', ['styles'], () => {

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
        server: ['app'],
        port: 3000
      });

    gulp.watch(['app/sass/**/*.{scss,css}'], ['styles', reload]);

});