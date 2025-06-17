var path = require('path')
var TeleSignSDK = require('telesignsdk');
const RCPlatform = require('./platform.js')

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

let rc_platform = new RCPlatform()

var server = require('http').createServer(app);
server.listen(port);
console.log("listen to port " + port)
//var rc_engine = require('./engine');
console.log("Check")
app.get('/', function (req, res) {
  console.log("default page")
  res.render('index')
})

app.get('/index', function (req, res) {
  console.log("index page")
  res.render('index')
})

app.get('/url-scheme', function (req, res) {
  res.render('url-scheme')
})

app.get('/phone', function (req, res) {
  // let sipInfo =  {
  //   transport: "WSS",
  //   username: "17203861294*11119",
  //   password: "y5qZyPa1",
  //   authorizationTypes: ["SipDigest"],
  //   authorizationId: "802404906016",
  //   domain: "sip.ringcentral.com",
  //   outboundProxy: "sip112-1141.ringcentral.com:8083",
  //   outboundProxyBackup: "sip121-1141.ringcentral.com:8083",
  //   stunServers: ["stun1.ringcentral.com:19302", "stun2.ringcentral.com:19302"],
  // }
  // "sipInfo": [
  //   {
  //     "transport": "WSS",
  //     "username": "17203861294*11119",
  //     "password": "y5qZyPa1",
  //     "authorizationTypes": [
  //       "SipDigest"
  //     ],
  //     "authorizationId": "802404906016",
  //     "domain": "sip.ringcentral.com",
  //     "outboundProxy": "sip112-1141.ringcentral.com:8083",
  //     "outboundProxyBackup": "sip121-1141.ringcentral.com:8083",
  //     "stunServers": [
  //       "stun1.ringcentral.com:19302",
  //       "stun2.ringcentral.com:19302"
  //     ]
  //   }
  res.render('clicktodial', { sipInfo: sipInfo })
})

app.get('/oauth2callback', function (req, res){
  //http://localhost:3002/oauth2callback
  console.log(req.query)
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

login()
async function login(){
  await rc_platform.login()
  await registerWebPhone()
}
let sipInfo = null
async function registerWebPhone(){
  var p = await rc_platform.getPlatform()
      if (p){
        try{
          let endpoint = "/restapi/v1.0/client-info/sip-provision"
          let bodyParams = {
            sipInfo: [{
              transport: "WSS"
            }]
          }
          var resp = await p.post(endpoint, bodyParams)
          var jsonObj = await resp.json()
          // console.log(JSON.stringify(jsonObj))
          sipInfo = jsonObj.sipInfo[0]
        }catch(e){
          console.log(e.message)
        }
      }else{
        console.log("Pls login")
      }
}
