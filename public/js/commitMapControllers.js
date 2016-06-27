angular.module('commitMap.controllers', [])

  .controller('dashController', function($scope, $http, $auth,  userFactory){
    console.log("in dash controller")
    $scope.profileData = userFactory.getFromLocalStorage('userProfile')
    console.log($scope.profileData);
  })

  .controller('loginController', function($scope, $http, $state, $auth, userFactory){
    // login controller for github auth
    $scope.GitHubAuth = (provider) => {
      $auth.authenticate(provider)
        .catch((e) => {console.log(e)})
        .then((response) => {
          console.log("##################LOGIN RESPONSE HERE########################");
          console.log(response)

            userFactory.setToLocalStorage('userProfile', response.data.profileInformation)
            userFactory.setToLocalStorage('availableUserRepos', response.data.userAvailableRepos)
            userFactory.setToLocalStorage('watchingUserRepos', response.data.userWatchingRepos)


          //   // load user dash home
            $state.transitionTo('dash.home')
          // })
        })
    }


    // login controller for local auth
    // $scope.localAuth = () => {
    //   // enable loading modal
    //   $http.post('http://localhost:3000/localAuth', $scope.loginData)
    //     .catch((e) => {console.log('error authentcating:' + e)})
    //     .then((result) => {
    //       // disable loading modal
    //       // store user data in factory for later access
    //       // go to dash state
    //       $scope.go('dash')
    //     })
    // }
  })
  .controller('repoSelectController', function($scope, $http, $state, userFactory){
    // github api call to get repos.
    $scope.availableUserRepos = userFactory.getFromLocalStorage('availableUserRepos')
    $scope.watchingUserRepos = userFactory.getFromLocalStorage('watchingUserRepos')
    console.log($scope.availableUserRepos);
    // add repo to watch with api call
    $scope.addRepoToWatch = (repo) => {
      console.log(repo);
      userFactory.addToWatchedUserRepos(repo.id)
        .then((resp) => {
          userFactory.setToLocalStorage('availableUserRepos', resp.data.userAvailableRepos)
          userFactory.setToLocalStorage('watchingUserRepos', resp.data.userWatchingRepos)
          $scope.availableUserRepos = resp.data.userAvailableRepos
          $scope.watchingUserRepos = resp.data.userWatchingRepos
        })
    }
    // function to remove repo id from watch
    $scope.removeRepoFromWatch = (repo) => {
      userFactory.removeFromWatchedUserRepos(repo.id)
        .then((resp) => {
          userFactory.setToLocalStorage('availableUserRepos', resp.data.userAvailableRepos)
          userFactory.setToLocalStorage('watchingUserRepos', resp.data.userWatchingRepos)
          $scope.availableUserRepos = resp.data.userAvailableRepos
          $scope.watchingUserRepos = resp.data.userWatchingRepos
        })
    }
  })
