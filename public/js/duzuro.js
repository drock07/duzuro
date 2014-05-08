// @prepros-append services.js
// @prepros-append videoViewer.js

var duzuroApp = angular.module('duzuroApp', [
	'ui.router',
	'duzuroServices',
	'duzuroVideoViewer'
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
						templateUrl: '/partials/videoViewer/videoViewerFrame.html'
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

			add: function(title, details) {
				return fb_questions.$add({
					title: title,
					details: details
				});
			}
		};
	}
]);
var duzuroVideoViewer = angular.module('duzuroVideoViewer', [
	'ui.router',
	'duzuroServices'
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

duzuroApp.controller('AddQuestionCtrl', ['$scope', '$state', 'Questions',
	function($scope, $state, Questions) {

		$scope.questionTitle = "";
		$scope.questionDetails = "";

		$scope.addQuestion = function() {
			if(validateFields()) {
				Questions.add($scope.questionTitle, $scope.questionDetails).then(function(q) {
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