var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/commitmap')
// mongoose.connect('mongodb://heroku_n4zqsq4f:itl80p0kj1eo2n5oi1g9o8qk95@ds023674.mlab.com:23674/heroku_n4zqsq4f')
module.exports = mongoose
