'use strict';

const path = require('path');
const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();

let env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	app.use(errorHandler());
}

let collection;
let mongoConnect = bluebird.promisify(MongoClient.connect);
let mongoPromise = mongoConnect('mongodb://localhost:27017/massages')
	.then(function (db) {
		collection = db.collection('massages');
	});

app.get('/api', function (req, res) {
	collection.find().toArray(function (err, data) {
		if (err) {
			return res.status(500).send(err);
		}

		let filteredData = _.map(data, function (massage) {
			return {
				time: massage.time,
				name: massage.name,
				bid: massage.bid
			};
		});

		res.send({
			massages: _.sortBy(filteredData, 'time')
		});
	});
});

app.use(bodyParser.json());
app.post('/api', function (req, res) {
	let data = req.body;

	// YOLO YOLO MVP MVP
	collection.update({ time: data.time }, data, function (err) {
		if (err) {
			return res.status(500).send(err);
		}

		res.send({ success: true });
	});
});

app.use('/assets', express.static('app/assets'));
app.use('/partials', express.static('app/partials'));

app.use(function (req, res) {
	res.sendFile(path.join(__dirname, '../app/index.html'));
});

let serverPromise = bluebird.promisify(app.listen.bind(app))(argv.port || 3000);

bluebird.join(mongoPromise, serverPromise)
	.then(function () {
		console.log('Server started on port %s!', argv.port);
	})
	.catch(function () {
		console.log('Failed to start :(');
		process.exit(1);
	});
