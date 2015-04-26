'use strict';

const angular = require('angular');
const verify = angular.module('massages.verify', []);

verify.controller('VerifyController', function ($http, $stateParams, $scope) {
	$scope.time = $stateParams.time;
	$http.post('/api/verify', { time: $stateParams.time });
});
