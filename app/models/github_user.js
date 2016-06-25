// model for github users
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var githubUserSchema = new Schema({
  profileInformation : [],
  userWatchingRepos: [],
  userAvailableRepos: []
})

module.exports = mongoose.model('githubUser', githubUserSchema)
