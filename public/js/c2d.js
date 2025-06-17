let webPhone = null
let callSession = null
async function init(){
  let sipInfo = JSON.parse(window.sipInfo)
  webPhone = new WebPhone({ sipInfo });
  await webPhone.start();

  webPhone.on("outboundCall", (callSession) => {
    callSession.once("failed", (message) => {
      console.log("Outbound call failed, message is", message);
    });

    callSession.once("answered", () => {
      console.log("Outbound call answered");
      $("#hangupBtn").attr("disabled", false)
    });
  });

}

async function callAIR(){
  callSession = await webPhone.call("16282452413");
}

async function hangup(){
  if (callSession){
    await callSession.hangup();
    $("#hangupBtn").attr("disabled", true)
    callSession = null
  }
}



/*
Local Format:	(820) 345-4400
Fraud Score:	65
Carrier:	FRACTEL, LLC
Line Type:	VOIP

Local Format:	(661) 473-4539
Fraud Score:	0
Carrier:	Verizon Wireless
Line Type:	Wireless

Local Format:	(760) 685-1064
Fraud Score:	0
Carrier:	Verizon Wireless
Line Type:	Wireless
SMS-CAR-432 => Message too long.
*/
