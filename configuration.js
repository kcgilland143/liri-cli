var crypto = require('crypto-js')
var fs = require('fs')
var inquirer = require('inquirer')
var request = require('request')

var encryptedConfig = 'U2FsdGVkX18zRzD4w+XGQ2DYEytvgTYZhhA5Czq/eOuwg4CGYAF8V4cLtP4q4+0qqF/Mc5Gjkza093i/eQ8Cl4kPWTnab6C99EQQ3jpX+l0WkTu4mCmDcd26D/DEn2zWeMbai1rpOXbyDJhtZJF0lxG9YQi/lBA4SGqruYSx8/ux9EGa/ey88dh01VGS8bGx1cP1Fp6i3YHwXyN2sjW4IdHvoF00CjR0AOCjRgNIQfoi73J999GCTEgkMSft0NSOJFKNO6eBpuqu5g6/54qGLPDv9LQB5QqqYevFOoNOdFxGAgVzQ4jhdJ8mqp+8b/ZLHoOTD3YWn3f5NsQ+KDOPfy0GgubFJTlqbukKorR+z+5anfA5pfqwGP6QaDb8aoMJnL5m7Ul2wjV62LTglFSiJJEWBqYRDW2DQoaYzhLC3HugxAlvuBKUZYizdhjNssHZ2p9ucGiBMIC9PJ/S8caJFQ=='

var configuration = {

  write: function writeConfig() {
    fs.writeFile('config.json', JSON.stringify(this.config, null, 2), function (err) {
      if (err) { console.log('err:', err) }
    })
  },

  read: function readConfig(callback) {
    fs.readFile('config.json', 'UTF8', (err, data) => {
      if (!err) {
        this.config = JSON.parse(data)
        return callback(this.config)
      } else {
        this.prompt(3 , callback)
      }
    })
  },

  unlock: function unlockConfig(key) {
    var bytes = crypto.AES.decrypt(encryptedConfig, key)
    var text
    try {
      text = bytes.toString(crypto.enc.Utf8)
      this.config = JSON.parse(text)
    } catch (e) {
      console.log('Incorrect Password')
      return false
    }
    if (typeof this.config === 'object') {
      this.write()
    }
  },

  prompt: function promptUnlock (retries, callback) {
    if (retries) {
      inquirer.prompt([
      {
        'type': 'input',
        'message': 'Enter the password...',
        'name': 'key'
      }]).then((answers) => {
        this.unlock(answers.key)
        if (this.config) {
          callback(this.config)
        } else { 
          if (--retries) { console.log('Try again...') }
          this.prompt(retries, callback) 
        }
      })
    } else { return console.log('Retries exhausted')}
  },

  getToken: function getBearerToken (prop, successCallback) {
    var key = encodeURI(this.config[prop].consumer_key)
    var secret = encodeURI(this.config[prop].consumer_secret)
    var query = Buffer.from([key, secret].join(':')).toString('base64')
    // console.log(this.config[prop])
    // if (this.config[prop].bearer_token) { return successCallback() }
    
    return request({
      url: this.config[prop].url,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + query,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: 'grant_type=client_credentials'
    }, (err, response, body) => { 
      if (err) { return console.log(err) }
      this.config[prop].bearer_token = JSON.parse(body).access_token
      successCallback(this.config[prop], prop)
    })
  },
}

function Configuration() {
  Object.setPrototypeOf(this, configuration)
}

module.exports = Configuration

if (require.main == module) {
  configuration.read(function (config) {
    console.log(encryptObject(config, process.argv[2]).toString())
  })
}

function encryptObject(obj, key) {
  console.log(obj, key)
  return crypto.AES.encrypt(JSON.stringify(obj), key)
}