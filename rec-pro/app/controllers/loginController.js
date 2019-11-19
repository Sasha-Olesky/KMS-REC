App.controller('LoginCtrl', function($scope, $rootScope, $http, $location, Facebook) {

	$scope.registerFlag = false;
    $scope.userId;
	$scope.userName;
	$scope.userEmail;
	$scope.userPhone;
	$scope.userPw;
    $scope.setPw;
	$scope.ConfirmPw;
    $scope.pwConfirmed = false;

    $rootScope.isGoogle = false;
    $rootScope.isFacebook = false;

    $scope.loginTitle = "Welcome to us!";
    $scope.siginBtn = function (flag) {
        if(!flag) {
            $scope.loginTitle = "Welcome to us!";
        } else {
            $scope.loginTitle = "Tell us about the \n care provider";
        }

    	$scope.registerFlag = flag;
        $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
    }

    // login Action
    $scope.loginAction = function () {
        // check value
        var email = $scope.userEmail;
        if($scope.userEmail == "") {
            return;
        } else if(! email.includes("@")) {
            return;
        }

        if($scope.userPw == "") {
            return;
        }

        var request = {"user_email": $scope.userEmail, 
                        "user_password": $scope.userPw};

        // register request
        $http({
            url: 'https://dev.brightguide.ca:8081/login',
            method: "POST",
            data: request
        })
        .then(function(response) {                  // success
            console.log("login ===> " + response.data);
            var res_obj = angular.fromJson(response.data);
            res_obj = JSON.parse(res_obj);
            var result_code = res_obj.result_code;
            if(result_code == 200) {                // success
                var body = res_obj.data;
                $scope.userId = body.user_id;

                console.log("user_id ====> " + $scope.userId);

                $location.path("/main");
            } else {

            }
            
        }, 
        function(response) { // optional                // failed
                
        });

    }

    // register first step
    $scope.registerFirst = function () {
    	
        var email = $scope.setEmail;
    	if($scope.setName == "") {
            return;
    	}
        if($scope.setEmail == "") {
            return;
    	} else if (! email.includes("@")) {
            return;
        }
        if($scope.userPhone == "") {
            return;
    	}

    	$scope.registerFlag = false;

        $scope.loginTitle = "Setting up your account";
    }

    // register last step
    $scope.registerLast = function () {
        if($scope.setPw == "")
            return;
    	if($scope.setPw == $scope.ConfirmPw) {
            $scope.pwConfirmed = false;

            $scope.userPw = $scope.setPw;
            $scope.userName = $scope.setName;
            $scope.userEmail = $scope.setEmail;
    		
    		var request = { 'user_name': $scope.setName, 
		        		'user_email': $scope.setEmail, 
		        		'user_phone': $scope.userPhone, 
		        		'user_password': $scope.setPw, 
		        		'user_availible': true};
		    console.log("request ===> " + request);
    		// register request
    		$http({
		        url: 'https://dev.brightguide.ca:8081/register',
		        method: "POST",
		        data: request
		    })
		    .then(function(response) {					// success
		        console.log("resgister ===> " + response.data);

                $scope.siginBtn(false);
		    }, 
		    function(response) { // optional				// failed
		            
		    });
    	} else {					// show alert
            $scope.pwConfirmed = true;
    	}
    }

    $scope.signingWithRec = function () {
	var request = {"user_email": $scope.userEmail, 
                        "user_name": $scope.userName};

        // register request
        $http({
            url: 'https://dev.brightguide.ca:8081/loginwith',
            method: "POST",
            data: request
        })
        .then(function(response) {                  // success
            console.log("login ===> " + response.data);
            var res_obj = angular.fromJson(response.data);
            res_obj = JSON.parse(res_obj);
            var result_code = res_obj.result_code;
            if(result_code == 200) {                // success
                var body = res_obj.data;
                $scope.userId = body.user_id;

                console.log("user_id ====> " + $scope.userId);

                $location.path("/main");
            } else {
                $rootScope.isGoogle = false;
            }
            
        }, 
        function(response) { // optional                // failed
                
        });
    }


    // google sign in
    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

        $scope.userEmail = profile.getEmail();
        $scope.userName = profile.getName();
        var request = {"user_email": $scope.userEmail, 
                        "user_name": $scope.userName};

        // register request
        $http({
            url: 'https://dev.brightguide.ca:8081/loginwith',
            method: "POST",
            data: request
        })
        .then(function(response) {                  // success
            console.log("login ===> " + response.data);
            var res_obj = angular.fromJson(response.data);
            res_obj = JSON.parse(res_obj);
            var result_code = res_obj.result_code;
            if(result_code == 200) {                // success
                var body = res_obj.data;
                $scope.userId = body.user_id;

                console.log("user_id ====> " + $scope.userId);

                $rootScope.isGoogle = true;

                $location.path("/main");
            } else {
                $rootScope.isGoogle = false;
            }
            
        }, 
        function(response) { // optional                // failed
                
        });
    }

    window.onSignIn = onSignIn;

    // facebook login
    $scope.$watch(
      function() {
        return Facebook.isReady();
      }, 
      function(newVal) {
        if (newVal) {
          $scope.facebookReady = true;
        }
      }
    );

//    $scope.IntentLogin = function() {
      Facebook.getLoginStatus(function (response) {
        if (response.status == 'connected') {
 //         $scope.me();
        } else {
 //         $scope.login();
        }
      });
//    };

    $scope.facebooklogin = function() {
      Facebook.login(function (response) {
        if (response.status == 'connected') {
          $scope.logged = true;
          $scope.me();
        }
      }, {scope: 'email'});
    };

    $scope.me = function() {
      Facebook.api('/me', {  fields: 'name, email' }, function (response) {
        $scope.$apply(function () {
          $scope.user = response;
          console.log("facebook sign in ====> " + $scope.user.name);
	  console.log("facebook user email ====> " + $scope.user.email);

	$rootScope.isFacebook = true;
	 $scope.userEmail = $scope.user.email;
         $scope.userName = $scope.user.name;
	  $scope.signingWithRec();
        });
      });
    };

    
    $scope.logout = function() {
      Facebook.logout(function () {
        $scope.$apply(function () {
          
        })
      });
    };

    $scope.$on('Facebook:statusChange', function (ev, data) {
      console.log('Status: ', data);

      if (data.status == 'connected') {
        $scope.$apply(function () {
        });
      } else {
        $scope.$apply( function() {
        });
      }
    });
});



