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