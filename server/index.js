'use strict';

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');

const app = express();
const config = require('./config');
const PORT = app._PORT = argv.port || config.server.port;

let env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	app.use(errorHandler());
}

app.use(bodyParser.json());
app.use(session({
	secret: config.server.sessionSecret,
	resave: false,
	saveUninitialized: true
}));

const db = {};
let mongoConnect = bluebird.promisify(MongoClient.connect);
let mongoPromise = mongoConnect('mongodb://localhost:27017/massages')
	.then(function (mongo) {
		db.massages = mongo.collection('massages');
	});

require('./api')(app, db);
require('./api-admin')(app, db);
require('./braintree')(app, db);

app.use('/assets', express.static('app/assets'));
app.use('/partials', express.static('app/partials'));

app.use(function (req, res) {
	res.sendFile(path.join(__dirname, '../app/index.html'));
});

let serverPromise = bluebird.promisify(app.listen.bind(app))(PORT);

bluebird.join(mongoPromise, serverPromise)
	.then(function () {
		console.log('Server started on port %s!', PORT);
	})
	.catch(function () {
		console.log('Failed to start :(');
		process.exit(1);
	});
