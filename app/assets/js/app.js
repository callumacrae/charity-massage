const angular = require('angular');
const uiRouter = require('angular-ui-router');

const routes = require('./routes');

require('./forfeits');

let app = angular.module('score', [uiRouter, 'score.forfeits'])
	.config(routes);

module.exports = app;
