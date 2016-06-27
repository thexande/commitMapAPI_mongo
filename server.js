// require all our dependencies
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var express = require('express')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000
var databaseConfig = require('./config/database_config')
var methodOverride = require('method-override')
var path = require('path')
// app configuration
var app = express()
app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
    'extended': 'true'
}))
app.use(bodyParser.json())
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}))
app.use(methodOverride('X-HTTP-Method-Override'))

// data models
var githubUserModel = require('./app/models/github_user')

// bearer token for passport
passport.use(
    new BearerStrategy(
        function(token, done) {
          console.log("In bearer Strat")

          console.log(token)
          githubUserModel.find({
            'profileInformation.bearer_token': token
          }, (err, userCollection) => {
            if(userCollection.length == 0){
              // no user found with token.
              return(done(null, false))
            }
            return done(null, userCollection, {
                scope: 'all'
            })
          })
       }
    )
);
router = require('./app/routes.js')
app.use('/', router)

// listen
app.listen(port)
console.log("listening on port " + port)
