'use strict';

const chalk = require('chalk');
const nodemon = require('nodemon');

module.exports = function (gulp, plugins, constants) {
	return function (done) {
		function doneOnce() {
			done();
			doneOnce = function () {}; // jshint ignore: line
		}

		nodemon('--watch server ./server --port ' + constants.PORT)
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
	};
};