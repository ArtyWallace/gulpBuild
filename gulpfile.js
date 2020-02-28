"use strict";

const {src, dest} = require("gulp");
const gulp = require("gulp");
const del = require("del"); // очищает папку
const autoprefixer = require("gulp-autoprefixer"); // проставляет префиксы
const cssbeautify = require("gulp-cssbeautify"); // делает файл CSS красивым ))
const cssnano = require("gulp-cssnano"); // сжимает CSS
const imagemin = require("gulp-imagemin"); // сжимает изображения
const plumber = require("gulp-plumber"); // исправляет ошибки в gulp файле
const rename = require("gulp-rename"); // переименовывает файлы
const rigger = require("gulp-rigger"); // склеивает JS файлы
const sass = require("gulp-sass"); //компилирует SASS в CSS
const removeComments = require("gulp-strip-css-comments"); // удаляет комментарии
const uglify = require("gulp-uglify"); 
const panini = require("panini"); // работа с HTML
const browsersync = require("browser-sync").create(); // локальный сервер

var path = {
    build: {
        html: "dist/",
        js: "dist/assets/js",
        css: "dist/assets/css",
        images: "dist/assets/img"
    },
    src: {
        html: "src/*.html",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.scss",
        images: "src/assets/img/**/*.{.jpg,png,svg,gif,ico}"
    },
    watch: {
        html: "src/**/*.html",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        images: "src/assets/img/**/*.{.jpg,png,svg,gif,ico}"
    },
    clean: "./dist"
}


function browserSync(done) {
    browsersync.init({
        sever: {
            basedir: "./dist/"
        },
        port: 3000
    });
}

function browserSyncReload(done) {
    browsersync.reload();
}

function html() {
    return src(path.src.html, {base: "src/"})
        .pipe(plumber())
        // .pipe(panini({
        //     root: "pages/",
        //     layouts: "layouts/",
        //     partials: "partials/",
        //     helpers: "helpers/",
        //     data: "data/"
        // }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css, {base: "assets/sass/"})
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            Browserslist: ["last 8 versions"],
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js, {base: "./src/assets/js/"})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images));
}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;


