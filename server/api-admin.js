'use strict';

const bluebird = require('bluebird');

const config = require('./config');
const sendMessage = require('./lib/sendMessage');

module.exports = function (app, db) {
	app.post('/api/start', function (req, res) {
		let find = db.massages.find({ time: req.body.time });
		bluebird.promisify(find.toArray.bind(find))()
			.then(function (data) {
				let massage = data[0];

				let exit = `${ config.server.host }:${ app._PORT }/verify/${ massage.time }/JUSTGIVING-DONATION-ID`;
				let donateLink = config.justgiving.url + '/4w350m3/donation/direct/' +
					`charity/${ config.justgiving.charity }?amount=${ massage.bid }&exitUrl=${ exit }`;

				return sendMessage({
					to: massage.tel,
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
};