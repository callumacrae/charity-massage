'use strict';

const angular = require('angular');
const forfeits = angular.module('score.forfeits', []);

forfeits.controller('ForfeitController', function (forfeitFactory, $scope) {
	$scope.addForfeit = function (forfeit) {
		forfeitFactory.addForfeit(forfeit.forfeit);
	};

	forfeitFactory.getForfeits()
		.then(function (data) {
			$scope.forfeits = data.forfeits;
			$scope.total = data.total;
		});
});

forfeits.factory('forfeitFactory', function ($q) {
	const factory = {};

	factory.getForfeits = function () {
		return $q(function (resolve) {
			setTimeout(function () {
				resolve({
					forfeits: [
						{ name: 'Swore', forfeit: 1 },
						{ name: 'Left washing out', forfeit: 2 },
						{ name: 'Missed a deadline', forfeit: 3 }
					],
					total: 20
				});
			}, 500);
		});
	};

	factory.addForfeit = function (forfeit) {
		console.log(forfeit);

		return $q(function (resolve) {
			setTimeout(function () {
				resolve({ success: true });
			}, 500);
		});
	};

	return factory;
});

module.exports = forfeits;