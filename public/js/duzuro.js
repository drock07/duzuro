// @prepros-append services.js
// @prepros-append videoViewer.js

var duzuroApp = angular.module('duzuroApp', [
	'ui.router',
	'duzuroServices',
	'duzuroVideoViewer',
	'com.2fdevs.videogular',
	'com.2fdevs.videogular.plugins.controls',
	'com.2fdevs.videogular.plugins.overlayplay',
	'com.2fdevs.videogular.plugins.buffering',
	'com.2fdevs.videogular.plugins.poster'
]);

duzuroApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise('/');

		$stateProvider
			// login states
			// .state('login', {

			// })

			// video chooser states
			// .state('videoChooser', {

			// })
			
			// video viewer states
			.state('videoViewer', {
				url: '/',
				views: {
					'@' : {
						templateUrl: '/partials/videoViewer/videoViewerBase.html'
					},
					'sideFrame@videoViewer': {
						templateUrl: '/partials/videoViewer/questionsViewerFrame.html',
						controller: 'QuestionsViewerCtrl'
					},
					'videoFrame@videoViewer': {
						templateUrl: '/partials/videoViewer/videoViewerFrame.html',
						controller: 'VideoViewerCtrl'
					}
				}
			})
			.state('videoViewer.askQuestion', {
				url: 'ask',
				views: {
					'bottomFrame': {
						templateUrl: '/partials/videoViewer/askQuestionFrame.html',
						controller: 'AddQuestionCtrl'
					}
				}
			})
			.state('videoViewer.readQuestion', {
				url: 'question/:qid',
				views: {
					'sideFrame': {
						templateUrl: '/partials/videoViewer/questionViewerFrame.html',
						controller: 'QuestionViewerCtrl'
					},
					'bottomFrame': {
						template: 'Choose an answer in the sidebar'
					}
				}
			})
			.state('videoViewer.readQuestion.writeAnswer', {
				url: '/answer',
				views: {
					'bottomFrame@videoViewer': {
						templateUrl: '/partials/videoViewer/writeAnswerFrame.html',
						controller: 'WriteAnswerCtrl'
					}
				}
			})
			.state('videoViewer.readQuestion.readAnswer', {
				url: '/answer/:aid',
				views: {
					'bottomFrame@videoViewer': {
						templateUrl: '/partials/videoViewer/readAnswerFrame.html',
						controller: 'ReadAnswerCtrl'
					}
				}
			});
	}
]);
var duzuroServices = angular.module('duzuroServices', [
	'firebase'
]);

duzuroServices.factory('Questions', ['$firebase',
	function($firebase) {
		var fb = new Firebase("https://duzuro.firebaseio.com/");
		var fb_base = $firebase(fb);
		var fb_questions = fb_base.$child('questions');

		function parseTime(time) {
			var mm = Math.floor(time / 60);
			var ss = Math.floor(time - (mm * 60));
			var mins = mm < 10 ? "0" + mm : mm;
			var secs = ss < 10 ? "0" + ss : ss;

			return {mins: mins, secs: secs};
		}

		return {
			getAll: function() {
				return fb_questions;
			},

			get: function(qid) {
				return fb_questions.$child(qid);
			},

			getAnswers: function(qid) {
				return fb_questions.$child(qid + "/answers");
			},

			getAnswer: function(qid, aid) {
				return fb_questions.$child(qid + "/answers/" + aid);
			},

			setPriority: function(id, priority) {
				var question = fb_questions.$child(id);
				question.$priority = priority;
				question.$save();
			},

			add: function(title, details, time) {

				var parsedTime = parseTime(time);
				var humanTime = parsedTime.mins + ":" + parsedTime.secs;

				return fb_questions.$add({
					title: title,
					details: details,
					time: time,
					humanTime: humanTime
				});
			},

			addAnswer: function(id, username, answer) {
				var question = fb_questions.$child(id + "/answers");
				question.$add({
					username: username,
					answer: answer
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
])
.filter('humanTime', function() {
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