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
				templateUrl: '/partials/project-timeline.html',
				controller: 'ProjectTimelineCtrl'
			})

			.state('project.open', {
				abstract: true,
				template: '<ui-view/>',
				onEnter: ['PageState', function(PageState) {
					PageState.expand();
				}],
				onExit: ['PageState', function(PageState) {
					PageState.compress();
				}]
			})

			.state('project.open.milestone', {
				url: 'milestone/:milestoneId',
				templateUrl: '/partials/milestone.html',
				controller: 'ProjectMilestoneCtrl'
			});
	}
]);

duzuroApp.factory('PageState', [
	function() {
		var state = {
			expanded: false
		};
		return {
			getState: function() {
				return state;
			},
			expand: function() {
				state.expanded = true;
			},
			compress: function() {
				state.expanded = false;
			}
		};
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

duzuroApp.controller('ProjectTimelineCtrl',['$scope', 'PageState', 'Projects',
	function($scope, PageState, Projects) {

		$scope.pageState = PageState.getState();

		$scope.project = Projects.getProject('testProject');

		$scope.statusName = function(status) {
			var array = ["Just Started", "Working on it!", "Stuck!", "DONE!!!"];
			return array[status];
		}

		$scope.statusColor = function(status) {
			var colors = ["yellow", "green", "red", "blue"];
			return colors[status];
		}
	}
]); 

duzuroApp.controller('ProjectMilestoneCtrl', ['$scope', '$stateParams', 'Projects',
	function($scope, $stateParams, Projects) {
		$scope.milestone = Projects.getMilestone($stateParams['milestoneId']);
	}
]);


