import gulp from 'gulp';
import mocha from 'gulp-mocha';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import nodemon from 'gulp-nodemon';
import bower from 'gulp-bower';
import sass from 'gulp-sass';
import browserSync from 'browser-sync';
import {Server} from 'karma';
require('dotenv').config({ path: '.env' });


// Lint task
gulp.task('lint', function() {
    gulp.src(['public/js/**',
     'app/**/*.js',
     'gulpfile.js',
     'test/**/*.js'
    ])
    .pipe(eslint());
})

// Install packages into the bower_components directory from bower.json
gulp.task('bower', function() {
    return bower();
});

gulp.task('angular', function() {
    gulp.src('bower_components/angular/angular.js')
        .pipe(gulp.dest('./build/public/lib/angular'));
});

gulp.task('angular-bootstrap', function() {
    gulp.src('bower_components/angular-bootstrap/ui-bootstrap-tpls.js')
        .pipe(gulp.dest('./build/public/lib/angular-bootstrap'));
});

gulp.task('angular-ui-utils', function() {
    gulp.src('bower_components/angular-ui-utils/modules/route.js')
        .pipe(gulp.dest('./build/public/lib/angular-ui-utils/modules'));
});

gulp.task('bootstrap', function() {
    gulp.src('bower_components/bootstrap/dist/**')
        .pipe(gulp.dest('./build/public/lib/bootstrap'));
});

gulp.task('jquery', function() {
    gulp.src('bower_components/jquery/**/*')
        .pipe(gulp.dest('./build/public/lib/jquery'));
});

gulp.task('underscore', function() {
    gulp.src('bower_components/underscore/**/*')
        .pipe(gulp.dest('./build/public/lib/underscore'));
});
// gulp.task('materialize', function() {
//   gulp
//     .src('bower_components/materialize/**/*')
//     .pipe(gulp.dest('./build/public/lib/materialize'));
// });
// Build sass
gulp.task('sass', function() {
    gulp.src('public/css/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/public/css'))
})

gulp.task('start', function () {
    nodemon({
      script: 'server.js', 
      ext: 'js',
      env: { 'NODE_ENV': 'development' },
      ignore: ['README.md', 'node_modules/**', '.DS_Store'],
      watch: ['app', 'config'],
      env: {
        PORT: process.env.PORT
    },

    })
});

// create build for js folder in public
gulp.task('js', function() {
    gulp.src('public/js/**')
        .pipe(gulp.dest('./build/public/js'))
})

// copy root env file to build
gulp.task('root-env', function() {
    gulp.src('.env')
    .pipe(gulp.dest('./build'))
})

// create build for env folder
gulp.task('env', function() {
    gulp.src('config/env/*.js')
      .pipe(gulp.dest('./build/config/env'));
});

// create build for views folder in public
gulp.task('jade', function() {
    gulp.src('app/views/**')
        .pipe(gulp.dest('./build/app/views'))
})

// create build for json files in public
gulp.task('json', function() {
    gulp.src('config/env/*.json')
        .pipe(gulp.dest('./build/config/env'))
})

// run test files for backend
gulp.task('mochaTest', function() {
    gulp.src('test/**/*.js')
        .pipe(mocha({
            reporter: 'spec',
            exit: true 
        }))
})

gulp.task('karmaTest', function (done) {
    new Server({
      configFile: __dirname + 'test/karma.conf.js',
      singleRun: true
    }, done).start();
});

// Watch files for changes
gulp.task('watch', function() {
    gulp.watch('app/views/**', browserSync.reload() );
    gulp.watch(['public/js/**', 'app/**/*.js'], browserSync.reload());
    gulp.watch('public/views/**', browserSync.reload());
    gulp.watch(['public/css/common.scss, public/css/views/articles.scss'], ['sass:dist']);
    gulp.watch('public/css/**', ['sass']);
})
// Build bower_component
gulp.task('buildBowerComponent', ['angular', 
    'angular-bootstrap',
    'angular-ui-utils',
    'bootstrap',
    'jquery',
    'underscore',
])

gulp.task('generate', ['build', 'public-not-js', 'buildBowerComponent', 'root-env', 'babel'])

//Default task(s).
gulp.task('default', ['start'])

// Build task
gulp.task('build', ['buildBowerComponent',
    'jade',
    'env',
    'json',
    'js',
    'sass'
])

//Backend test task.
gulp.task('test', ['mochaTest'])

//Front test task.
gulp.task('test:client', ['karmaTest'])

gulp.task('babel', function() {
    gulp.src(['./**/*.js',
    '!build/**',
    '!public/js/**',
    '!public/lib/**',
    '!gulpfile.babel.js',
    '!node_modules/**',
    '!bower_components/**/*',
    ])
    .pipe(babel())
    .pipe(gulp.dest('./build'));
})
  

// transfer public non-js file to build/public
gulp.task('public-not-js', () => {
  gulp.src(['public/**/*', '!public/js/**'])
    .pipe(gulp.dest('build/public'));
})
