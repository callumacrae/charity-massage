'use strict';

const path = require('path');
const browserSync = require('browser-sync');
const chalk = require('chalk');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

function errorHandler(err) {
	browserSync.notify(err.message, 3000);
	plugins.util.log(chalk.red(err.toString()));

	if (process.argv.indexOf('--fail') !== -1) {
		process.exit(1);
	}
}

const ASSET_PATH = 'app/assets';
const constants = {
	ASSET_PATH: ASSET_PATH,
	BUILD_PATH: path.join(ASSET_PATH, 'build'),
	JS_PATH: path.join(ASSET_PATH, 'js'),
	CSS_PATH: path.join(ASSET_PATH, 'css'),
	ERROR_HANDLER: errorHandler,
	PORT: 3055
};

function getTask(taskName) {
	let taskPath = path.join('gulp-tasks', taskName + '.js');
	return require(taskPath)(gulp, plugins, constants);
}

gulp.task('css', getTask('css'));
gulp.task('js', getTask('browserify'));
gulp.task('run', getTask('nodemon'));

gulp.task('build', ['css', 'js']);

gulp.task('default', ['build', 'run'], function () {
	let files = [
		path.join(constants.BUILD_PATH, '**/*.{js,css}'),
		path.join(ASSET_PATH, '**/*.{html,jpg,png}'),
		path.join('./app/partials/*.html')
	];

	browserSync.init(files, {
		proxy: 'http://localhost:' + constants.PORT + '/'
	});

	gulp.watch(path.join(constants.JS_PATH, '*.js'), ['js']);
	gulp.watch(path.join(constants.CSS_PATH, '*.s{a,c}ss'), ['css']);
});
