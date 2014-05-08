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
						templateUrl: '/partials/videoViewerBase.html'
					},
					'sideFrame@videoViewer': {
						templateUrl: '/partials/questionsViewer.html',
						controller: 'QuestionsViewerCtrl'
					},
					'videoFrame@videoViewer': {
						templateUrl: '/partials/videoViewer.html'
					}
				}
			})
			.state('videoViewer.askQuestion', {
				url: 'ask',
				views: {
					'bottomFrame': {
						templateUrl: '/partials/askQuestion.html',
						controller: 'AddQuestionCtrl'
					}
				}
			})
			.state('videoViewer.readQuestion', {
				url: 'question/:qid',
				views: {
					'sideFrame': {
						templateUrl: '/partials/questionViewer.html',
						controller: 'QuestionViewerCtrl'
					},
					'bottomFrame': {
						template: 'Choose an answer in the sidebar'
					}
				}
			});
	}
]);

duzuroApp.controller('NavCtrl', ['$scope',
	function($scope) {
		$scope.bigVid = false;
	}
]);