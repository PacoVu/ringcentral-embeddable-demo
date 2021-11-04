var path = require('path')
var TeleSignSDK = require('telesignsdk');

if('production' !== process.env.LOCAL_ENV )
  require('dotenv').load();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencoded = bodyParser.urlencoded({extended: false})

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(urlencoded);

var port = process.env.PORT || 3002

var server = require('http').createServer(app);
server.listen(port);
console.log("listen to port " + port)
//var rc_engine = require('./engine');
app.get('/', function (req, res) {
  res.render('index')
})

app.get('/inbound-popup', function (req, res) {
  console.log(req.query)
  spamNumberDetectionRemote(req.query.phoneNumber, (err, result) => {
      res.render('inbound-popup', {
        callerInfo: result
      })
  })
})

function spamNumberDetectionRemote(phoneNumber, callback){
      console.log("spamNumberDetectionRemote (Telesign): " + phoneNumber)
      const client = new TeleSignSDK(
          process.env.TELESIGN_CUSTOMER_ID,
          process.env.TELESIGN_API_KEY,
          "https://rest-api.telesign.com"
      );
      client.score.score((err, resp) => {
        if(err){
          callback(err, "")
        }else{
          console.log(JSON.stringify(resp))
          {"reference_id":"25F3AF6F0B30031C9007DA4ABB491BDB","external_id":null,
          "status":{"updated_on":"2021-11-04T16:50:20.722534Z","code":300,"description":"Transaction successfully completed"},
          "numbering":{"original":{"complete_phone_number":"16505130930","country_code":"1","phone_number":"6505130930"},
          "cleansing":{"call":{"country_code":"1","phone_number":"6505130930","cleansed_code":100,"min_length":10,"max_length":10},
          "sms":{"country_code":"1","phone_number":"6505130930","cleansed_code":100,"min_length":10,"max_length":10}}},
          "phone_type":{"code":"5","description":"VOIP"},
          "location":{
            "city":"San Mateo",
            "state":"CA",
            "zip":"94403",
            "metro_code":"7360",
            "county":"",
            "country":{"name":"United States","iso2":"US","iso3":"USA"},
            "coordinates":{"latitude":37.53961,"longitude":-122.30133},
            "time_zone":{"name":"America/Los_Angeles","utc_offset_min":"-8","utc_offset_max":"-8"}
          },
          "carrier":{"name":"Bandwidth/RingCentral Messaging - Sybase365"},
          "blocklisting":{"blocked":false,"block_code":0,"block_description":"Not blocked"},
          "risk":{"level":"medium","recommendation":"flag","score":501}
          }
          var callerInfo = {
            number: resp.numbering.original.complete_phone_number,
            location: `${resp.location.city}, ${resp.location.state} - ${resp.location.zip}. ${resp.location.country.name}`,
            carrier: resp.carrier.name,
            risk: `Level: ${resp.risk.level}`
          }
          callback(null, callerInfo)
        }
      }, phoneNumber, "sign-in")
}
