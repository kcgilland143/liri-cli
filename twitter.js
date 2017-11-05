var Twitter = require('twitter')
var request = require('request')
var Configuration = require('./configuration.js')

args = process.argv.slice(2)

var client

if (require.main == module) {
  var myConfig = new Configuration()
  var twit = new Twitter()
  myConfig.read(function (blah) {
    myConfig.getToken('twitter', function (config) {
      twitter.init(config)
      let cmd = process.argv[2] ? process.argv[2] : 'Trump'
      twitter.searchTerm(cmd)
    })
  })
}

var twitter = {
  init: function initClient(config) {
    this.client = Twitter(config);
  },
  searchTerm:function searchTerm(term) {
    this.client.get('search/tweets', { q: term, count: 5 }, function (err, response) {
      if (err) { return console.log(err)}
      var statuses = response.statuses
      var propnames = Object.getOwnPropertyNames(statuses[0])
      console.log()
      statuses.forEach(function (status) {
        console.log('user:', status.user.name)
        console.log('time:', status.created_at)
        console.log('text:', status.text)
        console.log('========================\n')
      })
    })
  },
  searchUser:function searchUser(term) {
    this.client.get('users/lookup', { screen_name: term, count: 5 }, function (err, response) {
      if (err) { return console.log(err)}
      var user = response[0]
      var status = user.status || {}
      console.log()
      console.log('user:', user.name)
      console.log('time:', status.created_at)
      console.log('text:', status.text)
      console.log('========================\n')
    })
  }
}

module.exports = twitter