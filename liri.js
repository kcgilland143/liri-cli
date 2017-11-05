var Spotify = require('./spotify.js')
var twitter = require('./twitter.js')
var Configuration = require('./configuration.js')
var program = require('commander')

var myConfig = new Configuration()
var client

program
  .version('0.1.0')
  .option('-U, --unlock <password>', 'Unencrypt API configuration')
 
program
  .command('tweets [query]')
  .description('Retrieve Tweets matching query')
  .option("-t, --term", "Gets tweets with text matching [query], default")
  .option("-u, --user", "Get users tweets")
  .action(function(cmd, options){
    myConfig.read(function (blah) {
      myConfig.getToken('twitter', function (config) {
        twitter.init(config)
        cmd = cmd ? cmd : 'Trump'
        if (!options.user) {
          twitter.searchTerm(cmd)
        } else {
          twitter.searchUser(cmd)
        }
      })
    })
  });
 
program
  .command('spotify <query>')
  .alias('song')
  .description('Search Spotify for given song/artist')
  .option("-s, --song", "Search for Song [Default]")
  .option("-a, --artist", "Search for Artist")
  .action(function(cmd, options){
    myConfig.read(function (blah) {
      myConfig.getToken('spotify', function (config) {
        let spotify = new Spotify()
        spotify.init(config)
        spotify.client.setAccessToken(config.bearer_token)
        if (!options.artist) {
          spotify.searchSongs(cmd)
        } else {
          spotify.searchArtist(cmd)
        }
      })
    })
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('  $ liri spotify ace');
    console.log('  $ liri song ace');
    console.log();
  });

program.parse(process.argv)