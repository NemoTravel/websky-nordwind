(function() {

    var gulp = require('gulp'),
        del = require('del'),
        ngHtml2Js = require('gulp-ng-html2js'),
        minifyHtml = require('gulp-minify-html'),
        uglify = require('gulp-uglify'),
        concat = require('gulp-concat'),
        stylus = require('gulp-stylus'),
        autoprefixer = require('autoprefixer-stylus');

    gulp.task('clean', function() {
        return del('build');
    });

    gulp.task('build:html', function() {
        return gulp.src('src/**/*.html')
            .pipe(minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            }))
            .pipe(ngHtml2Js({
                moduleName: 'app',
                rename: function(url) {
                    return url.replace('src/', '');
                }
            }))
            .pipe(concat("templates-nordwind.js"))
            .pipe(uglify())
            .pipe(gulp.dest('build/'));
    });


    gulp.task('watch', function() {
        gulp.watch('src/**/*.*', gulp.series('build:html'));
    });

    gulp.task('build', gulp.series('build:html'));

    gulp.task('default', gulp.series('build', 'watch'));

}());
