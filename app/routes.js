// our router file for our API
var express = require('express')
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
            // TODO filter out user selected repos before appending to databaseConfig
            var newUser = {}
            newUser.profileInformation = profile
            newUser.userAvailableRepos = githubRepoResponse
            newUser.profileInformation.bearer_token = accessToken.access_token
            githubUserModel.findOneAndUpdate({
              'profileInformation.id' : profile.id
            }, newUser, {upsert: true},
            (error, document) => {
              console.log(document);
            })

            // (err, githubUserFromDb) => {
            //   // does our user collection already exist?
            //   if(githubUserFromDb.length > 0){
            //     // user collection exists. update token
            //     console.log(githubUserFromDb[0].profileInformation);
            //     githubUserFromDb[0].profileInformation.test = 'accessToken.access_token'
            //     githubUserFromDb[0].save((e) => {console.log(e)})
            //   } else {
            //     // user colleciton does not exist. create user with available repos and profile data
            //     var githubUser = new githubUserModel()
            //     githubUser.profileInformation = profile
            //     githubUser.profileInformation.bearer_token = accessToken.access_token
            //     githubUser.userAvailableRepos = response
            //     githubUser.save((e) => {console.log(e)})
            //
            //   }
            //   console.log(err);
            // })

            //
            // githubUserModel.findOrCreate({
            //   profileInformation: profile,
            //   userAvailableRepos: response
            // })

            // save user to db.

          })
          // return user collection
          res.send('gitHubUser')
        })
      })
  })
  // .get(function(req, res) {
  //   githubUserModel.find(function(err, bears) {
  //       if (err)
  //           res.send(err);
  //
  //       res.json(bears);
  //   });
// });

module.exports = router
