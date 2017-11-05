var SpotifyAPI = require('spotify-web-api-node');
var request = require('request')
var Configuration = require('./configuration.js')


var spotify = {
  init: function init (config) {
    console.log(config)
    this.client = new SpotifyAPI(config);
  },
  searchSongs: function searchSongs (term) {
    this.client.searchTracks(term, { limit: 5})
      .then(function(data) {
        var tracks = data.body.tracks.items
        console.log(`Search by ${term}:\n`);
        tracks.forEach(function (track) {
          process.stdout.write('Artists: ')
          track.artists.forEach(function (artist, i) {
            process.stdout.write(artist.name)
            if (i + 1 < track.artists.length) { process.stdout.write(', ') }
          })
          console.log()
          console.log('Album:', track.album.name)
          console.log('Track:', track.name)
          console.log('\n===========\n')
        })
      }, function(err) {
        console.error(err);
      });
  },
  searchArtist: function searchArtist (term) {
    this.client.searchArtists(term, { limit: 5})
      .then(function(data) {
        var artists = data.body.artists.items
        console.log(`Search Artists by ${term}:\n`);
        artists.forEach(function (artist) {
          console.log('Name:', artist.name)
          console.log('Total Followers', artist.followers.total)
          process.stdout.write("Genres: ")
          artist.genres.forEach(function (genre, i) {
            process.stdout.write(genre)
            if (i + 1 < artist.genres.length) { process.stdout.write(', ') }
          })
          console.log()
          console.log('\n===========\n')
        })
      }, function(err) {
        console.error(err);
      });
  }
}

function Spotify() {
  Object.setPrototypeOf(this, spotify)
}

module.exports = Spotify

if (require.main == module) {
  var myConfig = new Configuration()
  var spot = new Spotify()
  myConfig.read(function (blah) {
    myConfig.getToken('spotify', function (config) {
      spot.init()
      spot.client.setAccessToken(config.bearer_token)
      let song = process.argv[2] || 'universal sound'
      spot.searchSongs('track:' + song)
    })
  })
}