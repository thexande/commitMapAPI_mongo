// our router file for our API
var express = require('express')
var passport = require('passport')
router = express.Router()
var path = require('path')
var gitHubApi = require('github')
var request = require('request')
var qs = require('qs')

// data models
var githubUserModel = require('./models/github_user')

// github api access configuration
var github = new gitHubApi({
  debug: true,
  protocol: "https",
  host: "api.github.com",
  timeout: 5000,
  headers: {
    "user-agent": "commitMap"
  },
  followRedirects: false,
})

// SPA route
router.route('/').get(function(req, res) {
  res.sendFile(path.join(__dirname, '../public/build/root.html'))
});

// route to get and set user profile information
router.route('/githubUser')
  .post((req, res) => {
    var oauthTokenFromSatellizer = req.body
      // access github api
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var accessToken
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      // commitMapHerokuSatelizer
      // client_secret: 'c1a1a683761b250ba2679109f7c2aad51ef02d99',
      // commitMapSatelizer
      client_secret: '9b4d0ef16b573cc1c714097ae5e26899085d5d9c',
      redirect_uri: req.body.redirectUri
    }
    request.get({
        url: accessTokenUrl,
        qs: params
      },
      function(err, response, accessToken) {
        accessToken = qs.parse(accessToken)
        var headers = {
          'User-Agent': 'Satellizer'
        }
        request.get({
          url: userApiUrl,
          qs: accessToken,
          headers: headers,
          json: true
        }, function(err, response, profile) {
          // user profile is returned from github. check for user in db, if no user create one.
          // next, fetch available repos from github and insert
          github.authenticate({
            type: "oauth",
            token: accessToken.access_token
          })
          github.repos.getAll({}, function(err, githubRepoResponse) {
            var newUser = {}
            newUser.profileInformation = profile
            newUser.userAvailableRepos = githubRepoResponse
            newUser.userWatchingRepos = []
              // TODO filter out user selected repos before appending to databaseConfig

            newUser.profileInformation.bearer_token = accessToken.access_token
            githubUserModel.findOneAndUpdate({
                'profileInformation.id': profile.id
              }, newUser, {
                upsert: true
              },
              (error, updatedUser) => {
                // return user collection
                res.json(updatedUser)
              })
          })
        })
      })
    })
    // route to return user collection
    .get((req, res, next) => {
      next()
    }, passport.authenticate('bearer', {session: false}),
    (req, res) => {
      res.json(req.user)
    })

// route to put userWatchingRepos
router.route('/githubUser/addRepoToWatch/:repoId')
  // put route to update watchingRepos
  .put((req, res, next) => {
    next()
  }, passport.authenticate('bearer', {session: false}),
  (req, res) => {
    // find our user collection
    githubUserModel.findOne({
      'profileInformation.id': req.user[0].profileInformation.id
    }, (err, userCollection) => {
      // now push repo with id to userWatchingRepos and remove from userAvailableRepos
      var selectedRepoId = req.params.repoId
      // new userAvailableRepos array
      userAvailableReposWithoutSelected = userCollection.userAvailableRepos.filter((i) => {
        return i.id != selectedRepoId
      })
      // push selectedRepo into userSelectedRepos
      // userCollection.userWatchingRepos.push()
      var repoSelected = userCollection.userAvailableRepos.filter((i) => {
        return i.id == selectedRepoId
      })[0]

      // assign our new arrays and save
      userCollection.userAvailableRepos = userAvailableReposWithoutSelected
      userCollection.userWatchingRepos.push(repoSelected)
      userCollection.save()

      res.send(userCollection)
    })

  })


module.exports = router
