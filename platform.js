const RingCentral = require('@ringcentral/sdk').SDK

console.log("Start the platform")

function RCPlatform() {

  this.rcsdk = new RingCentral({
      server: RingCentral.server.production,
      clientId: process.env.RINGCENTRAL_CLIENTID,
      clientSecret: process.env.RINGCENTRAL_CLIENTSECRET
    })

  this.platform = this.rcsdk.platform()
  this.platform.on(this.platform.events.loginSuccess, this.loginSuccess)
  this.platform.on(this.platform.events.logoutSuccess, this.logoutSuccess)
  this.platform.on(this.platform.events.refreshError, this.refreshError)

  var boundFunction = ( async function() {
      console.log(`WONDERFUL ext id ${this.extensionId}`)
      var tokenObj = await this.platform.auth().data()
  }).bind(this);
  this.platform.on(this.platform.events.refreshSuccess, boundFunction);
  return this
}

RCPlatform.prototype = {
  login: async function(){
    try{
      var resp = await this.rcsdk.login({ jwt : process.env.RC_USER_JWT })
      var tokenObj = await resp.json()
      tokenObj = await this.platform.auth().data()
      // console.log(tokenObj)
      return  tokenObj.owner_id
    }catch(e){
      console.log('PLATFORM LOGIN ERROR ' + e.message || 'Server cannot authorize user');
      return null
    }
  },
  logout: async function(){
    console.log("logout from platform engine")
    await this.platform.logout()
  },
  getPlatform: async function(){
    if (await this.platform.loggedIn()){
      return this.platform
    }else{
        console.log("BOTH TOKEN TOKENS EXPIRED")
        console.log("CAN'T REFRESH")
        return null
    }
  },
  getSDKPlatform: function(){
    return this.platform
  },
  getTokens: async function(){
    var tokenObj = await this.platform.auth().data()
    return JSON.stringify(tokenObj)
  },
  loginSuccess: function(e){
    console.log("Login success")
  },
  logoutSuccess: function(e){
    console.log("logout Success")
  },
  refreshError: function(e){
    console.log("refresh Error")
    console.log("Error " + e.message)
  }
}

module.exports = RCPlatform;
