'use strict';

const path = require('path');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

module.exports = function (gulp, plugins, constants) {
	return function () {
		var b = browserify({
			entries: './' + path.join(constants.ASSET_PATH, 'js/app.js'),
			debug: true,
			transform: [babelify]
		});

		return b.bundle()
			.on('error', constants.ERROR_HANDLER)
			.pipe(source('app.js'))
			.pipe(buffer())
			.pipe(plugins.plumber({ errorHandler: constants.ERROR_HANDLER }))
			.pipe(plugins.sourcemaps.init({ loadMaps: true }))

			.pipe(plugins.uglify())

			.pipe(plugins.sourcemaps.write('./'))
			.pipe(gulp.dest(constants.BUILD_PATH));
	};
};