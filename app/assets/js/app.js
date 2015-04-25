'use strict';

const _ = require('lodash');
const angular = require('angular');
const uiRouter = require('angular-ui-router');

const routes = require('./routes');

let app = angular.module('massages', [uiRouter])
	.config(routes);

app.controller('MassageController', function (massageFactory, $scope) {
	massageFactory.getMassages()
		.then(function (data) {
			$scope.massages = data.massages;
		});
});

app.controller('BiddingController', function (massageFactory, $scope, $stateParams) {
	let time = $scope.time = $stateParams.time;
	$scope.data = { time: time };

	$scope.makeBid = function makeBid() {
		massageFactory.bookMassage($scope.data)
			.then(function (data) {
				if (data.success) {
					$scope.booked = true;
				}
			});
	};

	massageFactory.getMassages()
		.then(function (data) {
			$scope.slot = _.find(data.massages, function (massage) {
				return massage.time === time;
			});

			$scope.data.bid = Math.ceil($scope.slot.bid * 1.4);

			if ($scope.data.bid === 0) {
				$scope.data.bid = 3;
			}
		});
});

app.factory('massageFactory', function ($q, $http) {
	const factory = {};

	factory.getMassages = function getMassages() {
		// What the fuck?
		return $q(function (resolve) {
			$http.get('/api')
				.success(function (data) {
					resolve(data);
				});
		});
	};

	factory.bookMassage = function bookMassage(data) {
		return $q(function (resolve) {
			$http.post('/api', data)
				.success(function (data) {
					resolve(data);
				});
		});
	};

	return factory;
});

module.exports = app;
