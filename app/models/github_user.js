// model for github users
var mongoose = require('mongoose')
var findOrCreate = require('mongoose-findorcreate')

var Schema = mongoose.Schema
var githubUserSchema = new Schema({
  profileInformation : Object,
  userWatchingRepos: Array,
  userAvailableRepos: Array
})
// include find or create plugin
githubUserSchema.plugin(findOrCreate)

module.exports = mongoose.model('githubUser', githubUserSchema)
