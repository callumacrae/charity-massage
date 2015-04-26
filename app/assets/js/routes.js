'use strict';

module.exports = function ($urlRouterProvider, $stateProvider, $locationProvider) {
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('massages', {
			url: '/',
			templateUrl: 'partials/massages.html',
			controller: 'MassageController'
		})
		.state('bid', {
			url: '/bid/{time:\\d{2}:\\d{2}}',
			templateUrl: 'partials/bid.html',
			controller: 'BiddingController'
		})
		.state('admin', {
			url: '/admin',
			templateUrl: 'partials/admin.html',
			controller: 'AdminController'
		})
		.state('verify', {
			url: '/verify/{time:\\d{2}:\\d{2}}',
			templateUrl: 'partials/verify.html',
			controller: 'VerifyController'
		});

	$locationProvider.html5Mode(true);
};
