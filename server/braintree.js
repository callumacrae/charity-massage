'use strict';

const braintree = require('braintree');
const bodyParser = require('body-parser');

const gateway = braintree.connect({
	environment: braintree.Environment.Sandbox,
	merchantId: 'h5yr4468wtgzp9p4',
	publicKey: 'nq4ds2yws2qf632g',
	privateKey: 'd35567e1490f4844591134c85edfd309'
});

module.exports = function (app) {
	app.get('/api/braintree', function (req, res) {
		gateway.clientToken.generate({}, function (err, response) {
			if (err) {
				return res.status(500).send(err);
			}

			res.send({ clientToken: response.clientToken });
		});
	});

	let urlencodedParser = bodyParser.urlencoded({ extended: false });

	app.post('/api/braintree', urlencodedParser, function (req, res) {
		gateway.transaction.sale({
			amount: req.body.tip,
			paymentMethodNonce: 'nonce-from-the-client'
		}, function (err, result) {
			if (err) {
				return res.status(500).send(err);
			}

			console.log(result);

			res.send({ success: result.success });
		});
	});
};
