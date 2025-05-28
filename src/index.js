"use strict";
class RoboChat {
    constructor(strSelector) {
        this.chatStarted = false;
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.onHoldScriptInd = 0;
        this.onHoldScript = [];
        this.serverUrl = 'https://limegreen-wasp-689058.hostingersite.com/api';
        this.currentMsg = [];
        this.maxMsgCount = 20;
        this.socket = io('https://socket.roomx.xyz');
        this.floatingChatIcon = `
    <div class="roboChat-floating-chatbox roboChat-hidden">
      <div>
        <label>RoboChat</label>
        <span id="spanChatboxClose">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </span>
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
        <div id="chatfield">
          <label>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/>
            </svg>
            <input id="roboChat-inFile" type="file" accept="" />
          </label>
          <div>
            <input id="roboChat-inMsg" placeholder="send a message..."/>
            <div id="roboChat-divFileToUpload" class="roboChat-hidden"></div>
          </div>
          <span id="roboChat-btnEmoji">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
            </svg>
          </span>
          <span id="roboChat-btnSendMsg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/>
            </svg>
          </span>
        </div>
      <button id="btn-start-chat" class="roboChat-start-button">Start the Chat</button>
      </div>
    </div>
    <emoji-picker class="roboChat-hidden"></emoji-picker>
  `;
        this.defaultOpt = {
            "chat-pos": 'right',
            "chat-floating-icon": {
                "background-color": 'black',
                "logo-color": 'white'
            }
        };
        this.icons = {
            tick: `
      <svg class="roboChat-hidden tickIcon" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title/>
        <g id="Complete">
          <g id="tick">
            <polyline fill="none" points="3.7 14.3 9.6 19 20.3 5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </g>
        </g>
      </svg>
    `,
            doubleTick: `
      <svg class="roboChat-hidden doubleTickIcon" width="800px" height="800px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.03033 11.4697C4.73744 11.1768 4.26256 11.1768 3.96967 11.4697C3.67678 11.7626 3.67678 12.2374 3.96967 12.5303L5.03033 11.4697ZM8.5 16L7.96967 16.5303C8.26256 16.8232 8.73744 16.8232 9.03033 16.5303L8.5 16ZM17.0303 8.53033C17.3232 8.23744 17.3232 7.76256 17.0303 7.46967C16.7374 7.17678 16.2626 7.17678 15.9697 7.46967L17.0303 8.53033ZM9.03033 11.4697C8.73744 11.1768 8.26256 11.1768 7.96967 11.4697C7.67678 11.7626 7.67678 12.2374 7.96967 12.5303L9.03033 11.4697ZM12.5 16L11.9697 16.5303C12.2626 16.8232 12.7374 16.8232 13.0303 16.5303L12.5 16ZM21.0303 8.53033C21.3232 8.23744 21.3232 7.76256 21.0303 7.46967C20.7374 7.17678 20.2626 7.17678 19.9697 7.46967L21.0303 8.53033ZM3.96967 12.5303L7.96967 16.5303L9.03033 15.4697L5.03033 11.4697L3.96967 12.5303ZM9.03033 16.5303L17.0303 8.53033L15.9697 7.46967L7.96967 15.4697L9.03033 16.5303ZM7.96967 12.5303L11.9697 16.5303L13.0303 15.4697L9.03033 11.4697L7.96967 12.5303ZM13.0303 16.5303L21.0303 8.53033L19.9697 7.46967L11.9697 15.4697L13.0303 16.5303Z" fill="#000000"/>
      </svg>
    `
        };
        this.element = document.querySelector(strSelector);
        this.element.classList.add("roboChat");
        this.originUrl = window.location.origin === 'null' ? 'localhost' : window.location.origin;
        this.clientUserId = this.getCookieData().roboChatClientUserId;
        if (this.clientUserId) {
            this.getChatHistory();
        }
        if (!this.originUrl || this.originUrl === 'null') {
            throw new Error("Please enter a valid origin url");
        }
        this.init();
    }
    // Add this as a method inside your RoboChat class
    showAlert(options) {
        var _a, _b, _c;
        // Default values
        const type = options.type || 'info';
        const confirmText = options.confirmText || 'OK';
        const autoClose = options.autoClose || 0;
        // Create alert container - place it inside the chat container
        const chatContainer = document.getElementById('roboChat-divChatViewMsgContainer');
        const alertOverlay = document.createElement('div');
        alertOverlay.className = 'roboChat-alert-overlay';
        // Create alert content
        let iconSvg = '';
        switch (type) {
            case 'success':
                iconSvg = `<svg viewBox="0 0 24 24" class="roboChat-alert-icon roboChat-alert-icon-success">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
        </svg>`;
                break;
            case 'error':
                iconSvg = `<svg viewBox="0 0 24 24" class="roboChat-alert-icon roboChat-alert-icon-error">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
        </svg>`;
                break;
            case 'warning':
                iconSvg = `<svg viewBox="0 0 24 24" class="roboChat-alert-icon roboChat-alert-icon-warning">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path>
        </svg>`;
                break;
            default:
                iconSvg = `<svg viewBox="0 0 24 24" class="roboChat-alert-icon roboChat-alert-icon-info">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
        </svg>`;
        }
        // Create alert HTML
        alertOverlay.innerHTML = `
      <div class="roboChat-alert roboChat-alert-${type}">
        <div class="roboChat-alert-close">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </div>
        <div class="roboChat-alert-icon-box">
          ${iconSvg}
        </div>
        <div class="roboChat-alert-content">
          <h3 class="roboChat-alert-title">${options.title}</h3>
          ${options.message ? `<p class="roboChat-alert-message">${options.message}</p>` : ''}
        </div>
        <div class="roboChat-alert-actions">
          ${options.cancelText ? `<button class="roboChat-alert-button roboChat-alert-button-cancel">${options.cancelText}</button>` : ''}
          <button class="roboChat-alert-button roboChat-alert-button-confirm roboChat-alert-button-${type}">${confirmText}</button>
        </div>
      </div>
    `;
        // Add to DOM - inside the chat container instead of body
        if (chatContainer) {
            chatContainer.appendChild(alertOverlay);
        }
        else {
            // Fallback to body if container not found
            document.body.appendChild(alertOverlay);
        }
        // Animation
        setTimeout(() => {
            alertOverlay.classList.add('roboChat-alert-show');
        }, 10);
        // Close function
        const closeAlert = () => {
            alertOverlay.classList.remove('roboChat-alert-show');
            setTimeout(() => {
                if (chatContainer && chatContainer.contains(alertOverlay)) {
                    chatContainer.removeChild(alertOverlay);
                }
                else if (document.body.contains(alertOverlay)) {
                    document.body.removeChild(alertOverlay);
                }
            }, 300);
        };
        // Event listeners
        (_a = alertOverlay.querySelector('.roboChat-alert-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            closeAlert();
        });
        (_b = alertOverlay.querySelector('.roboChat-alert-button-confirm')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            if (options.onConfirm)
                options.onConfirm();
            closeAlert();
        });
        if (options.cancelText) {
            (_c = alertOverlay.querySelector('.roboChat-alert-button-cancel')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
                if (options.onCancel)
                    options.onCancel();
                closeAlert();
            });
        }
        // Auto close
        if (autoClose > 0) {
            setTimeout(closeAlert, autoClose);
        }
    }
    detectFileType(mediaUrl) {
        var _a;
        if (typeof mediaUrl !== 'string')
            return 'unknown';
        if (mediaUrl.startsWith('data:')) {
            const match = mediaUrl.match(/^data:(.+?);base64,/);
            if (match && match[1]) {
                const mime = match[1];
                if (mime.startsWith('image/'))
                    return 'image';
                if (mime === 'application/pdf')
                    return 'pdf';
                return mime; // other MIME type like audio/mp3 etc.
            }
        }
        try {
            const url = new URL(mediaUrl);
            const path = url.pathname;
            const ext = (_a = path.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (!ext)
                return 'unknown';
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext))
                return 'image';
            if (ext === 'pdf')
                return 'pdf';
            return ext; // return known or unknown extension
        }
        catch (error) {
            return 'unknown';
        }
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
        const roboChat = this;
        const chatfield = document.querySelector("#chatfield");
        if (chatfield) {
            chatfield.classList.add('roboChat-hidden');
        }
        document.addEventListener("DOMContentLoaded", () => {
            const startButton = document.querySelector("#btn-start-chat");
            const chatfield = document.querySelector("#chatfield");
            const messageView = document.querySelector("#roboChat-divChatViewMsg");
            const timeFormat = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (startButton && chatfield && messageView) {
                startButton.addEventListener("click", () => {
                    var _a;
                    chatfield.classList.remove("roboChat-hidden");
                    startButton.classList.add("roboChat-hidden");
                    // Add agent message
                    if (!roboChat.getCookieData().roboChatClientUserId) {
                        messageView.innerHTML += `
                <div class="roboChat-agent" id="chat-form">
                  <div class="roboChat-container">
                    <div class="roboChat-form" aria-label="Chat start form">
                      <h2 class="chatform_header">Let's chat! Fill in a few details to get started.</h2>
                      <div class="roboChat-input-group">
                        <label for="roboChat-name">Name:</label>
                        <input 
                          type="text" 
                          id="roboChat-name" 
                          name="roboChat-name"
                          class="roboChat-input" 
                          placeholder="Enter your name" 
                          required 
                          aria-required="true"
                        >
                      </div>
    
                      <div class="roboChat-input-group">
                        <label for="roboChat-email">E-mail:</label>
                        <input 
                          type="email" 
                          id="roboChat-email" 
                          name="roboChat-email"
                          class="roboChat-input" 
                          placeholder="Enter your email" 
                          required 
                          aria-required="true"
                        >
                      </div>
    
                      <div class="button-wrapper">
                      <button type="button" id="roboChat-start-inner" class="roboChat-button">Start the Chat</button>
                      </div>
                    </div>
    
                    <div class="roboChat-timestamp">
                      <span id="roboChat-time">${timeFormat}</span>
                    </div>
                  </div>
                </div>
            `;
                    }
                    const self = this;
                    // // Add event listener for the inner start button - ADD THIS CODE HERE
                    (_a = document.getElementById('roboChat-start-inner')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                        const nameInput = document.getElementById('roboChat-name');
                        const emailInput = document.getElementById('roboChat-email');
                        const name = (nameInput === null || nameInput === void 0 ? void 0 : nameInput.value.trim()) || '';
                        const email = (emailInput === null || emailInput === void 0 ? void 0 : emailInput.value.trim()) || '';
                        if (!name || !email) {
                            self.showAlert({
                                title: 'Input Required',
                                message: 'Please enter both name and email to start the chat',
                                type: 'warning',
                                autoClose: 3000
                            });
                            return;
                        }
                        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const formContainer = document.querySelector('#chat-form');
                        if (formContainer) {
                            formContainer.remove();
                        }
                        //messageView.innerHTML += `
                        //  <div class="roboChat-agent">
                        //    <div class="roboChat-message">
                        //      <div class="roboChat-content">
                        //        Welcome, ${name}! How can I assist you today?
                        //      </div>
                        //      <div class="roboChat-timestamp">
                        //        <span>${currentTime}</span>
                        //      </div>
                        //    </div>
                        //  </div>
                        //`;
                        const userData = { name, email };
                        console.log('User data:', userData);
                        fetch(roboChat.serverUrl + '/register-chat-plugin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: userData.name,
                                email: userData.email
                            })
                        })
                            .then(res => res.json())
                            .then(data => {
                            let cookieData = roboChat.getCookieData();
                            cookieData['roboChatClientUserId'] = data.clientUserId;
                            document.cookie = 'data=' + JSON.stringify(cookieData);
                            roboChat.clientUserId = data.clientUserId;
                            roboChat.getChatHistory();
                            self.chatStarted = true;
                        });
                        const chatInput = document.querySelector('.roboChat-input-area');
                        if (chatInput) {
                            chatInput.classList.remove('roboChat-hidden');
                        }
                    });
                });
            }
        });
        document.addEventListener('click', ev => {
            // if(!document.querySelector('.roboChat-floating-chatbox.roboChat-hidden') && !(ev.target! as HTMLElement).closest('.roboChat-floating-chatbox') && !(ev.target! as HTMLElement).closest('.roboChat-floating-icon')) {
            //   document.querySelector(".roboChat-floating-icon")!.classList.remove('roboChat-hidden');
            //   document.querySelector(".roboChat-floating-chatbox")!.classList.add('roboChat-hidden');
            // }
            if (!document.querySelector('emoji-picker.roboChat-hidden') && !ev.target.closest('emoji-picker') && !ev.target.closest('#roboChat-btnEmoji')) {
                document.querySelector("emoji-picker").classList.add('roboChat-hidden');
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
        document.addEventListener('DOMContentLoaded', () => {
            const input = document.querySelector('#roboChat-inMsg');
            const sendBtn = document.querySelector('#roboChat-btnSendMsg');
            if (input && sendBtn) {
                input.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter' && !ev.shiftKey) {
                        ev.preventDefault();
                        sendBtn.dispatchEvent(new Event('click'));
                    }
                });
            }
        });
        document.querySelector('#roboChat-btnSendMsg').addEventListener('click', ev => {
            console.log(this.chatStarted);
            if (!this.chatStarted) {
                this.showAlert({
                    title: 'Chat Not Started',
                    message: 'Please start the chat first by providing your name and email.',
                    type: 'warning',
                    autoClose: 3000
                });
                return;
            }
            let latestMsgElement;
            this.inMsg = document.querySelector('#roboChat-inMsg').value;
            const files = document.querySelector('#roboChat-inFile').files;
            if (this.inMsg || files.length) {
                const formData = new FormData();
                formData.append('clientUserId', String(roboChat.clientUserId));
                formData.append('originUrl', roboChat.originUrl);
                const currDate = new Date();
                const timeFormat = currDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                const fileInputHidden = document.querySelector("#roboChat-divFileToUpload").classList.contains('roboChat-hidden');
                if (fileInputHidden) {
                    this.scrollBtm(() => {
                        // Remove previous "Delivered" label if exists
                        const previousDelivered = document.querySelectorAll('#roboChat-divChatViewMsg .roboChat-user small');
                        previousDelivered.forEach(el => el.remove());
                        // Add the new message
                        document.querySelector('#roboChat-divChatViewMsg').innerHTML += `
              <div class="roboChat-user">
                <div class="roboChat-bubble">
                  <label>${this.inMsg}</label>
                  <span class="roboChat-meta">
                    <span>${timeFormat}</span>
                    ${this.icons.doubleTick}
                    ${this.icons.tick}
                  </span>
                </div>
                <small>Delivered</small>
              </div>`;
                    });
                    formData.append('msg', String(this.inMsg));
                    this.inMsg = "";
                    document.querySelector('#roboChat-inMsg').value = this.inMsg;
                    latestMsgElement = document.querySelector('.roboChat-user:last-of-type');
                    fetch(this.serverUrl + '/msg-from-client', {
                        method: "POST",
                        body: formData
                    })
                        .then(res => res.json())
                        .then(data => {
                        //latestMsgElement.querySelector('svg.tickIcon')!.classList.remove('roboChat-hidden');        
                    });
                }
                else {
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onload = e => {
                        const result = e.target.result;
                        this.scrollBtm(() => {
                            this.inMsg = document.querySelector('#roboChat-inMsg').value;
                            // Remove all previous "Delivered" tags
                            const previousDelivered = document.querySelectorAll('#roboChat-divChatViewMsg .roboChat-user small');
                            previousDelivered.forEach(el => el.remove());
                            // Add the new image message with "Delivered"
                            document.querySelector('#roboChat-divChatViewMsg').innerHTML += `
                <div class="roboChat-user">
                  <div class="roboChat-imgContainer">
                    <img src="${result}"/>
                    <div>
                      <span>${timeFormat}</span>
                      ${this.icons.tick}
                      ${this.icons.doubleTick}
                    </div>
                    <small>Delivered</small>
                  </div>
                </div>`;
                        });
                        document.querySelector("#roboChat-divFileToUpload").innerHTML = '';
                        document.querySelector("#roboChat-divFileToUpload").classList.add('roboChat-hidden');
                        document.querySelector("#roboChat-divFileToUpload").value = '';
                        document.querySelector("#roboChat-inMsg").classList.remove('roboChat-hidden');
                        formData.append('file', file);
                        formData.append('media_url', result);
                        formData.append('media_content_type', file.type);
                        latestMsgElement = document.querySelector('.roboChat-user:last-of-type');
                        fetch(this.serverUrl + '/msg-from-client', {
                            method: "POST",
                            body: formData
                        })
                            .then(res => res.json())
                            .then(data => {
                            //latestMsgElement.querySelector('svg.tickIcon')!.classList.remove('roboChat-hidden');        
                        });
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
        document.querySelector("#roboChat-btnEmoji").addEventListener("click", ev => {
            document.querySelector("emoji-picker").classList.toggle('roboChat-hidden');
            this.repositionEmojiPicker();
        });
        window.addEventListener("resize", () => {
            this.repositionEmojiPicker();
        });
        document.querySelector("emoji-picker").addEventListener('emoji-click', (ev) => {
            document.querySelector("#roboChat-inMsg").value = document.querySelector("#roboChat-inMsg").value + ev.detail.unicode;
        });
        // File upload handling function using your existing TypeScript structure
        document.querySelector('#roboChat-inFile').addEventListener('change', (ev) => {
            const fileUploadContainer = document.querySelector("#roboChat-divFileToUpload");
            const file = ev.target.files[0];
            if (!file)
                return;
            // Determine file type to show appropriate icon
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            let fileIcon = '';
            if (isPDF) {
                fileIcon = `
          <svg class="roboChat-fileUpload-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v1.25c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.55.45-1 1-1H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2c-.28 0-.5-.22-.5-.5v-5c0-.28.22-.5.5-.5h2c.83 0 1.5.67 1.5 1.5v3zm4-3.75c0 .41-.34.75-.75.75H19v1h.75c.41 0 .75.34.75.75s-.34.75-.75.75H19v1.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.55.45-1 1-1h1.25c.41 0 .75.34.75.75zM9 9.5h1v-1H9v1zM3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1zm11 5.5h1v-3h-1v3z"/>
          </svg>
        `;
            }
            else if (isImage) {
                fileIcon = `
          <svg class="roboChat-fileUpload-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        `;
            }
            else {
                fileIcon = `
          <svg class="roboChat-fileUpload-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        `;
            }
            // Create the complete UI with status indicator and send button
            fileUploadContainer.innerHTML = `
        <div class="roboChat-fileUpload-wrapper">
          <div class="roboChat-fileUpload-status">
            <div class="roboChat-fileUpload-status-text">
              <div class="roboChat-fileUpload-status-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <span>1 of 1 uploaded</span>
            </div>
            <div class="roboChat-fileUpload-delete">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: #ff3b30;">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
          </div>
          
          <div id="roboChat-imgToUploadContainer">
            ${fileIcon}
            <label>${file.name}</label>
            <img src="src/assets/images/close.svg"/>
          </div>
          
          <button class="roboChat-send-file-btn">Send files</button>
        </div>
      `;
            document.querySelector("#roboChat-inMsg").classList.add('roboChat-hidden');
            fileUploadContainer.classList.remove('roboChat-hidden');
            // Add click event for the delete button
            document.querySelector('.roboChat-fileUpload-delete').addEventListener('click', () => {
                fileUploadContainer.innerHTML = '';
                fileUploadContainer.classList.add('roboChat-hidden');
                document.querySelector("#roboChat-inMsg").classList.remove('roboChat-hidden');
                ev.target.value = '';
                const latestMsgElement = document.querySelector('.roboChat-user:last-of-type');
            });
            // Also keep your original close button functionality
            fileUploadContainer.querySelector('#roboChat-imgToUploadContainer > img').addEventListener('click', () => {
                fileUploadContainer.innerHTML = '';
                fileUploadContainer.classList.add('roboChat-hidden');
                document.querySelector("#roboChat-inMsg").classList.remove('roboChat-hidden');
                ev.target.value = '';
            });
            // Add click event for the send button
            document.querySelector('.roboChat-send-file-btn').addEventListener('click', () => {
                // Assume `file` is already defined properly
                console.log('Sending file:', file);
                console.log('Sending file:', String(this.clientUserId));
                let formData = new FormData();
                formData.append('clientUserId', String(this.clientUserId));
                formData.append('originUrl', this.originUrl);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target.result;
                    formData.append('file', file);
                    formData.append('media_content_type', file.type);
                    formData.append('media_url', result);
                    this.scrollBtm(() => {
                        const fileType = this.detectFileType(result);
                        let mediaHtml = '';
                        switch (fileType) {
                            case 'image':
                                mediaHtml = `<img src="${result}" style="max-width: 100%; border-radius: 8px;" />`;
                                break;
                            case 'pdf':
                                mediaHtml = `<a href="${result}" target="_blank" download style="color: #15C0E6;">Download PDF</a>`;
                                break;
                            case 'video/mp4':
                                mediaHtml = `<video src="${result}" controls style="max-width: 200px; border-radius: 8px; padding: 10px;"></video>`;
                                break;
                            case 'audio/mpeg':
                                mediaHtml = `<audio src="${result}" controls style="max-width: 300px; max-height: 40px; padding: 8px;"></audio>`;
                                break;
                            default:
                                mediaHtml = `<a href="${result}" target="_blank" download style="color: #15C0E6;">Download File</a>`;
                        }
                        // Remove any previous "Delivered" labels
                        const previousDelivered = document.querySelectorAll('#roboChat-divChatViewMsg .roboChat-user small');
                        previousDelivered.forEach(el => el.remove());
                        const timeFormat = new Date().toLocaleTimeString();
                        this.inMsg = document.querySelector('#roboChat-inMsg').value;
                        document.querySelector('#roboChat-divChatViewMsg').innerHTML += `
              <div class="roboChat-user">
                <div class="roboChat-imgContainer">
                  ${mediaHtml}
                  <div>
                    <span>${timeFormat}</span>
                    ${this.icons.tick}
                    ${this.icons.doubleTick}
                  </div>
                </div>
                <small>Delivered</small>
              </div>`;
                        document.querySelector("#roboChat-divFileToUpload").innerHTML = '';
                        document.querySelector("#roboChat-divFileToUpload").classList.add('roboChat-hidden');
                        document.querySelector("#roboChat-divFileToUpload").value = '';
                        document.querySelector("#roboChat-inMsg").classList.remove('roboChat-hidden');
                        const latestMsgElement = document.querySelector('.roboChat-user:last-of-type');
                        fetch(this.serverUrl + '/msg-from-client', {
                            method: "POST",
                            body: formData
                        })
                            .then(res => res.json())
                            .then(data => {
                            latestMsgElement.querySelector('svg.tickIcon').classList.remove('roboChat-hidden');
                            latestMsgElement.querySelector('svg.tickIcon').classList.remove('roboChat-hidden');
                        });
                    });
                };
                reader.readAsDataURL(file);
            });
        });
    }
    repositionEmojiPicker() {
        const emojiPickerBtnRect = document.querySelector("#roboChat-btnEmoji").getBoundingClientRect();
        const emojiPickerPopup = document.querySelector("emoji-picker");
        const emojiPickerPopupRect = emojiPickerPopup.getBoundingClientRect();
        emojiPickerPopup.style.top = `calc(${emojiPickerBtnRect.y}px - ${emojiPickerPopupRect.height}px - 20px)`;
        emojiPickerPopup.style.left = `calc(${emojiPickerBtnRect.x}px - ${emojiPickerPopupRect.width}px + 30px)`;
    }
    scrollBtm(func) {
        const isScrollBtm = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight - document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop === document.querySelector("#roboChat-divChatViewMsgContainer").clientHeight;
        func();
        if (isScrollBtm) {
            setTimeout(() => {
                document.querySelector("#roboChat-divChatViewMsgContainer").scrollTop = document.querySelector("#roboChat-divChatViewMsgContainer").scrollHeight;
            }, 100);
        }
    }
    getCookieData() {
        let cookies = document.cookie.split("; ").filter(val => val.startsWith("data="));
        const data = cookies.length ? cookies[0].replace("data=", "") : '{}';
        return cookies.length ? JSON.parse(data ? data : '{}') : {};
    }
    receiveMessage(message) {
        if (document.visibilityState === "visible") {
            console.log(`📩 Message "${message.status}" is READ (user is in chatroom ${message.chatSessionId})`);
            const formData = new FormData();
            formData.append('chatSessionId', message.chatSessionId);
            formData.append('read_status', message.status);
            formData.append('read_role', 'agent');
            formData.append('role_action', 'agent_read');
            formData.append('originUrl', this.originUrl);
            fetch(this.serverUrl + '/msg-read-status', {
                method: "POST",
                body: formData
            })
                .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error: ${res.status}`);
                }
                return res.json(); // Parse JSON response
            })
                .then(result => {
                console.log(result);
            })
                .catch(err => {
                console.error("❌ Failed to update read status:", err);
            });
        }
        else {
            console.log(`📪 Message "unread" (user not in chatroom or tab is inactive for chatSession ${message.chatSessionId})`);
            // Optionally trigger badge, notification, or store as unread
        }
    }
    getChatHistory() {
        var _a;
        fetch(this.serverUrl + '/get-client-chat-history?' + new URLSearchParams({
            "clientUserId": String(this.clientUserId),
            "role": "client",
            "originUrl": (_a = this.originUrl) !== null && _a !== void 0 ? _a : ""
        }))
            .then(res => {
            if (!res.ok) {
                res.json().then((err) => {
                    if (err.msg && err.msg === 'user not exist') {
                        const cookieData = this.getCookieData();
                        cookieData['roboChatClientUserId'] = null;
                        document.cookie = 'data=' + JSON.stringify(cookieData);
                    }
                });
            }
            else {
                return res.json();
            }
        })
            .then((data) => {
            this.chatStarted = true;
            this.chatHistory = data.usrChatHistory;
            //this.chatHistory!.forEach((val: any,ind: number)=> {
            //  val.forEach((vle: any,idx: number)=> {
            //    if(ind === 0 && idx === 0) {
            //      this.chatSessionId = vle.chat_session_id;
            //    }
            //    document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-${vle.user_role === 'client'?"user":"agent"}"><label>${vle.message}</label></div>`;
            //  })
            //})
            this.chatHistory.forEach((val, ind) => {
                const sentDate = new Date(Date.UTC(new Date(val.created_at.replace(" ", "T")).getFullYear(), new Date(val.created_at.replace(" ", "T")).getMonth(), new Date(val.created_at.replace(" ", "T")).getDate(), new Date(val.created_at.replace(" ", "T")).getHours(), new Date(val.created_at.replace(" ", "T")).getMinutes(), new Date(val.created_at.replace(" ", "T")).getSeconds()));
                const timeFormat = sentDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                let chatType = val.role;
                if (chatType === 'bot' || chatType === 'admin' || chatType === 'staff' || chatType === 'system') {
                    chatType = 'agent';
                }
                else if (chatType === 'client') {
                    chatType = 'user';
                }
                const fileType = this.detectFileType(val.media_url);
                console.log("Detected file type:", fileType);
                let mediaHtml = '';
                if (fileType === 'image') {
                    mediaHtml = `<img src="${val.media_url}" />`;
                }
                else if (fileType === 'pdf') {
                    mediaHtml = `<span><a href="${val.media_url}" target="_blank" style="color: #15C0E6;" download>Download File</a></span>`;
                }
                else if (fileType === 'video/mp4') {
                    mediaHtml = `<span><video src="${val.media_url}" controls style="max-width: 200px; border-radius: 8px; padding: 10px;"></video></span>`;
                }
                else if (fileType === 'audio/mpeg') {
                    mediaHtml = `<span><audio src="${val.media_url}" controls style="max-width: 300px;max-height: 40px;padding: 8px;"></audio></span>`;
                }
                else {
                    mediaHtml = `<span><a href="${val.media_url}" target="_blank" style="color: #15C0E6;" download>Download File</a></span>`;
                }
                if (!val.message && val.media_url) {
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
            <div class="roboChat-${chatType}">
              <div class="roboChat-imgContainer">
                ${mediaHtml}
                <div>
                  <span>${timeFormat}</span>
                  ${chatType === 'user' ? this.icons.tick : ''}
                  ${chatType === 'user' ? this.icons.doubleTick : ''}
                </div>
              </div>
            </div>
          `;
                }
                else {
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
            <div class="roboChat-${chatType}">
              ${chatType === 'msg' ? `<label>${val.message}</label>` : `
                <div>
                  <label>${val.message}</label>
                  <span>
                    ${chatType !== 'msg' ? `<span>${timeFormat}</span>` : ''}
                    ${chatType === 'user' ? this.icons.tick + this.icons.doubleTick : ''}
                    ${chatType === 'user' ? this.icons.doubleTick : ''}
                  </span>
                </div>
              `}
            </div>
          `;
                }
                if (chatType === 'user') {
                    const lastUserChat = document.querySelector('.roboChat-user:last-of-type');
                    //if(val.status === 'delivered'){
                    //  lastUserChat.querySelector('svg.tickIcon')!.classList.remove('roboChat-hidden');
                    //}
                    //else if(val.status === 'read'){
                    //  lastUserChat.querySelector('svg.doubleTickIcon')!.classList.remove('roboChat-hidden');
                    //}
                }
            });
            this.socket.on(`on-hold-chat-${this.clientUserId}`, (data) => {
                const currDate = new Date();
                const timeFormat = currDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                document.querySelector("#roboChat-inMsg").disabled = data.isOnHold;
                document.querySelector("#roboChat-btnSendMsg").disabled = data.isOnHold;
                clearInterval(this.onHoldInterval);
                if (data.isOnHold) {
                    this.onHoldScriptInd = 0;
                    this.onHoldScript = data.onholdScript;
                    this.scrollBtm(() => {
                        document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
            <div class="roboChat-agent">
                <div>
                  <label>chat is currently on-hold</label>
                  <span>
                    <span>${timeFormat}</span>
                  </span>
                </div>
            </div>`;
                    });
                    this.onHoldInterval = setInterval(() => {
                        const currDate = new Date();
                        const timeFormat = currDate.toLocaleString("en-US", {
                            timeZone: this.timezone,
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false
                        });
                        document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
            <div class="roboChat-agent">
                <div>
                  <label>${this.onHoldScript[this.onHoldScriptInd]}</label>
                  <span>
                    <span>${timeFormat}</span>
                  </span>
                </div>
            </div>`;
                        fetch(this.serverUrl + '/on-hold-script', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                clientUserId: this.clientUserId,
                                msg: this.onHoldScript[this.onHoldScriptInd]
                            })
                        })
                            .then(res => res.json())
                            .then(data => {
                        });
                        this.onHoldScriptInd++;
                        if (this.onHoldScriptInd === this.onHoldScript.length) {
                            this.onHoldScriptInd = 0;
                        }
                    }, data.onholdTime);
                }
                else {
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
          <div class="roboChat-agent">
            <div>
              <label>chat has resumed</label>
              <span>
                <span>${timeFormat}</span>
              </span>
            </div>
          </div>`;
                }
            });
            this.socket.on(`chat-transfer-${this.clientUserId}`, (transferToTeamName) => {
                const currDate = new Date();
                const timeFormat = currDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                this.scrollBtm(() => {
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
          <div class="roboChat-agent">
            <div>
              <label>connecting you to a new agent</label>
              <span>
                <span>${timeFormat}</span>
              </span>
            </div>
          </div>`;
                });
            });
            this.socket.on(`agent-accept-chat-${this.clientUserId}`, (data) => {
                const currDate = new Date();
                const timeFormat = currDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                this.scrollBtm(() => {
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
          <div class="roboChat-agent">
            <div>
              <label>${data.agentName}</label>
              <span>
                <span>${timeFormat}</span>
              </span>
            </div>
          </div>`;
                });
            });
            this.socket.on(`agent-send-msg-${this.clientUserId}`, (data) => {
                const currDate = new Date();
                const timeFormat = currDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                let chatType = 'agent';
                try {
                    this.receiveMessage({ chatSessionId: data.data.chatSessionId, status: "read" });
                }
                catch (error) {
                    console.error("Failed to mark message as read:", error);
                }
                this.scrollBtm(() => {
                    this.inMsg = document.querySelector('#roboChat-inMsg').value;
                    if (!data.data.agentMsg && data.data.attachment_type) {
                        const fileType = data.data.attachment_type;
                        console.log("Detected file type:", fileType);
                        let mediaHtml = '';
                        if (fileType.startsWith('image/')) {
                            mediaHtml = `<img src="${fileType}" />`;
                        }
                        else if (fileType.startsWith('application/')) {
                            mediaHtml = `<span><a href="${fileType}" target="_blank" style="color: #15C0E6;" download>Download File</a></span>`;
                        }
                        else if (fileType.startsWith('video/')) {
                            mediaHtml = `<span><video src="${fileType}" controls style="max-width: 200px; border-radius: 8px; padding: 10px;"></video></span>`;
                        }
                        else if (fileType.startsWith('audio/')) {
                            mediaHtml = `<span><audio src="${fileType}" controls style="max-width: 300px;max-height: 40px;padding: 8px;"></audio></span>`;
                        }
                        else {
                            mediaHtml = `<span><a href="${fileType}" target="_blank" style="color: #15C0E6;" download>Download File</a></span>`;
                        }
                        document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
              <div class="roboChat-${chatType}">
                <div class="roboChat-imgContainer">
                  ${mediaHtml}
                  <div>
                    <span>${timeFormat}</span>
                  </div>
                </div>
              </div>
            `;
                    }
                    else {
                        document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
              <div class="roboChat-${chatType}">
                  <div>
                    <label>${data.data.agentMsg}</label>
                    <span>
                      <span>${timeFormat}</span>
                    </span>
                  </div>
              </div>
            `;
                    }
                });
            });
            this.socket.on(`msg-read-status-${this.clientUserId}`, (data) => {
                if (data.data.read_status === 'read') {
                    // Select the last .roboChat-user small element
                    const lastStatus = document.querySelector('#roboChat-divChatViewMsg .roboChat-user small:last-of-type');
                    if (lastStatus) {
                        lastStatus.textContent = 'Read';
                    }
                }
            });
            this.socket.on(`end-chat-session-${this.clientUserId}`, (data) => {
                const currDate = new Date();
                const timeFormat = currDate.toLocaleString("en-US", {
                    timeZone: this.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                this.scrollBtm(() => {
                    this.inMsg = document.querySelector('#roboChat-inMsg').value;
                    document.querySelector('#roboChat-divChatViewMsg').innerHTML += `
            <div class="roboChat-agent">
              <div>
                <label>${data.msg}</label>
                <span>
                  ${`<span>${timeFormat}</span>`}
                </span>
              </div>
            </div>    
          `;
                    document.querySelector("#roboChat-divChatViewMsg").innerHTML += `
            <div class="roboChat-agent">
              <div>
                <label>chat session ended</label>
                <span>
                  ${`<span>${timeFormat}</span>`}
                </span>
              </div>
            </div>
          `;
                    clearInterval(this.onHoldInterval);
                });
            });
            this.socket.on(`msg-read-${this.clientUserId}`, (data) => {
                //document.querySelectorAll(`.roboChat-user:has(.doubleTickIcon.roboChat-hidden)`)!.forEach(item=> {
                //  item.querySelector('svg.tickIcon')!.classList.add('roboChat-hidden');
                //  item.querySelector('svg.doubleTickIcon')!.classList.remove('roboChat-hidden');
                //});
            });
        });
    }
}
//# sourceMappingURL=index.js.map