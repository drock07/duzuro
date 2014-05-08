var duzuroVideoViewer = angular.module('duzuroVideoViewer', [
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

duzuroApp.controller('AddQuestionCtrl', ['$scope', 'Questions',
	function($scope, Questions) {


		$scope.addQuestion = function() {
			Questions.add($scope.questionTitle, $scope.questionDetails);
		};
	}
]);