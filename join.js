
//var server       = { urls: "stun:stun.l.google.com:19302" };
var sdpConstraints = { optional: [{RtpDataChannels: true}]  };
var pc = new RTCPeerConnection(null);
var dc;

pc.ondatachannel  = function(e) {dc = e.channel; dcInit(dc)};
pc.onicecandidate = function(e) {
  if (e.candidate) return;
  $("#joiner-sdp").val(JSON.stringify(pc.localDescription));
};
pc.oniceconnectionstatechange = function(e) {
  var state = pc.iceConnectionState
  $('#status').html(state);
  if (state == "connected") $("#msg, #send").attr("disabled", false);
};

function dcInit(dc) {
  dc.onopen    = function()  {$("textarea").attr("disabled",true);addMSG("CONNECTED!", "info")};
  dc.onmessage = function(e) {if (e.data) addMSG(e.data, "other");}
}

function createAnswerSDP() {
  var offerDesc = new RTCSessionDescription(JSON.parse($("#creater-sdp").val()));
  pc.setRemoteDescription(offerDesc)
  pc.createAnswer(function (answerDesc) {
    pc.setLocalDescription(answerDesc)
  }, function () {console.warn("Couldn't create offer")},
  sdpConstraints);
};

var sendMSG = function() {
  var value = $("#msg").val();
  if (value) {
    dc.send(value);
    addMSG(value, "me");
    $("#msg").val('');
  }
}

var addMSG = function(msg, who) {
  var wrap = $("<div>").addClass("wrap").appendTo($("#chat-screen"));
  var div  = $("<div>").addClass(who).appendTo(wrap);
  $("<span>").html(who).addClass("who").appendTo(div);
  $("<span>").html(msg).addClass("msg").appendTo(div);
  $("#chat-screen-wp").scrollTop($("#chat-screen").height());
}

$("#create").click(createAnswerSDP);
$("#msg").keypress(function(e) {if(e.which == 13) {sendMSG()}});
$("#send").click(sendMSG);