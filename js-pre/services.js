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
			getBase: function() {
				return fb_base;
			},

			getProjects: function() {
				return fb_projects;
			},

			getProject: function(id) {
				return fb_projects.$child(id);
			},

			getMilestones: function(pid) {
				return fb_projects.$child(pid + '/milestones');
			},

			getMilestone: function(pid, mid) {
				return fb_projects.$child(pid + '/milestones/' + mid);
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

duzuroServices.factory('Authentication', ['$firebaseSimpleLogin', '$window',
	function($firebaseSimpleLogin, $window) {
		// var loginObject = $firebaseSimpleLogin(new Firebase("https://duzuro.firebaseio.com/"));

		var authData = {
			loggedIn: false,
			username: ''
		};

		// var authData = {
		// 	loggedIn: true,
		// 	username: 'David'
		// };

		return {
			// currentUser: function() {
			// 	// if(!loginObject.user)
			// 	// 	return null;
			// 	// return {
			// 	// 	name: loginObject.user.displayName,
			// 	// 	id: loginObject.user.uid,
			// 	// 	photo_url: loginObject.user.thirdPartyUserData.picture,
			// 	// 	photo_url_small: loginObject.user.thirdPartyUserData.picture + "?sz=50"
			// 	// };
			// 	// return loginObject.$getCurrentUser();
			// 	return loginObject.user;
			// },
			// googleLogin: function() {
			// 	return loginObject.$login('google', {
			// 		rememberMe: true
			// 	});
			// }

			getAuthData: function() {
				return authData;
			},

			setUsername: function(name) {
				authData.username = name;
				authData.loggedIn = true;
			},

			checkLoggedIn: function() {
				if(!authData.loggedIn) {
					// $window.alert('Must choose a username to complete this action. Check the top of the page.');
					return false;
				} else {
					return true;
				}
			}
		};
	}
]);

duzuroServices.directive('ngEnter', function() {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
});

duzuroServices.directive('dzTabs', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {

		},
		controller: ['$scope', function($scope) {
			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.scope.selected = false;
					pane.el.css("display", "none");
				});
				pane.scope.selected = true;
				pane.el.css("display", "block");
			};

			this.addPane = function(paneObj) {
				if(panes.length === 0) {
					$scope.select(paneObj);
				}
				panes.push(paneObj);
			};
		}],
		templateUrl: '/partials/directives/dzTabs.html'
	};
});

duzuroServices.directive('dzTabPane', function() {
	return {
		require: '^dzTabs',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@',
			paneClass: '@'
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane({"scope": scope, "el": element});
		},
		templateUrl: '/partials/directives/dzTabPane.html'
	};
});