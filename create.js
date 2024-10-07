// ICE and WebRTC setup
// var server       = { urls: "stun:stun.l.google.com:19302" };
const sdpConstraints = { optional: [{ RtpDataChannels: true }] };
const pc = new RTCPeerConnection(null);
let dcChat, dcFiles;

// DOM Elements
const statusLabel = document.getElementById("status");
const connectBtn = document.getElementById("connect-btn");
const createOfferField = document.getElementById("creater-sdp");
const joinerAnswerField = document.getElementById("joiner-sdp");

// Chat-related DOM elements
const chatScreenWP = document.getElementById("chat-screen-wp");
const chatScreen = document.getElementById("chat-screen");
const msgPrompt = document.getElementById("msg");
const sendBtn = document.getElementById("send");

pc.oniceconnectionstatechange = () => {
  const state = pc.iceConnectionState;
  statusLabel.textContent = state;

  msgPrompt.disabled = state != "connected";
  sendBtn.disabled = state != "connected";
};

pc.onicecandidate = (event) => {
  if (!event.candidate) {
    createOfferField.value = JSON.stringify(pc.localDescription);
  }
};

function createOfferSDP() {
  dcChat = pc.createDataChannel("chat");

  pc.createOffer()
    .then((offer) => pc.setLocalDescription(offer))
    .catch((err) => console.error("failed to create offer", err));

  dcChat.onopen = () => {
    disableTextareas();
    addMSG("CONNECTED!", "info");
  };

  dcChat.onmessage = (event) => {
    if (event.data) addMSG(event.data, "other");
  };
}

function start() {
  const answerSDP = joinerAnswerField.value.trim();

  if (!answerSDP) {
    alert("Please paste the joiner SDP");
    return;
  }

  try {
    const answerDesc = new RTCSessionDescription(JSON.parse(answerSDP));
    pc.setRemoteDescription(answerDesc)
      .then(() => (connectBtn.disabled = true))
      .catch((err) => console.error("failed to set remote description", err));
  } catch (err) {
    console.error("invalid SDP", err);
    alert("Invalid SDP format");
  }
}

function addMSG(msg, who) {
  let wrap = document.createElement("div");
  wrap.classList.add("wrap");

  let div = document.createElement("div");
  div.classList.add(who);
  wrap.appendChild(div);

  let whoSpan = document.createElement("span");
  whoSpan.innerHTML = `${who}:`;
  whoSpan.classList.add("who");
  div.appendChild(whoSpan);

  let msgSpan = document.createElement("span");
  msgSpan.innerHTML = msg;
  msgSpan.classList.add("msg");
  div.appendChild(msgSpan);

  chatScreen.appendChild(wrap);

  chatScreenWP.scrollTop = chatScreen.scrollHeight;
}

function sendMSG() {
  var value = msgPrompt.value.trim();
  if (value && dcChat) {
    dcChat.send(value);
    addMSG(value, "me");
    msgPrompt.value = "";
  }
}

function disableTextareas() {
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach((textarea) => (textarea.disabled = true));
}

msgPrompt.onkeydown = (event) => {
  if (event.key === "Enter") {
    sendMSG();
  }
};

function toggleConnectBtn() {
  connectBtn.disabled = !joinerAnswerField.value.trim();
}

joinerAnswerField.oninput = toggleConnectBtn;

connectBtn.onclick = start;
sendBtn.onclick = sendMSG;

createOfferSDP();
