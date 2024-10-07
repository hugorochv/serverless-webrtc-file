import { disableTextareas } from "./common.js";

// ICE and WebRTC setup
// const server       = { urls: "stun:stun.l.google.com:19302" };
const sdpConstraints = { optional: [{ RtpDataChannels: true }] };
const pc = new RTCPeerConnection(null);
let dcChat, dcFiles;

// DOM Elements
const statusLabel = document.getElementById("status");
const createBtn = document.getElementById("create-btn");
const createOfferField = document.getElementById("creater-sdp");
const joinerAnswerField = document.getElementById("joiner-sdp");

// Chat-related DOM elements
const chatScreenWP = document.getElementById("chat-screen-wp");
const chatScreen = document.getElementById("chat-screen");
const msgPrompt = document.getElementById("msg");
const sendBtn = document.getElementById("send");

pc.ondatachannel = (event) => {
  console.log("Data channel is created!", event);

  dcChat = event.channel;

  dcChat.onopen = () => {
    disableTextareas();
    addMSG("CONNECTED!", "info");
  };

  dcChat.onmessage = (event) => {
    if (event.data) addMSG(event.data, "other");
  };
};

pc.oniceconnectionstatechange = () => {
  const state = pc.iceConnectionState;
  statusLabel.textContent = state;

  msgPrompt.disabled = state != "connected";
  sendBtn.disabled = state != "connected";
};

pc.onicecandidate = (event) => {
  if (event.candidate) return;
  joinerAnswerField.textContent = JSON.stringify(pc.localDescription);
};

function createAnswerSDP() {
  const offerSDP = createOfferField.value.trim();
  const offerDesc = new RTCSessionDescription(JSON.parse(offerSDP));
  pc.setRemoteDescription(offerDesc);

  pc.createAnswer(
    (answerDesc) => pc.setLocalDescription(answerDesc),
    () => console.warn("Couldn't create offer"),
    sdpConstraints
  );
}

function addMSG(msg, who) {
  let wrap = document.createElement("div");
  wrap.classList.add("wrap");

  let div = document.createElement("div");
  div.classList.add(who);
  wrap.appendChild(div);

  let whoSpan = document.createElement("span");
  whoSpan.innerHTML = who;
  whoSpan.classList.add("who");
  div.appendChild(whoSpan);

  let msgSpan = document.createElement("span");
  msgSpan.innerHTML = msg;
  msgSpan.classList.add("msg");
  div.appendChild(msgSpan);

  chatScreen.appendChild(wrap);

  chatScreenWP.scrollTop = chatScreen.scrollHeight;
}


function toggleCreateBtn() {
  createBtn.disabled = !createOfferField.value.trim();
}

createOfferField.oninput = toggleCreateBtn;

createBtn.onclick = createAnswerSDP;

// Chat-related Listeners
sendBtn.onclick = sendMSG;

msgPrompt.onkeydown = (event) => {
  if (event.key === "Enter") {
    sendMSG();
  }
};


