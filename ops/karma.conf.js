// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-as-promised', 'chai-things'],

    client: {
      mocha: {
        timeout: 5000, // set default mocha spec timeout
      },
    },

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-http-auth/src/http-auth-interceptor.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'client/bower_components/moment/moment.js',
      'client/bower_components/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js',
      'client/bower_components/lodash/lodash.js',
      'client/bower_components/ng-file-upload/ng-file-upload.js',
      'client/bower_components/angular-loading-bar/build/loading-bar.js',
      'client/bower_components/bootstrap-ui-datetime-picker/dist/datetime-picker.js',
      'client/bower_components/angular-scrollable-table/angular-scrollable-table.js',
      'client/bower_components/angularjs-slider/dist/rzslider.js',
      'client/bower_components/AngularJS-Toaster/toaster.js',
      'client/bower_components/clipboard/dist/clipboard.js',
      'client/bower_components/ngclipboard/dist/ngclipboard.js',
      'client/bower_components/isteven-angular-multiselect/isteven-multi-select.js',
      'client/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-socket-io/socket.js',
      'client/bower_components/angular-base64-upload/src/angular-base64-upload.js',
      'client/bower_components/angular-hotkeys-light/angular-hotkeys-light.js',
      'client/bower_components/intl-tel-input/build/js/intlTelInput.js',
      'client/bower_components/ng-intl-tel-input/dist/ng-intl-tel-input.js',
      'client/bower_components/raven-js/dist/raven.js',
      'client/bower_components/angular-raven/angular-raven.js',
      'client/bower_components/socket.io-client/dist/socket.io.js',
      'client/bower_components/ui-select/dist/select.js',
      // endbower
      'client/app/app.js',
      'client/{app,components}/**/*.module.js',
      'client/{app,components}/**/*.js',
      'client/{app,components}/**/*.{jade,html}',
    ],

    preprocessors: {
      '**/*.html': 'ng-html2js',
      '**/*.jade': 'ng-jade2js',
      'client/{app,components}/**/*.js': 'babel',
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/',
    },

    ngJade2JsPreprocessor: {
      stripPrefix: 'client/',
    },

    babelPreprocessor: {
      options: {
        sourceMap: 'inline',
        optional: [
          'es7.classProperties',
        ],
      },
      filename(file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName(file) {
        return file.originalPath;
      },
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // reporter types:
    // - dots
    // - progress (default)
    // - spec (karma-spec-reporter)
    // - junit
    // - growl
    // - coverage
    reporters: ['spec'],

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,
  });
};
