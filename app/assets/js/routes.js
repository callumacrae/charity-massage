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
		.state('login', {
			url: '/admin/login',
			templateUrl: 'partials/admin-login.html',
			controller: 'AdminLoginController'
		})
		.state('verify', {
			url: '/verify/{time:\\d{2}:\\d{2}}/{donationId}',
			templateUrl: 'partials/verify.html',
			controller: 'VerifyController'
		})
		.state('tip', {
			url: '/tip',
			templateUrl: 'partials/tip.html',
			controller: 'TipController'
		});

	$locationProvider.html5Mode(true);
};
