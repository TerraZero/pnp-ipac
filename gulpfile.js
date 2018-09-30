const gulp = require('gulp');

const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const glob = require('glob');

const sass = require('gulp-sass');
const pug = require('gulp-pug');

const files = {
  pug: {
    src: ['pug/**/*.pug', '!pug/**/_*.pug'],
    dest: 'web',
    watch: 'pug/**/*.pug',
  },
  sass: {
    src: ['sass/**/*.sass', '!sass/**/_*.sass'],
    dest: 'web/css',
    watch: 'sass/**/*.sass',
  },
  js: {
    src: ['js/**/*.js', 'node_modules/vue/dist/vue.min.js'],
    dest: 'web/js',
    watch: 'js/**/*.js',
  },
  images: {
    src: 'files/img/**/*.*',
    dest: 'web/img',
  },
};

gulp.task('pug', function () {
  const locals = {
    classes: glob.sync('js/**/*.js', {
      ignore: 'js/**/_*.js',
    }).map((v) => {
      return '/' + v;
    }),
  };

  return gulp.src(files.pug.src)
    .pipe(pug({
      locals: locals,
    }))
    .pipe(gulp.dest(files.pug.dest));
});

gulp.task('sass', function () {
  return gulp.src(files.sass.src)
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(files.sass.dest));
});

gulp.task('js', function () {
  return gulp.src(files.js.src)
    .pipe(gulp.dest(files.js.dest));
});

gulp.task('image', function () {
  return gulp.src(files.images.src)
    .pipe(gulp.dest(files.images.dest));
});

gulp.task('watch', ['default'], function () {
  for (const name in files) {
    gulp.watch(files[name].watch, [name]);
  }
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: './web',
    },
  });
});

gulp.task('watch:serve', ['serve', 'watch']);

gulp.task('default', ['pug', 'sass', 'js', 'image']);
