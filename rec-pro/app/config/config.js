App.config(['FacebookProvider', function (FacebookProvider) {
  var myAppId = '143120539569607';
  FacebookProvider.init(myAppId);
}]);


App.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q, $rootScope) {
        return {
            'request': function (config) {
                $rootScope.$broadcast('loading-started');
                return config || $q.when(config);
            },
            'response': function (response) {
                $rootScope.$broadcast('loading-complete');
                return response || $q.when(response);
            },
             'responseError': function (rejection) {
                $rootScope.$broadcast('loading-complete');
                return $q.reject(rejection);
            }
        };
    });
});

App.factory('loadingCounts', function () {
    return {
        enable_count: 0,
        disable_count: 0
    }
});

App.directive("loadingIndicator", function (loadingCounts, $timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.$on("loading-started", function (e) {
                loadingCounts.enable_count++;
                console.log("displaying indicator " + loadingCounts.enable_count);
                //only show if longer than one sencond
                $timeout(function () {
                    if (loadingCounts.enable_count > loadingCounts.disable_count) {
                        element.css({ "display": "" });
                    }
                }, 1000);  
            });
            scope.$on("loading-complete", function (e) {
                loadingCounts.disable_count++;
                console.log("hiding indicator " + loadingCounts.disable_count);
                if (loadingCounts.enable_count == loadingCounts.disable_count) {
                    element.css({ "display": "none" });
                }
            });
        }
    };
});