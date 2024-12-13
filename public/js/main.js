var timer = null
var pEngine = null

function init(){
  const urlParams = new URLSearchParams(window.location.search);
  const phoneNumber = urlParams.get('phoneNumber');
  console.log(phoneNumber)
}

window.addEventListener('message', (e) => {
  const data = e.data;
  if (data.call && data.call.direction == 'Inbound'){
    $("#events").html(`Incoming call from: ${data.call.from.phoneNumber}. Call status: ${data.call.telephonyStatus}`)
    //if (data.call.telephonyStatus == 'Ringing')
    //  getPhoneNumberInfo(data.call.from.phoneNumber)
  }
  if (data) {
    switch (data.type) {
      case 'rc-call-ring-notify':
        // get call when user gets a ringing call
        console.log("RINGING...")
        console.log(data.call);
        break;
      case 'rc-call-init-notify':
        // get call when user creates a call from dial
        console.log("SETUP...")
        console.log(data.call);
        break;
      case 'rc-call-start-notify':
        // get call when a incoming call is accepted or a outbound call is connected
        console.log("INCOMING RING...")
        console.log(data.call);
        break;
      case 'rc-call-hold-notify':
        // get call when user holds a call
        console.log(data.call);
        break;
      case 'rc-call-resume-notify':
        // get call when user unholds call
        console.log(data.call);
        break;
      case 'rc-call-end-notify':
        // get call on call end event
        console.log("TERMINATING...")
        console.log(data.call);
        break;
      case 'rc-call-mute-notify':
        // get call on call muted or unmuted event
        console.log(data.call);
        break;
      case 'rc-message-updated-notify':
        console.log("VOICEMAIL?")
        console.log(data.message.type)
        console.log(data.message.uri)
        break
      case 'rc-webphone-connection-status-notify':
        console.log("CONNECTION STATUS:", data.connectionStatus)
        if (data.connectionStatus == 'connectionStatus-connected')
          console.log("Device Id:", data.deviceId)
        break;
      case 'rc-telephony-session-notify':
        console.log("TELEPHONY")
        console.log(data);
        break
      case 'rc-call-end-notify':
        console.log("TELEPHONY CALL END")
        console.log(data);
        break
      default:
        console.log("OTHERS...")
        console.log(data);
        break;
    }
  }
});


function getPhoneNumberInfo(phoneNumber){
  var url = `/spam-detection?phoneNumber=${phoneNumber}`
  var getting = $.get( url );
  getting.done(function( res ) {
    if (res.status == "ok"){
      $('#phone-number').html(`Caller number: ${res.callerInfo.number}`)
      $('#location').html(`Location: ${res.callerInfo.location}`)
      $('#carrier').html(`Carrier: ${res.callerInfo.carrier}`)
      $('#risk-level').html(`Risk level: ${res.callerInfo.risk}`)
    }else{
      console.log(res.callerInfo)
    }
  });
}
