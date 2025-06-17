const RingCentral = require('@ringcentral/sdk').SDK

// RINGCENTRAL_CLIENTID = "8iclkdgURmnfIH9Hlt6lV2"
// RINGCENTRAL_CLIENTSECRET = "fV3F589AKl2b4xfmSTdv5I9zgwNnd4if0b5Ax9DedLrU"
// RINGCENTRAL_SERVER = 'https://platform.ringcentral.com'
//
//
// RC_JWT_119 ="eyJraWQiOiI4NzYyZjU5OGQwNTk0NGRiODZiZjVjYTk3ODA0NzYwOCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczovL3BsYXRmb3JtLnJpbmdjZW50cmFsLmNvbS9yZXN0YXBpL29hdXRoL3Rva2VuIiwic3ViIjoiNjIyODgzMjkwMTYiLCJpc3MiOiJodHRwczovL3BsYXRmb3JtLnJpbmdjZW50cmFsLmNvbSIsImV4cCI6Mzg5NDgxNDc0NywiaWF0IjoxNzQ3MzMxMTAwLCJqdGkiOiJpTXFGU09BU1IwV1NoeG5mWDhxQVpBIn0.I9LpVSdQMcDeMxMLn9IQ3ILWsYtWexijXvedwQDCLJuGOcjfLGtdRS69r7bklMKx9XtKfCCD1fZmsf3memAvelEzqFxuqWDmYkU1m9lUGXeduILezH_FGmxz40TKKQoT-czYTUj9r2eYaahLrOhwvIOgUGACsFUBJLsm-nyP5m1XgWfclHwCRHQlqXmbYGNQQ3_lFPob6EUtuOMP1WHrW22EVRb36Eo4FKhgat__VX-bSGw6wiR26AzgrWzuSpZNqCrGTIYOXo9CSj3l3ZBmyU6u2RTm-mXkgZcClbuEgL0EenID1J36rYh8xg3blO7tXeMggueUQ34NDivVKHV92A"

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
