'use strict';

const angular = require('angular');

let admin = angular.module('massages.admin', ['massages.massages']);

admin.controller('AdminController', function (adminFactory, massageFactory, $scope, $state) {
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
			if (!data.admin) {
				$state.go('login');
			}

			$scope.massages = data.massages;
		});
});

admin.controller('AdminLoginController', function ($scope, $http, $state) {
	$scope.login = function () {
		$http.post('/api/login', { password: $scope.password })
			.success(function (data) {
				if (data.success) {
					$state.go('admin');
				}
			});
	};
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
