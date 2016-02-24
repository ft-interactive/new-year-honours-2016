/* eslint-disable no-loop-func */

import 'dotenv/config';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import del from 'del';
import fs from 'fs';
import gulp from 'gulp';
import Handlebars from 'handlebars';
import igdeploy from 'igdeploy';
import mergeStream from 'merge-stream';
import path from 'path';
import runSequence from 'run-sequence';
import source from 'vinyl-source-stream';
import subdir from 'subdir';
import vinylBuffer from 'vinyl-buffer';
import watchify from 'watchify';
import AnsiToHTML from 'ansi-to-html';
import fetch from 'node-fetch';
import mkdirp from 'mkdirp';

const $ = require('auto-plug')('gulp');
const ansiToHTML = new AnsiToHTML();

const AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ff >= 30',
  'chrome >= 34',
];

const DEPLOY_TARGET = 'sites/new-year-honours-2016'; // e.g. 'features/YOUR-PROJECT-NAME'

const BROWSERIFY_ENTRIES = [
  'scripts/main.js',
];

const BROWSERIFY_TRANSFORMS = [
  'babelify',
  'debowerify',
];

const OTHER_SCRIPTS = [
  'scripts/top.js'
];

let env = 'development';

// function to get an array of objects that handle browserifying
function getBundlers(useWatchify) {
  return BROWSERIFY_ENTRIES.map(entry => {
    var bundler = {
      b: browserify(path.posix.resolve('client', entry), {
        cache: {},
        packageCache: {},
        fullPaths: useWatchify,
        debug: useWatchify
      }),

      execute: function () {
        var stream = this.b.bundle()
          .on('error', function (error) {
            handleBuildError.call(this, 'Error building JavaScript', error);
          })
          .pipe(source(entry.replace(/\.js$/, '.bundle.js')));

        // skip sourcemap creation if we're in 'serve' mode
        if (useWatchify) {
          stream = stream
            .pipe(vinylBuffer())
            .pipe($.sourcemaps.init({loadMaps: true}))
            .pipe($.sourcemaps.write('./'));
        }

        return stream.pipe(gulp.dest('.tmp'));
      }
    };

    // register all the transforms
    BROWSERIFY_TRANSFORMS.forEach(function (transform) {
      bundler.b.transform(transform);
    });

    // upgrade to watchify if we're in 'serve' mode
    if (useWatchify) {
      bundler.b = watchify(bundler.b);
      bundler.b.on('update', function (files) {
        // re-run the bundler then reload the browser
        bundler.execute().on('end', reload);

        // also report any linting errors in the changed file(s)
        gulp.src(files.filter(file => subdir(path.resolve('client'), file))) // skip bower/npm modules
          .pipe($.eslint())
          .pipe($.eslint.format());
      });
    }

    return bundler;
  });
}

// function slugify(value) {
//   return value.toLowerCase().trim().replace(/ /g, '-').replace(/['\(\)]/g, '');
// }

// compresses images (client => dist)
gulp.task('compress-images', () => gulp.src('client/**/*.{jpg,png,gif,svg}')
  .pipe($.imagemin({
    progressive: true,
    interlaced: true,
  }))
  .pipe(gulp.dest('dist'))
);

// minifies JS (.tmp => dist)
gulp.task('minify-js', () => gulp.src('.tmp/**/*.js')
  .pipe($.uglify({output: {inline_script: true}})) // eslint-disable-line camelcase
  .pipe(gulp.dest('dist'))
);

// minifies CSS (.tmp => dist)
gulp.task('minify-css', () => gulp.src('.tmp/**/*.css')
  .pipe($.minifyCss({compatibility: '*'}))
  .pipe(gulp.dest('dist'))
);

// copies over miscellaneous files (client => dist)
gulp.task('copy-misc-files', () => gulp.src(
  [
    'client/**/*',
    '!client/**/*.{html,scss,js,jpg,png,gif,svg,hbs}', // all handled by other tasks,
  ], {dot: true})
  .pipe(gulp.dest('dist'))
);

// inlines short scripts/styles and minifies HTML (dist => dist)
gulp.task('finalise-html', done => {
  gulp.src('.tmp/**/*.html')
    .pipe(gulp.dest('dist'))
    .on('end', () => {
      gulp.src('dist/**/*.html')
        .pipe($.smoosher())
        // .pipe($.minifyHtml())
        .pipe(gulp.dest('dist'))
        .on('end', done);
    });
});

// clears out the dist and .tmp folders
gulp.task('clean', del.bind(null, ['.tmp/*', 'dist/*', '!dist/.git'], {dot: true}));

