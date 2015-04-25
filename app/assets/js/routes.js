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
		});

	$locationProvider.html5Mode(true);
};
