App.config(function ($routeProvider) {
  $routeProvider
    .when('/', 
      {
        controller: 'LoginCtrl',
        templateUrl: 'app/templates/login.html'
      })
    .when('/login', 
      {
        controller: 'LoginCtrl',
        templateUrl: 'app/templates/login.html'
      })
    .when('/streaming', 
    {
        controller: 'StreamCtrl',
        templateUrl: 'app/templates/streaming.html'
    })
    .when('/main',
    {
        controller: "MainCtrl", 
        templateUrl: "app/templates/main.html"
    })
    .otherwise( { redirectTo: '/' } );
});
