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