'use strict';

const angular = require('angular');

let admin = angular.module('massages.admin', ['massages.massages']);

admin.controller('AdminController', function (adminFactory, massageFactory, $scope) {
	$scope.startMassage = function (massage) {
		adminFactory.startMassage(massage)
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

	factory.startMassage = function (massage) {
		return $q(function (resolve) {
			$http.post('/api/start', massage)
				.success(function (data) {
					resolve(data);
				});
		});
	};

	return factory;
});
