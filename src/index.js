"use strict";
class RoboChat {
    constructor(strSelector, options) {
        var _a, _b, _c;
        this.onHoldScriptInd = 0;
        this.onHoldScript = [];
        this.serverUrl = 'http://localhost:8000/api';
        this.currentMsg = [];
        this.maxMsgCount = 20;
        this.socket = io('http://localhost:3000');
        this.floatingChatIcon = `
    <div class="roboChat-floating-chatbox roboChat-hidden">
      <div>
        <label>RoboChat</label>
        <span id="spanChatboxClose">x</span>
      </div>
      <div id="roboChat-divChatViewMsgContainer">
        <div id="roboChat-divChatLoading">
          <div class="roboChat-user">
            <label>###########</label>
          </div>    
          <div class="roboChat-agent">
            <label> # 
            #################
            </label>
          </div>    
          <div class="roboChat-user">
            <label>##########</label>
            <label>##########</label>
          </div>    
          <div id="roboChat-divChatMsgBox" class="roboChat-agent">
            <label>###########</label>
            <label>##########</label>
          </div>    
          <div id="roboChat-divChatLoadingline"></div>
        </div>
        <div id="roboChat-divChatViewMsg" class="roboChat-hidden">
          
        </div>
      </div>
      <div>
        <input id="roboChat-inMsg" placeholder="Type something here..."/>
        <button id="roboChat-btnSendMsg">Send</button>
      </div>
    </div>
  `;
        this.defaultOpt = {
            "chat-pos": 'right',
            "chat-floating-icon": {
                "background-color": 'black',
                "logo-color": 'white'
            }
        };
        this.options = options !== null && options !== void 0 ? options : this.defaultOpt;
        this.element = document.querySelector(strSelector);
        this.element.classList.add("roboChat");
        this.originUrl = (_a = this.options.originUrl) !== null && _a !== void 0 ? _a : window.location.origin;
        this.clientEmail = this.options.clientEmail;
        //Func to be remove
        this.originUrl = 'localhost';
        this.clientEmail = 'leeweijie41200@gmail.com';
        fetch('http://localhost:8000/api/get-chat-history?' + new URLSearchParams({
            "email": (_b = this.clientEmail) !== null && _b !== void 0 ? _b : "",
            "role": "client",
            "originUrl": (_c = this.originUrl) !== null && _c !== void 0 ? _c : ""
        }))
            .then(res => res.json())
            .then(data => {
            if (this.clientUserId !== data.clientUserId) {
                this.clientUserId = data.clientUserId;
            }
            this.chatHistory = data.usrChatHistory;
            this.chatHistory.forEach((val, ind) => {
                val.forEach((vle, idx) => {
                    if (ind === 0 && idx === 0) {
                        this.chatSessionId = vle.chat_session_id;
                    }
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `<div class="roboChat-${vle.user_role === 'client' ? "user" : "agent"}"><label>${vle.message}</label></div>`;
                });
            });
            this.socket.on(`on-hold-chat-${this.clientUserId}`, (data) => {
                document.querySelector("#roboChat-inMsg").disabled = data.isOnHold;
                document.querySelector("#roboChat-btnSendMsg").disabled = data.isOnHold;
                clearInterval(this.onHoldInterval);
                if (data.isOnHold) {
                    this.onHoldScriptInd = 0;
                    this.onHoldScript = data.onholdScript;
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `<div class="roboChat-msg"><label>chat is currently on hold</label></div>`;
                    this.onHoldInterval = setInterval(() => {
                        document.querySelector("#roboChat-divChatViewMsg").innerHTML += `<div class="roboChat-msg"><label>${this.onHoldScript[this.onHoldScriptInd]}</label></div>`;
                        this.onHoldScriptInd++;
                        if (this.onHoldScriptInd === this.onHoldScript.length) {
                            this.onHoldScriptInd = 0;
                        }
                    }, data.onholdTime);
                }
                else {
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `<div class="roboChat-msg"><label>chat has resumed</label></div>`;
                }
            });
            this.socket.on(`chat-transfer-${this.clientUserId}`, (transferToTeamName) => {
                document.querySelector("#roboChat-divChatViewMsg").innerHTML += `<div class="roboChat-msg"><label>transfering you to a new agent</label></div>`;
            });
            this.socket.on(`agent-accept-chat-${this.clientUserId}`, (data) => {
                document.querySelector("#roboChat-divChatViewMsg").innerHTML += `<div class="roboChat-msg"><label>agent ${data.agentName} connected</label></div>`;
            });
        });
        this.socket.on(`agent-send-msg-${this.clientUserId}`, (data) => {
            const isScrollBtm = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight - document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop === document.querySelector("#roboChat-divChatViewMsgContainer").clientHeight;
            this.inMsg = document.querySelector('#roboChat-inMsg').value;
            document.querySelector('#roboChat-divChatViewMsg').innerHTML += `
        <div class="roboChat-agent">
          <label>${data.data.agentMsg}</label>
        </div>    
      `;
            if (isScrollBtm) {
                document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight;
            }
        });
        if (!this.originUrl || this.originUrl === 'null') {
            throw new Error("Please enter a valid origin url");
        }
        this.init();
    }
    init() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("viewBox", "0 0 512 512");
        path.setAttribute("d", "M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z");
        this.element.classList.add("roboChat-floating-icon");
        svg.append(path);
        this.element.append(svg);
        document.querySelector("body").innerHTML += this.floatingChatIcon;
        this.initEventListeners();
    }
    initEventListeners() {
        document.addEventListener('click', ev => {
            if (!document.querySelector('.roboChat-floating-chatbox.roboChat-hidden') && !ev.target.closest('.roboChat-floating-chatbox') && !ev.target.closest('.roboChat-floating-icon')) {
                document.querySelector(".roboChat-floating-icon").classList.remove('roboChat-hidden');
                document.querySelector(".roboChat-floating-chatbox").classList.add('roboChat-hidden');
            }
            document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight;
        });
        document.querySelector('#spanChatboxClose').addEventListener('click', ev => {
            document.querySelector(".roboChat-floating-icon").classList.remove('roboChat-hidden');
            document.querySelector(".roboChat-floating-chatbox").classList.add('roboChat-hidden');
        });
        document.querySelector(".roboChat-floating-icon").addEventListener('click', ev => {
            ev.currentTarget.classList.add('roboChat-hidden');
            document.querySelector(".roboChat-floating-chatbox").classList.remove('roboChat-hidden');
            document.querySelector('#roboChat-divChatLoading').classList.add('roboChat-hidden');
            document.querySelector('#roboChat-divChatViewMsg').classList.remove('roboChat-hidden');
        });
        document.querySelector('#roboChat-btnSendMsg').addEventListener('click', ev => {
            if (this.currentMsg.length === this.maxMsgCount) {
            }
            const isScrollBtm = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight - document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop === document.querySelector("#roboChat-divChatViewMsgContainer").clientHeight;
            this.inMsg = document.querySelector('#roboChat-inMsg').value;
            document.querySelector('#roboChat-divChatViewMsg').innerHTML += `
        <div class="roboChat-user">
          <label>${this.inMsg}</label>
        </div>    
      `;
            if (isScrollBtm) {
                document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight;
            }
            fetch(this.serverUrl + '/msg-from-client', {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    "clientUserId": this.clientUserId,
                    "originUrl": this.originUrl,
                    "msg": this.inMsg
                })
            })
                .then(res => res.json());
            //this.socket.emit('client-send-msg',{
            //  "clientUserId": this.clientUserId,
            //  "originUrl": this.originUrl,
            //  "msg": this.inMsg
            //})
            this.inMsg = "";
            document.querySelector('#roboChat-inMsg').value = this.inMsg;
        });
    }
}
