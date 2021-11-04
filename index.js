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
        phoneNumberInfo: result
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
      client.score.score((err, response) => {
        if(err){
          callback(err, "")
        }else{
          console.log(JSON.stringify(response))
          var phoneNumberInfo = {
            number: phoneNumber,
            level: "N/A",
            score: 500,
            recommendation: "N/A"
          }
          if (response.hasOwnProperty('risk')){
            phoneNumberInfo.score = response.risk.score
            phoneNumberInfo.recommendation = response.risk.recommendation
            if (response.risk.score >= 901){
                phoneNumberInfo.level = "Risky"
            }else if (response.risk.score >= 801){ // 601
                phoneNumberInfo.level = "Highly"
            }else if (response.risk.score >= 651){ // 401
                phoneNumberInfo.level = "Likely"
            }else{
                phoneNumberInfo.level = "Clean"
            }
          }
          callback(null, phoneNumberInfo)
        }
      }, phoneNumber, "sign-in")
}
