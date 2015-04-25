'use strict';

const angular = require('angular');
const uiRouter = require('angular-ui-router');

const routes = require('./routes');
require('./admin');
require('./massage');

angular.module('massages', [uiRouter, 'massages.massages', 'massages.admin'])
	.config(routes);
