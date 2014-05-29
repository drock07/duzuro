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

			.state('projects', {
				url: '/',
				templateUrl: '/partials/project-selection.html',
				controller: 'ProjectSelectionCtrl'
			})

			// project view

			.state('project', {
				url: '/project/:projectId',
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
				url: '/milestone/:milestoneId',
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

		// $rootScope.$on('$stateChangeStart', function(event, to, toParams, from, fromParams) {

		// 	if(to.name !== 'login' && Authentication.currentUser() === null) {
		// 		// console.log('here');
		// 		event.preventDefault();
		// 		$state.go('login');
		// 	}
		// });
	}
]);

duzuroApp.controller('HeaderCtrl', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// console.log(Authentication.currentUser());
		// $scope.user = Authentication.currentUser();

		$scope.authData = Authentication.getAuthData();

		$scope.setUsername = function() {
			if($scope.username) {
				Authentication.setUsername($scope.username);
			}
		};
	}
]);

duzuroApp.controller('ProjectSelectionCtrl', ['$scope', 'Projects',
	function($scope, Projects) {
		$scope.projects = Projects.getProjects();

		$scope.addProject = function() {
			$scope.projects.$add({
				title: $scope.projectTitle
			});

			$scope.projectTitle = '';
		};
	}
]);

duzuroApp.controller('ProjectTimelineCtrl',['$scope', '$stateParams', 'PageState', 'Projects',
	function($scope, $stateParams, PageState, Projects) {

		$scope.pageState = PageState.getState();

		$scope.project = Projects.getProject($stateParams['projectId']);

		$scope.statusName = function(status) {
			var array = ["Just Started", "Working on it!", "Stuck!", "DONE!!!"];
			return array[status];
		};

		$scope.statusColor = function(status) {
			var colors = ["yellow", "green", "red", "blue"];
			return colors[status];
		};

		$scope.addMilestone = function() {

			$scope.project.$child('milestones').$add({
				title: $scope.milestoneTitle
			});

			$scope.milestoneTitle = '';
			$scope.showMilestoneInput = false;
		};

		$scope.project.$child('milestones').$on('child_added', function() {
			var el = $(".project-timeline")[0];
			// $(".project-timeline").scrollLeft(el.scrollWidth - el.clientWidth);

			$(".project-timeline").animate({
				scrollLeft: el.scrollWidth - el.clientWidth
			}, 'fast');

		});
	}
]); 

duzuroApp.controller('ProjectMilestoneCtrl', ['$scope', '$stateParams', 'Projects', 'Authentication',
	function($scope, $stateParams, Projects, Authentication) {
		$scope.milestone = Projects.getMilestone($stateParams['projectId'], $stateParams['milestoneId']);
		$scope.authData = Authentication.getAuthData();

		$scope.statusNames = ["starting", "in-progress", "stuck", "done"];

		$scope.userStatusObj = {};

		$scope.updateStatus = function() {
			$scope.milestone.$child('users/' + $scope.authData.username).$set({
				status: $scope.userStatusObj.userStatus
			});
		};

		$scope.sendChat = function() {

			if(Authentication.checkLoggedIn()) {
				$scope.milestone.$child('chat_stream').$add({
					msg: $scope.message,
					user: $scope.authData.username
				});

				$scope.message = '';
			}
		};

		$scope.milestone.$child('chat_stream').$on('child_added', function() {
			var el = $(".chat-stream")[0];

			$(".chat-stream").animate({
				scrollTop: el.scrollHeight - el.clientHeight
			}, 'fast');
		});


	}
]);


