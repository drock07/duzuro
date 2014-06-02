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
			// .state('login', {
			// 	url: '/login',
			// 	templateUrl: '/partials/login.html',
			// 	controller: ['$scope', '$state', 'Authentication', 
			// 		function($scope, $state, Authentication) {

			// 			$scope.onGoogleClick = function() {
			// 				Authentication.googleLogin().then(function(user) {
			// 					$state.go('project');
			// 				}, function(error) {

			// 				});
			// 			}
			// 		}
			// 	]
			// })

			.state('login', {
				url: '/',
				templateUrl: '/partials/login.html',
				controller: ['$scope', '$state', 'Authentication',
					function($scope, $state, Authentication) {

						$scope.login = function() {
							Authentication.setUsername($scope.username);
							$state.go('projects');
						};

					}
				]

			})

			.state('projects', {
				url: '/projects',
				templateUrl: '/partials/project-selection.html',
				controller: 'ProjectSelectionCtrl'
			})

			// project view

			.state('project', {
				abstract: true,
				url: '/project/:projectId',
				template: '<ui-view/>'
			})

			.state('project.milestones', {
				url: '',
				templateUrl: '/partials/project-timeline.html',
				controller: 'ProjectTimelineCtrl'
			})

			.state('project.milestone', {
				url: '/milestone/:milestoneId',
				templateUrl: '/partials/milestone.html',
				controller: 'ProjectMilestoneCtrl',
				onEnter: ['$stateParams', 'Projects', 'Authentication',
					function($stateParams, Projects, Authentication) {

						var milestone = Projects.getMilestone($stateParams['projectId'], $stateParams['milestoneId']);
						var authData = Authentication.getAuthData();

						var amOnline = Projects.getBase().$child('.info/connected').$getRef();
						var userRef = milestone.$child('active_users/' + authData.username).$getRef();

						amOnline.on('value', function(snapshot) {
							if(snapshot.val()) {
								userRef.onDisconnect().remove();
								userRef.set(true);
							}
						});
					}
				],
				onExit: ['$stateParams', 'Projects', 'Authentication',
					function($stateParams, Projects, Authentication) {
						var milestone = Projects.getMilestone($stateParams['projectId'], $stateParams['milestoneId']);
						var authData = Authentication.getAuthData();

						var amOnline = Projects.getBase().$child('.info/connected').$getRef();
						var userRef = milestone.$child('active_users/' + authData.username).$getRef();

						amOnline.on('value', function(snapshot) {
							if(snapshot.val()) {
								userRef.remove();
							}
						});
					}
				]
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

duzuroApp.filter('addAnchors', ['$sce',
	function($sce) {
		return function(str) {
			if(str) {
				return $sce.trustAsHtml(str.
						replace(/</g, '&lt;').
	                    replace(/>/g, '&gt;').
	                    replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*)/, '<a href="$1">$1</a>')
				);
			}
		};
	}
]);

duzuroApp.run(['$rootScope', '$state', 'Authentication',
	function($rootScope, $state, Authentication) {

		$rootScope.$on('$stateChangeStart', function(event, to, toParams, from, fromParams) {

			if(to.name !== 'login' && !Authentication.checkLoggedIn()) {
				// console.log('here');
				event.preventDefault();
				$state.go('login');
			}
		});
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

		$scope.project.$child('milestones').$on('child_added', function(ms) {
			// console.log(ms);
			$scope.project.milestones[ms.snapshot.name].num_active_users = 0;
			$scope.project.$child('milestones/' + ms.snapshot.name + '/active_users').$on('value', function(au) {
				$scope.project.milestones[ms.snapshot.name].num_active_users = Object.keys(au.snapshot.value).length;
				// console.log(ms.snapshot.name, 'boom');
			});
		});

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
			}).then(function(ref) {
				var el = $("#milestonesFrame")[0];

				$("#milestonesFrame").animate({
					scrollTop: el.scrollHeight - el.clientHeight
				}, 'fast');
			});

			$scope.milestoneTitle = '';
			$scope.showMilestoneInput = false;
		};

		// $scope.project.$child('milestones').$on('child_added', function() {
			// var el = $(".project-timeline")[0];
			// // $(".project-timeline").scrollLeft(el.scrollWidth - el.clientWidth);

			// $(".project-timeline").animate({
			// 	scrollLeft: el.scrollWidth - el.clientWidth
			// }, 'fast');

		// });
	}
]); 

duzuroApp.controller('ProjectMilestoneCtrl', ['$scope', '$stateParams', 'Projects', 'Authentication',
	function($scope, $stateParams, Projects, Authentication) {
		$scope.milestone = Projects.getMilestone($stateParams['projectId'], $stateParams['milestoneId']);
		$scope.authData = Authentication.getAuthData();

		$scope.num_active_users = 0;
		$scope.milestone.$child('active_users').$on('value', function(data) {
			// console.log(data);
			$scope.num_active_users = Object.keys(data.snapshot.value).length;
		});

		$scope.statusNames = ["just started", "working on it", "stuck", "done"];
		$scope.statusColors = ["#3498db", "#f1c40f", "#e74c3c", "#2ecc71"];

		// $scope.userStatusObj = {};
		$scope.chatData = {};

		$scope.getStatusColor = function(status) {
			return {
				"just started": "#3498db",
				"working on it": "#f1c40f",
				"stuck": "#e74c3c",
				"done": "#2ecc71"
			}[status];
		};

		$scope.updateStatus = function(index) {
			$scope.milestone.$child('users/' + $scope.authData.username).$set({
				status: index
			});
		};

		$scope.sendChat = function() {

			if(Authentication.checkLoggedIn()) {

				$scope.milestone.$child('chat_stream').$add({
					msg: $scope.chatData.message,
					user: $scope.authData.username
				});

				$scope.chatData.message = '';
			}
		};

		// $scope.milestone.$child('chat_stream').$on('child_added', function() {
		// 	var el = $(".chat-stream")[0];

		// 	$(".chat-stream").animate({
		// 		scrollTop: el.scrollHeight - el.clientHeight
		// 	}, 'fast');
		// });


	}
]);


