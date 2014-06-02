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



var duzuroServices = angular.module('duzuroServices', [
	'firebase'
]);

duzuroServices.factory('Projects', ['$firebase',
	function($firebase) {
		var fb = new Firebase("https://duzuro.firebaseio.com/");
		var fb_base = $firebase(fb);
		var fb_projects = fb_base.$child('projects');

		function parseTime(time) {
			var mm = Math.floor(time / 60);
			var ss = Math.floor(time - (mm * 60));
			var mins = mm < 10 ? "0" + mm : mm;
			var secs = ss < 10 ? "0" + ss : ss;

			return {mins: mins, secs: secs};
		}

		return {
			getBase: function() {
				return fb_base;
			},

			getProjects: function() {
				return fb_projects;
			},

			getProject: function(id) {
				return fb_projects.$child(id);
			},

			getMilestones: function(pid) {
				return fb_projects.$child(pid + '/milestones');
			},

			getMilestone: function(pid, mid) {
				return fb_projects.$child(pid + '/milestones/' + mid);
			},

			saveChat: function() {

			},

			setUserStatus: function() {

			},

			savePinnedPost: function() {

			}
		};
	}
]);

duzuroServices.factory('Authentication', ['$firebaseSimpleLogin', '$window',
	function($firebaseSimpleLogin, $window) {
		// var loginObject = $firebaseSimpleLogin(new Firebase("https://duzuro.firebaseio.com/"));

		// var authData = {
		// 	loggedIn: false,
		// 	username: ''
		// };

		var authData = {
			loggedIn: true,
			username: 'David'
		};

		return {
			// currentUser: function() {
			// 	// if(!loginObject.user)
			// 	// 	return null;
			// 	// return {
			// 	// 	name: loginObject.user.displayName,
			// 	// 	id: loginObject.user.uid,
			// 	// 	photo_url: loginObject.user.thirdPartyUserData.picture,
			// 	// 	photo_url_small: loginObject.user.thirdPartyUserData.picture + "?sz=50"
			// 	// };
			// 	// return loginObject.$getCurrentUser();
			// 	return loginObject.user;
			// },
			// googleLogin: function() {
			// 	return loginObject.$login('google', {
			// 		rememberMe: true
			// 	});
			// }

			getAuthData: function() {
				return authData;
			},

			setUsername: function(name) {
				authData.username = name;
				authData.loggedIn = true;
			},

			checkLoggedIn: function() {
				if(!authData.loggedIn) {
					// $window.alert('Must choose a username to complete this action. Check the top of the page.');
					return false;
				} else {
					return true;
				}
			}
		};
	}
]);

duzuroServices.directive('ngEnter', function() {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
});

duzuroServices.directive('dzTabs', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {

		},
		controller: ['$scope', function($scope) {
			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.scope.selected = false;
					pane.el.css("display", "none");
				});
				pane.scope.selected = true;
				pane.el.css("display", "block");
			};

			this.addPane = function(paneObj) {
				if(panes.length === 0) {
					$scope.select(paneObj);
				}
				panes.push(paneObj);
			};
		}],
		templateUrl: '/partials/directives/dzTabs.html'
	};
});

duzuroServices.directive('dzTabPane', function() {
	return {
		require: '^dzTabs',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@',
			paneClass: '@'
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane({"scope": scope, "el": element});
		},
		templateUrl: '/partials/directives/dzTabPane.html'
	};
});
var duzuroVideoViewer = angular.module('duzuroVideoViewer', [
	'ui.router',
	'duzuroServices'
]);

duzuroVideoViewer.factory('VideoAttributes', [
	function() {
		var data = {
			currentTime: 0,
			duration: 0,
			fraction: 0,
			percent: "0%"
		};

		return {
			data: data,

			getData: function() {
				return data;
			},

			update: function(curTime, dur) {
				data.currentTime = curTime;
				data.duration = dur;
				data.fraction = curTime / dur;
				data.percent = (data.fraction * 100) + "%";
			}
		};
	}
]);

