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
	$scope.data = {};

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

app.factory('massageFactory', function ($q) {
	const factory = {};

	factory.getMassages = function getMassages() {
		return $q(function (resolve) {
			setTimeout(function () {
				resolve({
					massages: [
						{ time: '19:00', name: '', bid: 0 },
						{ time: '19:20', name: 'Dylan', bid: 5 },
						{ time: '19:40', name: 'Callum', bid: 3 },
						{ time: '20:00', name: 'Carl', bid: 5 },
						{ time: '20:20', name: '', bid: 0 },
						{ time: '20:40', name: 'Lillian', bid: 5 },
						{ time: '21:00', name: 'Chad', bid: 20 },
						{ time: '21:20', name: 'Chad', bid: 15 },
						{ time: '21:40', name: '', bid: 0 }
					]
				});
			}, 500);
		});
	};

	factory.bookMassage = function bookMassage() {
		return $q(function (resolve) {
			setTimeout(function () {
				resolve({ success: true });
			}, 500);
		});
	};

	return factory;
});

module.exports = app;
