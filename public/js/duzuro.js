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
					},
					'bottomFrame@videoViewer': {
						template: "{{ butt }}",
						controller: 'Monkey'
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
			});
	}
]);
var duzuroServices = angular.module('duzuroServices', [
	'firebase'
]);

duzuroServices.factory('Questions', ['$firebase',
	function($firebase) {
		var fb_base = $firebase(new Firebase("https://duzuro.firebaseio.com/"));
		var fb_questions = fb_base.$child('questions');

		return {
			getAll: function() {
				return fb_questions;
			},

			get: function(qid) {
				return fb_questions.$child(qid);
			},

			add: function(title, details, time) {
				return fb_questions.$add({
					title: title,
					details: details,
					time: time
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

duzuroApp.controller('VideoViewerCtrl', ['$scope', 'VideoAttributes',
	function($scope, VideoAttributes) {
		var videoElement = $('video')[0];

		$scope.videoData = VideoAttributes.getData();

		$(videoElement).on('timeupdate', function(event) {
			VideoAttributes.update(this.currentTime, this.duration);
			$scope.$apply();
		});

		$scope.playToggle = function() {
			if(videoElement.paused) {
				videoElement.play();
			} else {
				videoElement.pause();
			}
		};

		$scope.onScrubberClick = function(event) {
			var scrubber = $(".scrubber");

			var fraction = event.offsetX / scrubber.width();
			var percent = fraction * 100;

			var toTime = videoElement.duration * fraction;

			videoElement.currentTime = toTime;

			$scope.curPercent = percent + "%";
		};
	}
]);

duzuroApp.controller('Monkey', ['$scope', 'VideoAttributes',
	function($scope, VideoAttributes) {
		$scope.butt = VideoAttributes.getData();
	}
]);

duzuroApp.controller('QuestionsViewerCtrl', ['$scope', 'Questions',
	function($scope, Questions) {
		$scope.questions = Questions.getAll();
	}
]);

duzuroApp.controller('QuestionViewerCtrl', ['$scope', '$stateParams', 'Questions',
	function($scope, $stateParams, Questions) {
		$scope.question = Questions.get($stateParams['qid']);
	}
]);

duzuroApp.controller('AddQuestionCtrl', ['$scope', '$state', 'Questions', 'VideoAttributes',
	function($scope, $state, Questions, VideoAttributes) {

		$scope.questionTitle = "";
		$scope.questionDetails = "";

		$scope.addQuestion = function() {
			if(validateFields()) {
				Questions.add($scope.questionTitle, $scope.questionDetails, VideoAttributes.data.currentTime).then(function(q) {
					$state.go('videoViewer.readQuestion', {qid: q.name()});
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