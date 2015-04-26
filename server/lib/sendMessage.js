'use strict';

const twilio = require('twilio');

const config = require('../config');
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

module.exports = function sendMessage(msg) {
	msg.from = config.twilio.fromNumber;
	return client.messages.create(msg);
};