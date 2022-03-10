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

app.get('/url-scheme', function (req, res) {
  res.render('url-scheme')
})

app.get('/inbound-popup', function (req, res) {
  console.log(req.query)
  /*
  spamNumberDetectionRemote(req.query.phoneNumber, (err, result) => {
      res.render('inbound-popup', {
        callerInfo: result
      })
  })
  */
})

app.get('/spam-detection', function (req, res) {
  console.log(req.query)
  res.send({
    status: 'ok',
    callerInfo: {}
  })
  /*
  spamNumberDetectionRemote(req.query.phoneNumber, (err, result) => {
    if (!err){
      res.send({
        status: 'ok',
        callerInfo: result
      })
    }else{
      res.send({
        status: 'failed',
        callerInfo: err
      })
    }
  })
  */
})

function spamNumberDetectionRemote(phoneNumber, callback){
      console.log("spamNumberDetectionRemote (Telesign): " + phoneNumber)
      phoneNumber = phoneNumber.replace(/[\+()-\s]/g, '')
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
          var callerInfo = {
            number: resp.numbering.original.complete_phone_number,
            location: `${resp.location.city}, ${resp.location.state} - ${resp.location.zip}. ${resp.location.country.name}`,
            carrier: resp.carrier.name,
            risk: resp.risk.level
          }
          callback(null, callerInfo)
        }
      }, phoneNumber, "sign-in")
}
