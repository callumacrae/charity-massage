'use strict';

const angular = require('angular');

let admin = angular.module('massages.admin', ['massages.massages']);

admin.controller('AdminController', function (adminFactory, massageFactory, $scope) {
	$scope.startMassage = function (massage) {
		adminFactory.startMassage(massage.time)
			.then(function (data) {
				if (data.success) {
					massage.started = true;
				}
			});
	};

	massageFactory.getMassages()
		.then(function (data) {
			$scope.massages = data.massages;
		});
});

admin.factory('adminFactory', function ($q, $http) {
	const factory = {};

	factory.startMassage = function (time) {
		return $q(function (resolve) {
			$http.post('/api/start', { time: time })
				.success(function (data) {
					resolve(data);
				});
		});
	};

	return factory;
});