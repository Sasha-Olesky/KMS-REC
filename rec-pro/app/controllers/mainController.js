App.controller('MainCtrl', function($scope, $rootScope, $location, Facebook){
  var tabClasses;
  
  $scope.tabIndicator=1;
  function initTabs() {
    tabClasses = ["","","",""];
  }
  
  $scope.getTabClass = function (tabNum) {
    
  };
  
  $scope.getTabPaneClass = function (tabNum) {
    
  }
  
  $scope.setActiveTab = function (tabNum) {
    $scope.tabIndicator = tabNum;
  };
  
  $scope.tab1 = "This is 'Vidoe Add' Tab";
  $scope.tab2 = "This is 'Search' Tab";
  $scope.tab3 = "This is 'Setting' Tab";
  $scope.tab4 = "This is 'Account' Tab";
  
  //Initialize 
  initTabs();
  $scope.setActiveTab(1);


  // log out action
  $scope.logoutAction = function () {

    if($rootScope.isGoogle) {
      // google sign out
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.disconnect().then(function () {
          console.log('Google User signed out.');
          
          $location.path("/login");
          return;
      });  
      // auth2.signOut().then(function () {
      //     console.log('Google User signed out.');
          
      //     $location.path("/login");
      // });  
    }

    if($rootScope.isFacebook) {
	Facebook.logout(function () {
            $scope.$apply(function () {
          	$location.path("/login");
		return;
            });
      	});
    }

    $location.path("/login");
    
  }

});
