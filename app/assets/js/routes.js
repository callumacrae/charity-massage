'use strict';

module.exports = function ($urlRouterProvider, $stateProvider, $locationProvider) {
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('forfeits', {
			url: '/forfeits',
			templateUrl: 'partials/forfeits.html',
			controller: 'ForfeitController'
		});

	$locationProvider.html5Mode(true);
};
