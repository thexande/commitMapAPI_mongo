angular.module('commitMap.services', [])
.factory('userFactory', function($http, localStorageService){
  return{
    // local storage methods
    getFromLocalStorage: (key) => {
      return localStorageService.get(key)
    },
    setToLocalStorage: (key, value) => {
      return localStorageService.set(key, value)
    },
    // user variables
    profileData : {},
    reposFromGithubData : {},
    repoData : {},
    webHookData : {},
    getUserData : (passedToken) => {
      return $http({
        url: '/githubUser',
        method: "GET",
        params: {access_token: passedToken}
      })
    },
    addToWatchedUserRepos : (repo) => {
      return $http({
        url: '/githubUser/userWatchingRepo/'+repo,
        method: "PUT",
        data: {
          access_token: (localStorageService.get('userProfile').bearer_token)
        }
      })
    },
    removeFromWatchedUserRepos : (repo) => {
      return $http({
        url: '/githubUser/userWatchingRepo/'+repo,
        method: "POST",
        data: {
          access_token: (localStorageService.get('userProfile').bearer_token)
        }
      })
    },
    getUserWithToken : (token) => {
      $http.defaults.headers.get = {'authorization': ''}
      $http.defaults.headers.get = {'Authorization': ''}
      // fetch profile data and store in factory.
      return $http({
        url: '/githubUser',
        method: "GET",
        headers: {
          Accept: "*/*",
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {access_token: token},
      })
    }
  }
})
