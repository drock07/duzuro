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