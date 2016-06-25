// our router file for our API
var express = require('express')
router = express.Router()
var path = require('path')
var github = require('github')
var request = require('request')

// SPA route
router.route('/').get(function(req, res) {
    res.sendFile(path.join(__dirname, '../public/build/root.html'))
});


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
                          url: u
                          serApiUrl,
                          qs: accessToken,
                          headers: headers,
                          json: true
                      }, function(err, response, profile) {
                          // user profile is returned from github. check for user in db, if no user create one.
                          var userFromGithubObj = profile;


                        })
                      })
                    })

module.exports = router
