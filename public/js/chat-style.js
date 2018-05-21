/* eslint-disable */
let isChatWindowOpen = false;
var show = function() {
  let chatDiv = document.getElementById("chat-div");
  if(!isChatWindowOpen) {
    isChatWindowOpen = true;
    chatDiv.style.bottom = "0px";
  } else {
    isChatWindowOpen = false;
    chatDiv.style.bottom = "-330px";
  }
}
