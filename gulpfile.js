'use strict';

const path = require('path');
const babelify = require('babelify');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const chalk = require('chalk');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const nodemon = require('nodemon');
const plugins = require('gulp-load-plugins')();
const source = require('vinyl-source-stream');

const ASSET_PATH = './app/assets';
const BUILD_PATH = path.join(ASSET_PATH, 'build');

function errorHandler(err) {
	browserSync.notify(err.message, 3000);
	plugins.util.log(chalk.red(err.toString()));

	if (process.argv.indexOf('--fail') !== -1) {
		process.exit(1);
	}
}

gulp.task('css', function () {
	return gulp.src(path.join(ASSET_PATH, 'css/app.scss'))
		.pipe(plugins.plumber({ errorHandler: errorHandler }))
		.pipe(plugins.sourcemaps.init())

		.pipe(plugins.sass())
		.pipe(plugins.autoprefixer())
		.pipe(plugins.minifyCss())

		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(BUILD_PATH));
});

gulp.task('js', function () {
	var b = browserify({
		entries: './' + path.join(ASSET_PATH, 'js/app.js'),
		debug: true,
		transform: [babelify]
	});

	return b.bundle()
		.on('error', errorHandler)
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(plugins.plumber({ errorHandler: errorHandler }))
		.pipe(plugins.sourcemaps.init({ loadMaps: true }))

		.pipe(plugins.uglify())

		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(BUILD_PATH));
});

gulp.task('build', ['css', 'js']);

gulp.task('run', function (done) {
	function doneOnce() {
		done();
		doneOnce = function () {};
	}

	nodemon('--watch server ./server --port 3055')
		.on('start', function () {
			console.log(chalk.grey('App has started'));
			doneOnce();
		})
		.on('restart', function () {
			console.log(chalk.grey('App restarting'));
		})
		.on('crash', function () {
			console.log(chalk.grey('App has crashed'));
		});
});

gulp.task('default', ['build', 'run'], function () {
	let files = [
		path.join(ASSET_PATH, 'build/**/*.{js,css}')
	];

	browserSync.init(files, {
		proxy: 'http://localhost:3055/'
	});

	gulp.watch('./app/assets/js/*.js', ['js']);
});
