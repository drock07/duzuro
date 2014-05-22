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
		{
			"id": 0,
			"title": "Breaking down code structure", 
			"users": 
			{
				{
					"id": 0, 
					"username": "cathy", 
					"status": "3", 
				}, 
				{
					"id": 1, 
					"username": "david", 
					"status": "3",
				}, 
				{
					"id": 2, 
					"username": "kamakshi", 
					"status": "1"
				}
			}

		}, 
		{
			"id": 1, 
			"title": "Title", 
			"users": 
			{
				{
					"id": 0, 
					"username": "cathy", 
					"status": "3", 
				}, 
				{
					"id": 1, 
					"username": "david", 
					"status": "3",
				}, 
				{
					"id": 2, 
					"username": "kamakshi", 
					"status": "1"
				}
			}
		}, 
		{
			"id": 1, 
			"title": "Title", 
			"users": 
			{
				{
					"id": 0, 
					"username": "cathy", 
					"status": "3", 
				}, 
				{
					"id": 1, 
					"username": "david", 
					"status": "3",
				}, 
				{
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




var duzuroServices = angular.module('duzuroServices', [
	'firebase'
]);

duzuroServices.factory('Questions', ['$firebase',
	function($firebase) {
		var fb = new Firebase("https://duzuro.firebaseio.com/");
		var fb_base = $firebase(fb);
		var fb_projects = fb_base.$child('projects');
		// var fb_questions = fb_base.$child('questions');

		function parseTime(time) {
			var mm = Math.floor(time / 60);
			var ss = Math.floor(time - (mm * 60));
			var mins = mm < 10 ? "0" + mm : mm;
			var secs = ss < 10 ? "0" + ss : ss;

			return {mins: mins, secs: secs};
		}

		return {
			getMilestones: function() {
				return fb_projects.$child('testProject');
			},

			getMilestone: function() {

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

duzuroServices.factory('Authentication', ['$firebaseSimpleLogin',
	function($firebaseSimpleLogin) {
		var loginObject = $firebaseSimpleLogin(new Firebase("https://duzuro.firebaseio.com/"));

		return {
			currentUser: function() {
				if(!loginObject.user)
					return null;
				return {
					name: loginObject.user.displayName,
					id: loginObject.user.uid,
					photo_url: loginObject.user.thirdPartyUserData.picture,
					photo_url_small: loginObject.user.thirdPartyUserData.picture + "?sz=50"
				};
			},
			googleLogin: function() {
				return loginObject.$login('google', {
					rememberMe: true
				});
			}
		};
	}
]);
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