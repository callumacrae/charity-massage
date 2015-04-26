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
const session = require('express-session');
const twilio = require('twilio');
const yaml = require('js-yaml');

const app = express();
const config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

const PORT = argv.port || config.server.port;

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
			massages: _.sortBy(filteredData, 'time'),
			admin: req.session.loggedIn
		});
	});
});

app.post('/api', function (req, res) {
	let newBid = req.body;

	collection.find({ time: newBid.time }).toArray(function (err, data) {
		if (err) {
			return res.status(500).send(err);
		}

		let currentBid = data[0];

		if (newBid.bid <= currentBid.bid) {
			return res.send({ success: false, currentBid: currentBid });
		}

		collection.update({ time: newBid.time }, newBid, function (err) {
			if (err) {
				return res.status(500).send(err);
			}

			res.send({ success: true });

			// If someone was outbid, let them know
			if (currentBid.tel && currentBid.name) {
				let url = config.server.host + (PORT !== 80 ? ':' + PORT : '');

				client.messages.create({
					to: currentBid.tel,
					from: config.twilio.fromNumber,
					body: `Hey ${ currentBid.name }! You bid on the ${ currentBid.time } massage, ` +
						`but unfortunately ${ newBid.name } outbid you with £${ newBid.bid }. ` +
						`Visit ${ url } to rebid!`
				});
			}
		});
	});
});

app.post('/api/start', function (req, res) {
	let find = collection.find({ time: req.body.time });
	bluebird.promisify(find.toArray.bind(find))()
		.then(function (data) {
			let massage = data[0];

			let exit = `${ config.server }:${ PORT }/verify/${ massage.time }/JUSTGIVING-DONATION-ID`;
			let donateLink = config.justgiving.url + '/4w350m3/donation/direct/' +
				`charity/${ config.justgiving.charity }?amount=${ massage.bid }&exitUrl=${ exit }`;

			return client.messages.create({
				to: massage.tel,
				from: config.twilio.fromNumber,
				body: `Hey ${ massage.name }, it's time for your massage! Please` +
					`make your donation (£${ massage.bid }) here: ${ donateLink }`
			});
		})
		.then(function () {
			res.send({ success: true });
		})
		.catch(function (err) {
			return res.status(500).send(err);
		});
});

app.post('/api/login', function (req, res) {
	let loginCorrect = (req.body.password === config.password);
	if (loginCorrect) {
		req.session.loggedIn = true;
	}

	res.send({ success: loginCorrect });
});

app.get('/api/logout', function (req, res) {
	req.session.loggedIn = false;
	res.send({ success: true });
});

app.post('/api/verify', function (req, res) {
	if (!req.session.loggedIn) {
		return res.send({ success: false, login: true });
	}

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

let serverPromise = bluebird.promisify(app.listen.bind(app))(PORT);

bluebird.join(mongoPromise, serverPromise)
	.then(function () {
		console.log('Server started on port %s!', PORT);
	})
	.catch(function () {
		console.log('Failed to start :(');
		process.exit(1);
	});
