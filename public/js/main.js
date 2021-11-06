var timer = null
var pEngine = null

function init(){
  const urlParams = new URLSearchParams(window.location.search);
  const phoneNumber = urlParams.get('phoneNumber');
  console.log(phoneNumber)
}

window.addEventListener('message', (e) => {
  const data = e.data;
  if (data.call.direction == 'Inbound'){
    $("#events").html(`Incoming call from: ${data.call.from.phoneNumber}. Call status: ${data.call.telephonyStatus}`)
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
      default:
        console.log("OTHERS...")
        //console.log(data);
        break;
    }
  }
});
