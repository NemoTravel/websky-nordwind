(function () {

    var gulp = require('gulp'),
        sass = require('gulp-sass'),
        rename = require('gulp-rename'),
        autoprefixer = require('gulp-autoprefixer'),
        del = require('del'),
        browserify = require('browserify'),
        strictify = require('strictify'),
        buffer = require('vinyl-buffer'),
        ngHtml2Js = require('gulp-ng-html2js'),
        minifyHtml = require('gulp-minify-html'),
        source = require('vinyl-source-stream'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        concat = require('gulp-concat');

    gulp.task('clean', function () {
        return del('build');
    });

    gulp.task('build:html', function () {
        return gulp.src('src/**/*.html')
            .pipe(minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            }))
            .pipe(ngHtml2Js({
                moduleName: 'app',
                rename: function (url) {
                    return url.replace('src/', '');
                }
            }))
            .pipe(concat("templates-nordwind.js"))
            .pipe(uglify())
            .pipe(gulp.dest('build/'));
    });

    gulp.task('build:js', function () {
        return browserify('src/index.js', {transform: strictify})
            .bundle()
            .pipe(source('controllers-nordwind.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('build/'));
    });

    gulp.task('build:css', function () {
        return gulp.src('src/css/**/*.sass')
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 5 versions'],
                cascade: false
            }))
            .pipe(sourcemaps.write())
            .pipe(rename({prefix: 'styles-', basename: 'nordwind'}))
            .pipe(gulp.dest('build/index.css/'));
    });
    gulp.task('watch', function () {
        gulp.watch('src/**/*.*', gulp.series('build:js', 'build:html', 'build:css'));
    });

    gulp.task('build', gulp.series('build:js', 'build:html', 'build:css'));

    gulp.task('default', gulp.series('build', 'watch'));

}());
