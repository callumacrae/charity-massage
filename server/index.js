'use strict';

const argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const bluebird = require('bluebird');
const app = express();

app.use(express.static('app'));

let serverPromise = bluebird.promisify(app.listen.bind(app))(argv.port || 3000);

bluebird.join(serverPromise)
	.then(function () {
		console.log('Server started on port %s!', argv.port);
	})
	.catch(function () {
		console.log('Failed to start :(');
		process.exit(1);
	});