duzuroVideoViewer.filter('humanTime', function() {
	return function(time) {
		var mm = Math.floor(time / 60);
		var ss = Math.floor(time - (mm * 60));
		var mins = mm < 10 ? "0" + mm : mm;
		var secs = ss < 10 ? "0" + ss : ss;

		return mins + ":" + secs;
	}
});

duzuroApp.controller('VideoViewerCtrl', ['$scope', 'VideoAttributes', 'Questions',
	function($scope, VideoAttributes, Questions) {
		var videoElement = $('video')[0];

		$scope.questions = Questions.getAll();
		$scope.videoData = VideoAttributes.getData();
		$scope.playPauseIcon = "ra-icon-play3";

		$(videoElement).on('timeupdate', function(event) {
			VideoAttributes.update(this.currentTime, this.duration);
			$scope.$apply();
		});

		$scope.playToggle = function() {
			if(videoElement.paused) {
				videoElement.play();
				$scope.playPauseIcon = "ra-icon-pause2";
			} else {
				videoElement.pause();
				$scope.playPauseIcon = "ra-icon-play3";
			}
		};

		$scope.onScrubberClick = function(event) {
			var scrubber = $(".scrubber");

			var fraction = (event.clientX - scrubber.offset().left) / scrubber.width();
			var percent = fraction * 100;

			var toTime = videoElement.duration * fraction;

			videoElement.currentTime = toTime;

			$scope.curPercent = percent + "%";
		};

		$scope.calculateQMarkerPosition = function(qTime) {
			var fraction = qTime / $scope.videoData.duration;

			var left = $(".scrubber").width() * fraction;
			
			return {left: left + "px"};
		};
	}
]);

duzuroApp.controller('QuestionsViewerCtrl', ['$scope', 'Questions',
	function($scope, Questions) {
		$scope.questions = Questions.getAll();
	}
]);

duzuroApp.controller('QuestionViewerCtrl', ['$scope', '$stateParams', 'Questions', 'VideoAttributes',
	function($scope, $stateParams, Questions, VideoAttributes) {


		$scope.answers = Questions.getAnswers($stateParams['qid']);

		$scope.question = Questions.get($stateParams['qid']);

		// $scope.$apply(function() {
			// VideoAttributes.getData().currentTime = $scope.question.time;
		// });
	}
]);

duzuroApp.controller('AddQuestionCtrl', ['$scope', '$state', 'Questions', 'VideoAttributes',
	function($scope, $state, Questions, VideoAttributes) {

		$scope.questionTitle = "";
		$scope.questionDetails = "";

		$scope.addQuestion = function() {
			if(validateFields()) {
				var qTime = VideoAttributes.data.currentTime

				Questions.add($scope.questionTitle, $scope.questionDetails, qTime).then(function(q) {
					
					Questions.setPriority(q.name(), qTime);

					$state.go('videoViewer');
					// $state.go('videoViewer.readQuestion', {qid: q.name()});
				});
			}
		};

		$scope.cancelAddQuestion = function() {
			$state.go('videoViewer');
		};

		function validateFields() {
			if ($scope.questionTitle &&
				$scope.questionDetails) {
				return true;
			} else {
				return false;
			}
		}
	}
]);

duzuroApp.controller('WriteAnswerCtrl', ['$scope', '$state', '$stateParams', 'Questions',
	function($scope, $state, $stateParams, Questions) {

		$scope.addAnswer = function() {
			if(validateFields()) {
				var username = 'anonymous';
				if($scope.answerer)
					username = $scope.answerer;
				
				Questions.addAnswer($stateParams['qid'], username, $scope.answer);
				$state.go('^');
			}
		};

		$scope.cancelAddAnswer = function() {
			$state.go('^');
		};

		function validateFields() {
			if ($scope.answer) {
				return true;
			} else {
				return false;
			}
		}
	}
]);

duzuroApp.controller('ReadAnswerCtrl', ['$scope', '$state', '$stateParams', 'Questions',
	function($scope, $state, $stateParams, Questions) {

		$scope.answer = Questions.getAnswer($stateParams['qid'], $stateParams['aid']);
	}
]);