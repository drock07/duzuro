// @prepros-append services.js
// @prepros-append videoViewer.js

var duzuroApp = angular.module('duzuroApp', [
	'ui.router',
	'duzuroServices'
]);

duzuroApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise('/');

		$stateProvider
			// login states
			.state('login', {
				url: '/login',
				templateUrl: '/partials/login.html',
				controller: ['$scope', '$state', 'Authentication', 
					function($scope, $state, Authentication) {

						$scope.onGoogleClick = function() {
							Authentication.googleLogin().then(function(user) {
								$state.go('project');
							}, function(error) {

							});
						}
					}
				]
			})

			// milestones - timeline view (fullscreen)

			.state('project', {
				url: '/',
				templateUrl: '/partials/project-timeline.html'
			})

			.state('project.milestone', {
				url: 'milestone/:milestoneId',
				templateUrl: '/partials/milestone.html'
			});
	}
]);

duzuroApp.run(['$rootScope', '$state', 'Authentication',
	function($rootScope, $state, Authentication) {

		$rootScope.$on('$stateChangeStart', function(event, to, toParams, from, fromParams) {

			// if(to.name !== 'login' && Authentication.currentUser() === null) {
			// 	// console.log('here');
			// 	event.preventDefault();
			// 	$state.go('login');
			// }
		});
	}
]);

duzuroApp.controller('ProjectTimelineCtrl',['$scope', function($scope) {

	$scope.projectName = "Web Proxy";
	$scope.milestones = {
		0: {
			"id": 0,
			"title": "Breaking down code structure", 
			"users": 
			{
				0: {
					"id": 0, 
					"username": "cathy", 
					"status": "3", 
				}, 
				1: {
					"id": 1, 
					"username": "david", 
					"status": "3",
				}, 
				2: {
					"id": 2, 
					"username": "kamakshi", 
					"status": "1"
				}
			}

		}, 
		1: {
			"id": 1, 
			"title": "Title", 
			"users": 
			{
				0: {
					"id": 0, 
					"username": "cathy", 
					"status": "3", 
				}, 
				1: {
					"id": 1, 
					"username": "david", 
					"status": "3",
				}, 
				2: {
					"id": 2, 
					"username": "kamakshi", 
					"status": "1"
				}
			}
		}, 
		2: {
			"id": 1, 
			"title": "Title", 
			"users": 
			{
				0: {
					"id": 0, 
					"username": "cathy", 
					"status": "3", 
				}, 
				1: {
					"id": 1, 
					"username": "david", 
					"status": "3",
				}, 
				2: {
					"id": 2, 
					"username": "kamakshi", 
					"status": "1"
				}
			}
		}
	};


	$scope.statusName = function(status) {
		var array = ["Just Started", "Working on it!", "Stuck!", "DONE!!!"];
		return array[status];
	}

	$scope.statusColor = function(status) {
		var array = ["#FFFF00", "#009933", "#009933", "#0099FF"];
		return array[status];
	}


}]); 



