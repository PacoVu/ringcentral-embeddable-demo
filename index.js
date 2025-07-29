var path = require('path')
// var TeleSignSDK = require('telesignsdk');
const RCPlatform = require('./platform.js')
const fs = require('fs')

require('dotenv').load();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencoded = bodyParser.urlencoded({extended: false})

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(urlencoded);

var port = process.env.PORT || 3000

let rc_platform = new RCPlatform()
let callerNumbers = 0

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
  console.log(sipInfo)
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

app.get('/poll-free-slot', function (req, res) {
  if (callerNumbers > 5)
    res.send({status: "full", callerNumbers: callerNumbers})
  else{
    res.send({status: "ok", callerNumbers: callerNumbers})
  }
  // console.log("callerNumbers", callerNumbers)
})

app.post('/webhookcallback', function(req, res) {
    if(req.headers.hasOwnProperty("validation-token")) {
        res.setHeader('Validation-Token', req.headers['validation-token']);
        res.statusCode = 200;
        res.end();
    }else{
        var body = []
        req.on('data', function(chunk) {
            body.push(chunk);
        }).on('end', function() {
            body = Buffer.concat(body).toString();
            if (!body || body == ""){
              console.log("Raw body: ", body)
              console.log("req.headers", req.headers)
              return
            }
            try {
              var jsonObj = JSON.parse(body)
              let party = jsonObj.body.parties[0]
              if (party.extensionId && party.extensionId == "62288329016"){
                if (party.status.code == "Answered"){
                  callerNumbers++
                }else if (party.status.code == "Disconnected"){
                  callerNumbers--
                  if (callerNumbers < 0)
                    callerNumbers = 0
                }
              }
              console.log("callerNumbers", callerNumbers)
            }catch (e){
              console.log("Body is corrupted!", body)
              console.log(e.message)
            }
            res.statusCode = 200;
            res.end();
        });
    }
})

let sipInfo = null
login()
async function login(){
  await rc_platform.login()
  let sipInfoStr = null
  if (fs.existsSync('sip-info.json')){
    sipInfoStr = fs.readFileSync('sip-info.json')
  }
  if (!sipInfoStr || sipInfoStr == ""){
    await registerWebPhone()
  }else{
    sipInfo = JSON.parse(sipInfoStr)
    console.log("saved sipInfo", sipInfo)
  }

  let subscriptionId = null
  if (fs.existsSync('subscription.txt')){
    subscriptionId = fs.readFileSync('subscription.txt')
  }
  if (!subscriptionId || subscriptionId == ""){
    await subscribeForNotification()
  }else{
    console.log("subscriptionId", subscriptionId)
    await deleteRegisteredSubscription(subscriptionId)
    await subscribeForNotification()
  }
}

async function registerWebPhone(){
  console.log("registerWebPhone")
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
          fs.writeFileSync('sip-info.json', JSON.stringify(sipInfo), 'utf8')
        }catch(e){
          console.log(e.message)
        }
      }else{
        console.log("Pls login")
      }
}

// DELIVERY_ADDRESS='https://rc-embeddable-demo.herokuapp.com//webhookcallback'
DELIVERY_MODE_TRANSPORT_TYPE='WebHook'

async function subscribeForNotification(){
  var p = await rc_platform.getPlatform()
  if (p){
    var params = {
          eventFilters: [
            '/restapi/v1.0/account/~/extension/~/telephony/sessions?direction=Outbound&phoneNumber=+16282452413',
          ],
          deliveryMode: {
              transportType: "WebHook",
              address: process.env.DELIVERY_ADDRESS,
              verificationToken: "a234-4df1-2006-da2a-3efc-d0d7",
            },
          expiresIn: 86400
          }
          console.log(params)
    try {
        var resp = await p.post('/restapi/v1.0/subscription', params)
        var jsonObj = await resp.json()
        console.log(jsonObj.id)
        fs.writeFileSync('subscription.txt', jsonObj.id, 'utf8')
    }catch(e) {
        console.error(e);
        throw e;
    }
  }else{
    console.log("Pls login")
  }
}

async function deleteRegisteredSubscription(id) {
  var p = await rc_platform.getPlatform()
  if (p){
    try {
        var resp = await p.delete(`/restapi/v1.0/subscription/${id}`)
        console.log(resp)
    }catch(e) {
        console.error(e.message);
    }
  }
}
