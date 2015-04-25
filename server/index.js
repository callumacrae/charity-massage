'use strict';

const argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const app = express();

app.use(express.static('app'));

app.listen(argv.port || 3000, function (err) {
	if (err) {
		throw err;
	}

	console.log('Server started on port %s!', argv.port);
});
