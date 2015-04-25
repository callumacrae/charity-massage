'use strict';

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const errorHandler = require('errorhandler');
const bluebird = require('bluebird');
const app = express();

app.use('/assets', express.static('app/assets'));
app.use('/partials', express.static('app/partials'));

app.use(function (req, res) {
	res.sendFile(path.join(__dirname, '../app/index.html'));
});

let env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	app.use(errorHandler());
}

let serverPromise = bluebird.promisify(app.listen.bind(app))(argv.port || 3000);

bluebird.join(serverPromise)
	.then(function () {
		console.log('Server started on port %s!', argv.port);
	})
	.catch(function () {
		console.log('Failed to start :(');
		process.exit(1);
	});
