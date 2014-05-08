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

duzuroApp.controller('QuestionViewerCtrl', ['$scope', '$stateParams', 'Questions',
	function($scope, $stateParams, Questions) {

		$scope.answers = Questions.getAnswers($stateParams['qid']);

		$scope.question = Questions.get($stateParams['qid']);
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