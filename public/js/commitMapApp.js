// Angular module declaration and services
var commitMap = angular.module('commitMap',
  ['commitMap.controllers', 'commitMap.services',
    'ui.router', 'satellizer', 'smart-table', 'LocalStorageModule'])
// default header manipulation
angular.module('commitMap').run(function($http) {
  $http.defaults.headers.common.Authorization = ''
  $http.defaults.headers.common.authorization = ''
  $http.defaults.headers.common['authorization'] = ''
});
// local storage config
commitMap.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('commitMap')
    .setStorageType('localStorage')
    .setNotify(true, true)
})
// attempt at SPA config
commitMap.config(function($stateProvider, $urlRouterProvider, $authProvider) {
  $urlRouterProvider.otherwise('login')
  // GitHub auth
  $authProvider.github({
    name: 'github',
    // heroku
    // url: 'http://www.commitmap.com/githubUser',
    // localhost
    url: '/githubUser',

    // commitMapSatelizer Id
    clientId:'79c1a9391aa406e3f0a5',
    // commitMapHerokuSatelizer Id
    // clientId: 'ac835acb2e86b1f6f916',

    // heroku
    // redirectUri: 'http://www.commitmap.com/#/dash',
    // localhost
    // requiredUrlParams: ['scope'],
    // scope: ['user:email','read:repo_hook','write:repo_hook'],
    // scopeDelimiter: ',',
    type: '2.0',
    redirectUri: 'http://localhost:3000/#/dash',
    popupOptions: { width: 1020, height: 618 },
    authorizationEndpoint: 'https://github.com/login/oauth/authorize'
  })
  $stateProvider
    .state('root', {
      url: '/',
      templateUrl: 'build/root.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'build/login.html',
      controller: 'loginController'
    })
    .state('dash', {
      url: '/dash',
      templateUrl: 'build/dash.html',
      controller: 'dashController'
    })
    .state('dash.repoSelect', {
      url: '/reposelect',
      templateUrl: 'build/repo-select.html',
      controller: 'repoSelectController'
    })
    .state('dash.home', {
      url: '/home',
      templateUrl: 'build/dash-child.html'

    });
});
