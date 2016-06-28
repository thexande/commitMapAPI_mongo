// our router file for our API
var express = require('express')
var passport = require('passport')
router = express.Router()
var path = require('path')
var gitHubApi = require('github')
var request = require('request')
var qs = require('qs')
// controllers
var webHookCtrl = require('./controllers/webHookCtrl')
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

// route to recieve webhook payloads from github
router.route('/webHookReceive')
  .post((req, res, next) => {
    console.log(req.body);
  })
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
            newUser.profileInformation.bearer_token = accessToken.access_token
            githubUserModel.findOneAndUpdate({
                'profileInformation.id': profile.id
              }, newUser, {
                upsert: true,
                new: true,
                returnNewDocument: true
              },
              (error, updatedUser) => {
                // now find and return latest record
                githubUserModel.findOne({
                  'profileInformation.id': updatedUser.profileInformation.id
                }, (err, user) => {
                  // return user collection
                  res.json(user)
                })
              })
          })
        })
      })
    })
    // route to return user collection
    .get((req, res, next) => {
      // set auth headers to '' to avoid angular additons
      req.headers.Authorization = ''
      req.headers.authorization = ''
      next()
    }, passport.authenticate('bearer', {session: false}),
    (req, res) => {
      res.json(req.user)
    })

// route to put userWatchingRepos
router.route('/githubUser/userWatchingRepo/:repoId')
  // put route to update watchingRepos
  .put((req, res, next) => {
    // set auth headers to '' to avoid angular additons
    req.headers.Authorization = ''
    req.headers.authorization = ''
    next()
  }, passport.authenticate('bearer', {session: false}),
  (req, res) => {
    // find our user collection
    githubUserModel.findOne({
      'profileInformation.id': req.user[0].profileInformation.id
    }, (err, userCollection) => {
      // now push repo with id to userWatchingRepos and remove from userAvailableRepos
      var selectedRepoId = req.params.repoId
      var user = req.user[0].profileInformation
      // new userAvailableRepos array
      userAvailableReposWithoutSelected = userCollection.userAvailableRepos.filter((i) => {
        return i.id != selectedRepoId
      })
      // push selectedRepo into userSelectedRepos
      var repoSelected = userCollection.userAvailableRepos.filter((i2) => {
        return i2.id == selectedRepoId
      })[0]
      // assign our new arrays and save
      userCollection.userAvailableRepos = userAvailableReposWithoutSelected
      userCollection.userWatchingRepos.push(repoSelected)

      // create web hook for repo.
      webHookCtrl.createUserWebHook(user, repoSelected)

      // save user in database
      userCollection.save()

      res.send(userCollection)
    })
  })
  // DELETE route to remove repo from user watching arr and return to user available.
  .post((req, res, next) => {
    // set auth headers to '' to avoid angular additons
    req.headers.Authorization = ''
    req.headers.authorization = ''
    console.log(req);
    next()
  },
  passport.authenticate('bearer', {session: false}),
  (req, res) => {
    // find our user collections
    githubUserModel.findOne({
      'profileInformation.id': req.user[0].profileInformation.id
    }, (err, userCollection) => {
      // remove selectedRepo from watchingRepos and return to availableRepos
      var watchingRepoId = req.params.repoId
      var repoSelected = userCollection.userWatchingRepos.filter((i3) => {
        if(i3 == null){return} else {
          return i3.id == watchingRepoId
        }
      })[0]
      var updatedUserWatchingRepos = userCollection.userWatchingRepos.filter((i4) => {
        if(i4 == null){return} else {
          return i4.id != watchingRepoId
        }
      })
      userCollection.userAvailableRepos.push(repoSelected)
      userCollection.userWatchingRepos = updatedUserWatchingRepos
      // save and send
      userCollection.save()
      res.send(userCollection)
    })
  })


module.exports = router
