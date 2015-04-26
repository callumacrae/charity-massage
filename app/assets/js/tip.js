/* global braintree */

'use strict';

const angular = require('angular');
const massages = angular.module('massages.tip', []);

massages.controller('TipController', function (massageFactory, $scope, $http) {
	$http.get('/api/braintree')
		.success(function (data) {
			braintree.setup(data.clientToken, 'dropin', {
				container: 'dropin',
				onPaymentMethodReceived: function (data) {
					data.tip = $scope.tip;

					$http.post('/api/braintree', data)
						.success(function (data) {
							$scope.tipped = data.success;
						});
				}
			});
		});
});
