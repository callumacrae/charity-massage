'use strict';

const angular = require('angular');
const uiRouter = require('angular-ui-router');

const routes = require('./routes');
require('./admin');
require('./massage');
require('./verify');
require('./tip');

angular.module('massages', [
	uiRouter, 'massages.massages', 'massages.admin', 'massages.verify', 'massages.tip'
]).config(routes);
