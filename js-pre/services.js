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