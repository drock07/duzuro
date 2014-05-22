var duzuroServices = angular.module('duzuroServices', [
	'firebase'
]);

duzuroServices.factory('Projects', ['$firebase',
	function($firebase) {
		var fb = new Firebase("https://duzuro.firebaseio.com/");
		var fb_base = $firebase(fb);
		var fb_projects = fb_base.$child('projects');

		function parseTime(time) {
			var mm = Math.floor(time / 60);
			var ss = Math.floor(time - (mm * 60));
			var mins = mm < 10 ? "0" + mm : mm;
			var secs = ss < 10 ? "0" + ss : ss;

			return {mins: mins, secs: secs};
		}

		return {
			getProject: function(id) {
				return fb_projects.$child(id);
			},

			getMilestones: function() {
				return fb_projects.$child('testProject/milestones');
			},

			getMilestone: function(id) {
				return fb_projects.$child('testProject/milestones/' + id);
			},

			saveChat: function() {

			},

			setUserStatus: function() {

			},

			savePinnedPost: function() {

			}
		};
	}
]);

duzuroServices.factory('Authentication', ['$firebaseSimpleLogin',
	function($firebaseSimpleLogin) {
		var loginObject = $firebaseSimpleLogin(new Firebase("https://duzuro.firebaseio.com/"));

		return {
			currentUser: function() {
				if(!loginObject.user)
					return null;
				return {
					name: loginObject.user.displayName,
					id: loginObject.user.uid,
					photo_url: loginObject.user.thirdPartyUserData.picture,
					photo_url_small: loginObject.user.thirdPartyUserData.picture + "?sz=50"
				};
			},
			googleLogin: function() {
				return loginObject.$login('google', {
					rememberMe: true
				});
			}
		};
	}
]);