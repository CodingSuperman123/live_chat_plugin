declare var io: any;

class RoboChat {
  private onHoldScriptInd: number = 0;
  private onHoldScript: Array<string> =  [];
  private onHoldInterval: any;
  private serverUrl = 'http://localhost:8000/api';
  private clientUserId?: string;
  private chatHistory?: Array<any>;
  private originUrl: string;
  private chatSessionId?: number; 
  private clientEmail?: string;
  private inMsg?: string;
  private currentMsg: Array<any> = [];
  private maxMsgCount: number = 20;
  private socket = io('http://localhost:3000');
  private element: HTMLElement | null;
  private floatingChatIcon: string = `
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
        <div>
          <label>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/>
            </svg>
            <input id="roboChat-inFile" type="file" accept="image/*, application/pdf"/>
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
      </div>
    </div>
    <emoji-picker class="roboChat-hidden"></emoji-picker>
  `
  private defaultOpt: object = {
    "chat-pos": 'right',
    "chat-floating-icon": {
      "background-color": 'black',
      "logo-color": 'white'
    }
  }
  private options: any;

  constructor(strSelector: string, options: { position?: string, originUrl?: string, clientEmail?: string }) {


    this.options = options?? this.defaultOpt;  
    this.element = document.querySelector(strSelector);
    this.element!.classList.add("roboChat");
    this.originUrl = this.options.originUrl??window.location.origin;
    this.clientEmail = this.options.clientEmail;


    //Func to be remove
    this.originUrl = 'localhost';
    this.clientEmail = 'leeweijie41200@gmail.com'


    fetch('http://localhost:8000/api/get-chat-history?'+new URLSearchParams({
        "email": this.clientEmail??"",
        "role": "client",
        "originUrl": this.originUrl??""
      })    
    )
    .then(res => res.json())
    .then(data=>{
      if(this.clientUserId !== data.clientUserId) {
        this.clientUserId = data.clientUserId;
      }
      
      this.chatHistory = data.usrChatHistory;


      //this.chatHistory!.forEach((val: any,ind: number)=> {
      //  val.forEach((vle: any,idx: number)=> {
      //    if(ind === 0 && idx === 0) {
      //      this.chatSessionId = vle.chat_session_id;
      //    }
      //    document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-${vle.user_role === 'client'?"user":"agent"}"><label>${vle.message}</label></div>`;
      //  })
      //})
      
      this.chatHistory!.forEach((val: any,ind: number)=> {
        let chatType = val.role
        if(chatType === 'system') {
          chatType = 'msg';
        }
        else if(chatType === 'bot') {
          chatType = 'agent'
        }
        else if(chatType === 'client') {
          chatType = 'user';
        }


        if(!val.message && val.media_url){
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-${chatType}"><div class="roboChat-imgContainer"><img src="${val.media_url}"/></div></div>`;
        }
        else{
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-${chatType}"><label>${val.message}</label></div>`;
        }
      })


      this.socket.on(`on-hold-chat-${this.clientUserId}`,(data: any)=> {
        (document.querySelector("#roboChat-inMsg") as HTMLInputElement)!.disabled = data.isOnHold;
        (document.querySelector("#roboChat-btnSendMsg") as HTMLButtonElement)!.disabled = data.isOnHold;
        
        clearInterval(this.onHoldInterval);

        if(data.isOnHold) {
          this.onHoldScriptInd = 0;
          this.onHoldScript = data.onholdScript;
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-msg"><label>chat is currently on-hold</label></div>`;
          this.onHoldInterval = setInterval(()=>{
            document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-msg"><label>${this.onHoldScript[this.onHoldScriptInd]}</label></div>`;
            this.onHoldScriptInd++;
            if(this.onHoldScriptInd === this.onHoldScript.length) {
              this.onHoldScriptInd = 0;
            }
          },data.onholdTime)
        }
        else {
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-msg"><label>chat has resumed</label></div>`;
        }

      })

      this.socket.on(`chat-transfer-${this.clientUserId}`,(transferToTeamName: string)=> {
        this.scrollBtm(()=>{
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-msg"><label>connecting you to a new agent</label></div>`;
        })
      })

      this.socket.on(`agent-accept-chat-${this.clientUserId}`,(data: any)=> {
        this.scrollBtm(()=>{
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-msg"><label>agent ${data.agentName} connected</label></div>`;
        })
      })


      this.socket.on(`agent-send-msg-${this.clientUserId}`,(data: any)=>{
        this.scrollBtm(()=>{
          this.inMsg = (document.querySelector('#roboChat-inMsg') as HTMLInputElement)!.value;
          document.querySelector('#roboChat-divChatViewMsg')!.innerHTML += `
            <div class="roboChat-agent">
              <label>${data.data.agentMsg}</label>
            </div>    
          `
        })
      })


      this.socket.on(`end-chat-session-${this.clientUserId}`,()=>{
        this.scrollBtm(()=>{
          document.querySelector("#roboChat-divChatViewMsg")!.innerHTML += `<div class="roboChat-msg"><label>chat session ended</label></div>`;
        })
      });

    })


    if(!this.originUrl || this.originUrl === 'null'){
      throw new Error("Please enter a valid origin url");
    }
    this.init();
  }

