'use strict';

const path = require('path');
const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const express = require('express');
const fs = require('graceful-fs');
const got = bluebird.promisify(require('got'));
const MongoClient = require('mongodb').MongoClient;
const twilio = require('twilio');
const yaml = require('js-yaml');

const app = express();
const config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

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
				bid: massage.bid,
				claimed: massage.claimed || false
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

app.post('/api/start', function (req, res) {
	let find = collection.find({ time: req.body.time });
	bluebird.promisify(find.toArray.bind(find))()
		.then(function (data) {
			let massage = data[0];

			let exit = 'http://localhost:3000/verify/' + massage.time + '/JUSTGIVING-DONATION-ID';
			let donateLink = config.justgiving.url + '/4w350m3/donation/direct/' +
				`charity/${config.justgiving.charity}?amount=${massage.bid}&exitUrl=${exit}`;

			return client.messages.create({
				to: massage.tel,
				from: config.twilio.fromNumber,
				body: `It's time for your massage! Please make your donation (£${massage.bid}) here: ${donateLink}`
			});
		})
		.then(function () {
			res.send({ success: true });
		})
		.catch(function (err) {
			return res.status(500).send(err);
		});
});

app.post('/api/verify', function (req, res) {
	let time = req.body.time;

	let actualAmount;

	let url = config.justgiving.apiUrl + '/' + config.justgiving.appId +
		'/v1/donation/' + req.body.donationId;

	got(url, { headers: { 'Content-type': 'application/json' }, json: true })
		.then(function (data) {
			actualAmount = parseInt(data[0].amount);

			let find = collection.find({ time: time});
			return bluebird.promisify(find.toArray.bind(find))();
		})
		.then(function (data) {
			if (actualAmount >= data[0].bid) {
				collection.update({ time: time }, { $set: { claimed: true } }, function () {
					res.send({ success: true });
				});
			} else {
				res.send({ success: false });
			}
		})
		.catch(function (err) {
			console.error(err);
			res.send({ success: false });
		});
});

app.use('/assets', express.static('app/assets'));
app.use('/partials', express.static('app/partials'));

app.use(function (req, res) {
	res.sendFile(path.join(__dirname, '../app/index.html'));
});

let port = argv.port || config.server.port;
let serverPromise = bluebird.promisify(app.listen.bind(app))(port);

bluebird.join(mongoPromise, serverPromise)
	.then(function () {
		console.log('Server started on port %s!', argv.port);
	})
	.catch(function () {
		console.log('Failed to start :(');
		process.exit(1);
	});
