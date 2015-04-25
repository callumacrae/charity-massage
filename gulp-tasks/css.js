'use strict';

const path = require('path');

module.exports = function (gulp, plugins, constants) {
	return function () {
		return gulp.src(path.join(constants.CSS_PATH, 'app.scss'))
			.pipe(plugins.plumber({ errorHandler: constants.ERROR_HANDLER }))
			.pipe(plugins.sourcemaps.init())

			.pipe(plugins.sass())
			.pipe(plugins.autoprefixer())
			.pipe(plugins.minifyCss())

			.pipe(plugins.sourcemaps.write('./'))
			.pipe(gulp.dest(constants.BUILD_PATH));
	};
};
