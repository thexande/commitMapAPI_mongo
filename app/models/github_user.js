// model for github users
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var githubUserSchema = new Schema({
  profileInformation : Object,
  userWatchingRepos: Array,
  userAvailableRepos: Array
})
// include find or create plugin

module.exports = mongoose.model('githubUser', githubUserSchema)
