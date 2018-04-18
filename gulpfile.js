"use strict";

/*-----------------------
*   Подключение плагинов
-------------------------*/
var gulp           = require('gulp'),
    sourcemaps     = require('gulp-sourcemaps'), // создание файла для удобной отладки
    sass           = require('gulp-sass'),  // компиляция sass-файлов
    notify         = require('gulp-notify'),  // вывод окошка с ошибками
    autoprefixer   = require('gulp-autoprefixer'), // добавление автопрефиксов
    cssnano        = require('gulp-cssnano'), // минификация стилей
    concat         = require('gulp-concat'),  // объединение стилей или скриптов
    rename         = require('gulp-rename'), // переименование файлов
    clean          = require('gulp-clean'), // удаление файлов или папок
    plumber        = require('gulp-plumber'), // ловля ошибок
    uglify         = require('gulp-uglify'),  // минификация скриптов
    browserSync    = require('browser-sync').create(),  // запуск сервера и автоперезагрузка страниц
    filter         = require('gulp-filter'),  // отбор по фильтру нужных файлов
    mainBowerFiles = require('main-bower-files'), // поиск bower-файлов
    imagemin       = require('gulp-imagemin'),  // оптимизация изображений
    cache          = require('gulp-cache'), // кэширование файлов
    rev            = require('gulp-rev-append'),  // замена стилей и скриптов, закэшированных в браузере
    pug            = require('gulp-pug'); // компиляция pug-файлов

/*-----------------------
*   Указание директорий
-------------------------*/
var DEV_DIR = './_dev/',
    PROD_DIR = './_prod/';

var path = {

  pug: {
    entry: DEV_DIR + '*.pug',
    src: DEV_DIR + '**/*.pug',
    dist: PROD_DIR
  },

  sass: {
    entry: DEV_DIR + 'css/styles.scss',
    src: DEV_DIR + 'css/**/*.scss',
    dist: PROD_DIR + 'css'
  },

  js: {
    src: DEV_DIR + 'js/**/*.js',
    dist: PROD_DIR + 'js'
  },

  fonts: {
    src: DEV_DIR + 'fonts/**/*.*',
    dist: PROD_DIR + 'fonts'
  },

  images: {
    src: DEV_DIR + 'images/**/*.*',
    dist: PROD_DIR + 'images'
  },

  all: {
    src: DEV_DIR + '**/*.*'
  },

  html: {
    entry: PROD_DIR + '*.html',
    dist: PROD_DIR
  }

};

var bower_paths = mainBowerFiles({
  paths: {
    bowerDirectory: './bower_components',
    bowerrc: './.bowerrc',
    bowerJson: './bower.json'
  }
});


/*------------------------
*   Указание задач
---------------------------*/

// Запуск по умолчанию режима разработчика по команде Gulp 
gulp.task('default', ['clean'], function() {
  gulp.run('dev');
});

// Запуск продакшн сборки
gulp.task('prod', ['clean'], function() {
  gulp.run('build');
});

// Запуск режима разработчика
gulp.task('dev', ['build', 'watch', 'browser-sync']);

// Запуск сборки проекта
gulp.task('build', ['pug', 'styles', 'styles:vendor', 'scripts', 'scripts:vendor', 'fonts', 'images']);

// Слежка за изменением файлов в проекте и если это произошло, то запускаются соответствующие задачи
gulp.task('watch', function() {
  gulp.watch(path.pug.src, ['pug']);
  gulp.watch(path.sass.src, ['styles']);
  gulp.watch(path.js.src, ['scripts']);
  gulp.watch('./bower.json', ['styles:vendor', 'scripts:vendor']);
  gulp.watch(path.fonts.src, ['fonts']);
  gulp.watch(path.images.src, ['images']);
  gulp.watch(path.all.src).on('change', browserSync.reload);
});

// Сборка и перемещение pug-файлов 
gulp.task('pug', function() {
  return gulp.src(path.pug.entry)
    .pipe(pug({
        pretty: '\t'
    }))
    .pipe(gulp.dest(path.pug.dist));
});

// Сборка и перемещение стилей
gulp.task('styles', function() {
  return gulp.src(path.sass.entry)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cssnano())
    .pipe(rename({
      basename: "main",
      suffix: ".min"
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.sass.dist));
});

// Сборка и перемещение Вендорных стилей
gulp.task('styles:vendor', function () {
  return gulp.src(bower_paths)
    .pipe(filter(['**/*.css']))
    .pipe(concat('vendor.css'))
    .pipe(cssnano())
    .pipe(gulp.dest(path.sass.dist));
});

// Сборка и перемещение скриптов
gulp.task('scripts', function() {
  return gulp.src(path.js.src)
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title:   'ErrorScript',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.js.dist));
});

// Сборка и перемещение Вендорных скриптов
gulp.task('scripts:vendor', function () {
  return gulp.src(bower_paths)
    .pipe(filter(['**/*.js']))
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.js.dist));
});

// Перемещение шрифтов
gulp.task('fonts', function() {
  return gulp.src(path.fonts.src)
    .pipe(gulp.dest(path.fonts.dist));
});

// Оптимизация и перемещение изображений
gulp.task('images', function() {
  return gulp.src(path.images.src)
    .pipe(cache(imagemin({
      interlaced: true,
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    })))
    .pipe(gulp.dest(path.images.dist));
});

// Запуск сервера
gulp.task('browser-sync', function() {
  return browserSync.init({
    reloadDelay: 1000,  
    server: {
      baseDir: PROD_DIR
    }
  });
});

// Удаление продакшн директории
gulp.task('clean', function() {
  return gulp.src(PROD_DIR)
    .pipe(clean());
});

// Запуск очистку кэша (запускается вручную)
gulp.task('clearcache', function() {
  return cache.clearAll();
});

// Запуск замены стилей и скриптов, которые закэшированы в браузере (запускается вручную)
gulp.task('revAll', function() {
  gulp.src(path.html.entry)
    .pipe(rev())
    .pipe(gulp.dest(path.html.dist));
});