// // runs a development server (serving up .tmp and client)
gulp.task('serve', ['download-data', 'styles'], function (done) {
  var bundlers = getBundlers(true);

  // execute all the bundlers once, up front
  var initialBundles = mergeStream(bundlers.map(function (bundler) {
    return bundler.execute();
  }));
  initialBundles.resume(); // (otherwise never emits 'end')

  initialBundles.on('end', function () {
    // use browsersync to serve up the development app
    browserSync({
      server: {
        baseDir: ['.tmp', 'client'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    // refresh browser after other changes
    gulp.watch(['client/styles/**/*.{scss,css}'], ['styles', reload]);
    gulp.watch(['client/images/**/*'], reload);

    gulp.watch(['./client/**/*.hbs', 'client/words.json'], () => {
      runSequence('templates', reload);
    });

    runSequence('templates', done);
  });
});

// builds and serves up the 'dist' directory
gulp.task('serve:dist', ['build'], done => {
  require('browser-sync').create().init({
    open: false,
    notify: false,
    server: 'dist',
  }, done);
});

// preprocess/copy scripts (client => .tmp)
// (this is part of prod build task; not used during serve)
gulp.task('scripts', () => mergeStream([
  // bundle browserify entries
  getBundlers().map(bundler => bundler.execute()),
  // also copy over 'other' scripts
  gulp.src(OTHER_SCRIPTS.map(script => 'client{/_hack,}/' + script)).pipe(gulp.dest('.tmp'))
]));

// builds stylesheets with sass/autoprefixer
gulp.task('styles', () => gulp.src('client/**/*.scss')
  .pipe($.sourcemaps.init())
  .pipe($.sass({includePaths: 'bower_components'})
    .on('error', function (error) {
      handleBuildError.call(this, 'Error building Sass', error);
    })
  )
  .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
  .pipe($.sourcemaps.write('./'))
  .pipe(gulp.dest('.tmp'))
);

// lints JS files
gulp.task('eslint', () => gulp.src('client/scripts/**/*.js')
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.if(env === 'production', $.eslint.failAfterError()))
);

// // lints SCSS files
// gulp.task('scsslint', () => gulp.src('client/styles/**/*.scss')
//   .pipe($.scssLint({bundleExec: true}))
//   .pipe($.if(env === 'production', $.scssLint.failReporter()))
// );

// makes a production build (client => dist)
gulp.task('build', done => {
  env = 'production';

  runSequence(
    // preparatory
    ['clean', /* 'scsslint', 'eslint', */ 'download-data'],
    // preprocessing (client/templates => .tmp)
    ['scripts', 'styles', 'templates'],
    // optimisation (+ copying over misc files) (.tmp/client => dist)
    ['minify-js', 'minify-css', 'compress-images', 'copy-misc-files'],
    // finalise the HTML in dist (by inlining small scripts/stylesheets then minifying the HTML)
    ['finalise-html'],
    done
  );
});

// downloads the data from bertha to client/words.json
const SPREADSHEET_URL = `https://bertha.ig.ft.com/republish/publish/gss/${process.env.SPREADSHEET_KEY}/orders,ranks,recipients,profiles,options`;
gulp.task('download-data', () => fetch(SPREADSHEET_URL)
  .then(res => res.json())
  .then(({orders, ranks, recipients, profiles, options}) => {
    // `orders` will be our primary array – fold the ranks and recipients into it
    for (const order of orders) {
      // add ranks to this order
      order.ranks = ranks
        .filter(rank => rank.order === order.id)
        .map(rank => {
          rank.count = 0;

          // add recipients (in divisions)
          const divisions = {};

          recipients.forEach(recipient => {
            if (recipient.award === rank.male || recipient.award === rank.female) {
              const devisionName = recipient.division || '';
              if (!divisions[devisionName]) divisions[devisionName] = [];
              divisions[devisionName].push(recipient);
              rank.count++;
            }
          });

          rank.divisions = Object.keys(divisions)
            .map(name => ({name, recipients: divisions[name]}))
            .sort((a, b) => {
              if (a.name < b.name) return -1;
              if (a.name > b.name) return 1;
              return 0;
            })
          ;

          return rank;
        })
        .filter(rank => rank.count > 0)
      ;
    }

    orders = orders.filter(order => order.ranks.length > 0);

    // augment profiles with better urls
    profiles.forEach(profile => {
      profile.imageURLEncoded = encodeURIComponent(profile.imageurl);
      delete profile.imageurl; // to avoid confusion
    });

    const optionsObject = {};
    for (const {name, value} of options) optionsObject[name] = value;
    options = optionsObject;

    fs.writeFileSync('client/data.json', JSON.stringify({options, profiles, orders}, null, 2));
  })
);

// task to deploy to the interactive server
gulp.task('deploy', done => {
  if (!DEPLOY_TARGET) {
    console.error('Please specify a DEPLOY_TARGET in your gulpfile!');
    process.exit(1);
  }

  igdeploy({
    src: 'dist',
    destPrefix: '/var/opt/customer/apps/interactive.ftdata.co.uk/var/www/html',
    dest: DEPLOY_TARGET,
  }, error => {
    if (error) return done(error);
    console.log(`Deployed to http://ig.ft.com/${DEPLOY_TARGET}/`);
  });
});

gulp.task('templates', () => {
  Handlebars.registerPartial('top', fs.readFileSync('client/top.hbs', 'utf8'));
  Handlebars.registerPartial('bottom', fs.readFileSync('client/bottom.hbs', 'utf8'));

  const mainPageTemplate = Handlebars.compile(fs.readFileSync('client/main-page.hbs', 'utf8'));

  const {options, profiles, orders} = JSON.parse(fs.readFileSync('client/data.json', 'utf8'));

  const mainPageHtml = mainPageTemplate({
    options, profiles, orders,
    trackingEnv: (env === 'production' ? 'p' : 't'),
  });

  mkdirp.sync('.tmp');
  fs.writeFileSync(`.tmp/index.html`, mainPageHtml);
});

// helpers
let preventNextReload; // hack to keep a BS error notification on the screen
function reload() {
  if (preventNextReload) {
    preventNextReload = false;
    return;
  }

  browserSync.reload();
}

function handleBuildError(headline, error) {
  if (env === 'development') {
    // show in the terminal
    $.util.log(headline, error && error.stack);

    // report it in browser sync
    let report = `<span style="color:red;font-weight:bold;font:bold 20px sans-serif">${headline}</span>`;
    if (error) report += `<pre style="text-align:left;max-width:800px">${ansiToHTML.toHtml(error.stack)}</pre>`;
    browserSync.notify(report, 60 * 60 * 1000);
    preventNextReload = true;

    // allow the sass/js task to end successfully, so the process can continue
    this.emit('end');
  }
  else throw error;
}