  private init() {
    const svg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg","svg");
    const path: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg","path");

    svg.setAttribute("xmlns","http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox","0 0 512 512");
    path.setAttribute("d","M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z")
    

    this.element!.classList.add("roboChat-floating-icon");

    svg.append(path);
    this.element!.append(svg);
    document.querySelector("body")!.innerHTML += this.floatingChatIcon;
    this.initEventListeners();
  }


  private initEventListeners() {
    document.addEventListener('click',ev=> {
      if(!document.querySelector('.roboChat-floating-chatbox.roboChat-hidden') && !(ev.target! as HTMLElement).closest('.roboChat-floating-chatbox') && !(ev.target! as HTMLElement).closest('.roboChat-floating-icon')) {
        document.querySelector(".roboChat-floating-icon")!.classList.remove('roboChat-hidden');
        document.querySelector(".roboChat-floating-chatbox")!.classList.add('roboChat-hidden');
      }

      if(!document.querySelector('emoji-picker.roboChat-hidden') && !(ev.target! as HTMLElement).closest('emoji-picker') && !(ev.target! as HTMLElement).closest('#roboChat-btnEmoji')) {
        document.querySelector("emoji-picker")!.classList.add('roboChat-hidden');
      }
      document.querySelector("#roboChat-divChatViewMsgContainer")!.scrollTop = document.querySelector("#roboChat-divChatViewMsgContainer")!.scrollHeight;
    })

    document.querySelector('#spanChatboxClose')!.addEventListener('click',ev=>{
        document.querySelector(".roboChat-floating-icon")!.classList.remove('roboChat-hidden');
        document.querySelector(".roboChat-floating-chatbox")!.classList.add('roboChat-hidden');
    })

    document.querySelector(".roboChat-floating-icon")!.addEventListener('click',ev=>{
      (ev.currentTarget as HTMLElement).classList.add('roboChat-hidden');
      document.querySelector(".roboChat-floating-chatbox")!.classList.remove('roboChat-hidden');

      document.querySelector('#roboChat-divChatLoading')!.classList.add('roboChat-hidden'); 
      document.querySelector('#roboChat-divChatViewMsg')!.classList.remove('roboChat-hidden'); 

    })

    document.querySelector('#roboChat-btnSendMsg')!.addEventListener('click', ev=>{

      let msgToSend = this.inMsg;
      let formData = new FormData(); 
      formData.append('clientUserId', this.clientUserId);
      formData.append('originUrl', this.originUrl);



      if(document.querySelector("#roboChat-divFileToUpload.roboChat-hidden")){
        this.scrollBtm(()=>{
          this.inMsg = (document.querySelector('#roboChat-inMsg') as HTMLInputElement)!.value;
          document.querySelector('#roboChat-divChatViewMsg')!.innerHTML += `
            <div class="roboChat-user">
              <label>${this.inMsg}</label>
            </div>    
          `
        })
        formData.append('msg',this.inMsg);
        this.inMsg = "";
        (document.querySelector('#roboChat-inMsg') as HTMLInputElement)!.value = this.inMsg;
      }
      else {
        const file = (document.querySelector('#roboChat-inFile')! as HTMLInputElement)!.files![0];
        const reader = new FileReader();
        reader.onload = e=>{
          this.scrollBtm(()=>{
            this.inMsg = (document.querySelector('#roboChat-inMsg') as HTMLInputElement)!.value;
            document.querySelector('#roboChat-divChatViewMsg')!.innerHTML += `
              <div class="roboChat-user">
                <div class="roboChat-imgContainer">
                  <img src="${e.target!.result}"/>
                </div>
              </div>    
            `
          })

          document.querySelector("#roboChat-divFileToUpload")!.innerHTML = '';
          document.querySelector("#roboChat-divFileToUpload")!.classList.add('roboChat-hidden');
          (document.querySelector("#roboChat-divFileToUpload") as HTMLInputElement)!.value = ''
          document.querySelector("#roboChat-inMsg")!.classList.remove('roboChat-hidden');
        }
        reader.readAsDataURL(file);
        formData.append('file',(document.querySelector('#roboChat-inFile')! as HTMLInputElement)!.files![0]);
      }


      fetch(this.serverUrl+'/msg-from-client',{
        method: "POST",
        body: formData
      })
      .then(res=> res.json());


    })

    document.querySelector("#roboChat-btnEmoji")!.addEventListener("click",ev=> {
      document.querySelector("emoji-picker")!.classList.toggle('roboChat-hidden');

      this.repositionEmojiPicker();
    })

    window.addEventListener("resize",()=> {
      this.repositionEmojiPicker();
    })



    document.querySelector("emoji-picker")!.addEventListener('emoji-click', (ev: any) => {
      (document.querySelector("#roboChat-inMsg")! as HTMLInputElement).value = (document.querySelector("#roboChat-inMsg")! as HTMLInputElement).value + ev.detail.unicode;
    });


    document.querySelector('#roboChat-inFile')!.addEventListener('change',(ev: any)=>{
      const fileUploadContainer = document.querySelector("#roboChat-divFileToUpload")!;

      fileUploadContainer.innerHTML = `
        <div id="roboChat-imgToUploadContainer">
          <label>${ev.target.files[0].name}</label>
          <img src="src/assets/images/close.svg"/>
        </div>
      `;

      document.querySelector("#roboChat-inMsg")!.classList.add('roboChat-hidden');
      fileUploadContainer.classList.remove('roboChat-hidden');

      fileUploadContainer.querySelector('#roboChat-imgToUploadContainer > img')!.addEventListener('click',event=>{
        fileUploadContainer.innerHTML = '';
        ev.target.value = '';
      })

    });

  }

  private repositionEmojiPicker(): void {
    const emojiPickerBtnRect = document.querySelector("#roboChat-btnEmoji")!.getBoundingClientRect();

    const emojiPickerPopup = (document.querySelector("emoji-picker") as HTMLElement);

    const emojiPickerPopupRect = emojiPickerPopup.getBoundingClientRect();

    emojiPickerPopup.style.top = `calc(${emojiPickerBtnRect.y}px - ${emojiPickerPopupRect.height}px - 20px)`;
    emojiPickerPopup.style.left = `calc(${emojiPickerBtnRect.x}px - ${emojiPickerPopupRect.width}px + 30px)`;
  }

  private scrollBtm(func: ()=> void) {
    const isScrollBtm: boolean = document.querySelector("#roboChat-divChatViewMsgContainer")!.scrollHeight - document.querySelector("#roboChat-divChatViewMsgContainer")!.scrollTop === document.querySelector("#roboChat-divChatViewMsgContainer")!.clientHeight;

    func();

    if(isScrollBtm) {
      document.querySelector("#roboChat-divChatViewMsgContainer")!.scrollTop = document.querySelector("#roboChat-divChatViewMsgContainer")!.scrollHeight;
    }
  }

}
