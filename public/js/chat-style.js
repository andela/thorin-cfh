/* eslint-disable */
const chatDiv = document.getElementById("chat-div");
const chatHead = document.getElementById("chat-head");
console.log(chatHead);
  let isChatWindowOpen = false;
  chatHead.addEventListener('click', () => {
      if(!isChatWindowOpen) {
        isChatWindowOpen = true;
        chatDiv.style.bottom = "0px";
      } else {
        isChatWindowOpen = false;
        chatDiv.style.bottom = "-365px";
      }
  }, true);