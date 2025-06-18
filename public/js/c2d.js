let webPhone = null
let callSession = null
let timer = null
async function init(){
  let sipInfo = JSON.parse(window.sipInfo)
  webPhone = new WebPhone({ sipInfo });
  await webPhone.start();

  webPhone.on("outboundCall", (callSession) => {
    callSession.once("failed", (message) => {
      console.log("Outbound call failed, message is", message);
      $("#callBtn").attr("disabled", false)
      readFreeSlot()
    });

    callSession.once("answered", () => {
      console.log("Outbound call answered");
      $("#hangupBtn").attr("disabled", false)
      $("#hangupBtn").css("background-color", "red");
      // $("#callBtn").attr("disabled", true)
      $("#callBtn").css("background-color", "gray");
      readFreeSlot()
    });
  });
  pollFreeSlot()
}

function pollFreeSlot(){
  if (!callSession){
    var url = `/poll-free-slot`
    var getting = $.get( url )
    getting.done( function( res ) {
      if (res.status == "ok"){
        $("#callBtn").attr("disabled", false)
        $("#callBtn").css("background-color", "green");
      }else{
        $("#callBtn").attr("disabled", true)
        $("#callBtn").css("background-color", "gray");
      }
      console.log(res.callerNumbers)
      $("#callNumbers").html(`<b>Number of active calls:</b><span> ${res.callerNumbers}`)
      timer = setTimeout(function(){
        pollFreeSlot()
      }, 5000)
    });
  }
}

function readFreeSlot(){
    var url = `/poll-free-slot`
    var getting = $.get( url )
    getting.done( function( res ) {
      $("#callNumbers").html(`<b>Number of active calls:</b><span> ${res.callerNumbers}`)
    });
}

async function callAIR(){
  $("#callBtn").attr("disabled", true)
  callSession = await webPhone.call("16282452413")
}

function hangup(){
  if (callSession){
    callSession.hangup();
    $("#hangupBtn").attr("disabled", true)
    $("#hangupBtn").css("background-color", "gray");
    callSession = null
    pollFreeSlot()
  }
}
