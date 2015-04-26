'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const got = bluebird.promisify(require('got'));
const config = require('./config');
const sendMessage = require('./lib/sendMessage');

module.exports = function (app, db) {
	app.get('/api', function (req, res) {
		db.massages.find().toArray(function (err, data) {
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

		db.massages.find({ time: newBid.time }).toArray(function (err, data) {
			if (err) {
				return res.status(500).send(err);
			}

			let currentBid = data[0];

			if (newBid.bid <= currentBid.bid) {
				return res.send({ success: false, currentBid: currentBid });
			}

			db.massages.update({ time: newBid.time }, newBid, function (err) {
				if (err) {
					return res.status(500).send(err);
				}

				res.send({ success: true });

				// If someone was outbid, let them know
				if (currentBid.tel && currentBid.name) {
					let url = config.server.host + (app._PORT !== 80 ? ':' + app._PORT : '');

					sendMessage({
						to: currentBid.tel,
						body: `Hey ${ currentBid.name }! You bid on the ${ currentBid.time } massage, ` +
						`but unfortunately ${ newBid.name } outbid you with £${ newBid.bid }. ` +
						`Visit ${ url } to rebid!`
					});
				}
			});
		});
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

				let find = db.massages.find({ time: time});
				return bluebird.promisify(find.toArray.bind(find))();
			})
			.then(function (data) {
				if (actualAmount >= data[0].bid) {
					db.massages.update({ time: time }, { $set: { claimed: true } }, function () {
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
};