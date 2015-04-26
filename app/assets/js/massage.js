'use strict';

const _ = require('lodash');
const angular = require('angular');
const massages = angular.module('massages.massages', []);

massages.controller('MassageController', function (massageFactory, $scope) {
	massageFactory.getMassages()
		.then(function (data) {
			$scope.massages = data.massages;
		});
});

massages.controller('BiddingController', function (massageFactory, $scope, $stateParams, $state) {
	let time = $scope.time = $stateParams.time;
	$scope.data = { time: time };

	$scope.makeBid = function makeBid() {
		massageFactory.bookMassage($scope.data)
			.then(function (data) {
				if (data.success) {
					$scope.booked = true;
				} else {
					$scope.slot = data.currentBid;
					$scope.fail = true;
				}
			});
	};

	massageFactory.getMassages()
		.then(function (data) {
			let slot = $scope.slot = _.find(data.massages, function (massage) {
				return massage.time === time;
			});

			if (slot.claimed) {
				$state.go('massages');
			}

			$scope.data.bid = Math.ceil(slot.bid * 1.4);

			if ($scope.data.bid === 0) {
				$scope.data.bid = 3;
			}
		});
});

massages.factory('massageFactory', function ($q, $http) {
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