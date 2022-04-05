import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {CurrentConversationService} from "../../services/current-conversation.service";
import {ApiService} from "../../services/api.service";
import {AuthService} from "../../services/auth.service";
import {uniqBy} from "lodash";
import {debounce} from "lodash";
import {Socket} from "ng2-socket-io";

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.sass']
})
export class ChatBoxComponent implements OnInit {
    conversationId;
    conversation;
    currentUser;
    typedMessage = "";
    isTyping = false;
    messages = [];

    @ViewChild('chatBoxBody') chatBoxBody;
    @ViewChild('textInput') textInput;

    constructor(
        private currentConversationService: CurrentConversationService,
        private apiService: ApiService,
        private socket: Socket,
        private authService: AuthService
    ) {

        this.currentConversationService.onNewConversation.subscribe( (data) => {
            this.openConversation(data);
        });

        this.currentConversationService.onNewMessage.subscribe( (data) => {
            this.appendNewMessage(data);
        });

        this.currentConversationService.onUserTyping.subscribe( (data) => {
            if(data.conversationId === this.conversationId && data.userId !== this.currentUser._id){
                this.showTyping();
            }
        });

        this.currentUser = this.authService.getCurrentUser();
        this.notifyTypingStarted = debounce(this.notifyTypingStarted, 30)
        this.hideTyping = debounce(this.hideTyping, 1000)
    }

    ngOnInit() {
    }

    openConversation(conversationId){
        this.conversationId = conversationId;
        this.getConversation()
    }

    scrollToBottom(){
        if(this.chatBoxBody){
            this.chatBoxBody.nativeElement.scrollTop = this.chatBoxBody.nativeElement.scrollHeight;
        }
    }

    focusOnInput(){
        if(this.textInput){
            this.textInput.nativeElement.focus();
        }
    }

    close(event){
        event.preventDefault();
        this.conversationId = null;
        this.conversation = null;
    }

    getConversation() {
        let url = `api/conversations/${this.conversationId}`;

        // Get the conversations with its messages
        // and set the unviewed messages to viewed;
        this.apiService.doGet(url)
            .subscribe(
                (data) => {
                    this.conversation = data.conversation;
                    this.messages = data.messages;
                    setTimeout( () => { this.scrollToBottom(); } )
                    setTimeout( () => { this.focusOnInput(); } )
                    // set unviewed messages to viewed
                    this.currentConversationService.markMessagesAsViewed();
                },
                (error) => {
                    console.log(error);
                },
            )
    }

    remoteConverser(){
        if(!this.conversation) { return {}; }
        if(this.conversation.creator._id === this.currentUser._id){
            return this.conversation.user;
        } else {
            return this.conversation.creator;
        }
    }

    handleKeyup(event){
        if(event.keyCode === 13){
            // Enter was pressed
            this.sendMessage();
        } else {
            this.notifyTypingStarted();
        }
    }

    sendMessage(){
        let url = `api/conversations/${this.conversationId}/messages`;

        // Send message and set unviewed messages to viewed
        this.apiService.doPost(url, {messageBody: this.typedMessage})
            .subscribe(
                (data) => {
                    this.typedMessage = "";
                    this.appendNewMessage(data.message)
                    this.currentConversationService.markMessagesAsViewed();
                },
                (error) => {
                    console.log(error);
                },
            )
    }

    appendNewMessage(message){
        if(!this.conversation){ return; } // conversation is not open
        if(message._conversation !== this.conversationId){ return; } // message was not sent for this open conversation
        if(message.owner._id === this.currentUser._id){
            this.isTyping = false;
            this.messages.push(message);
            this.messages = uniqBy(this.messages, (ms) => { return ms._id })
            setTimeout( () => { this.scrollToBottom(); } );
        }
    }

    markMessagesAsViewed(){
        let url = `api/conversations/${this.conversationId}/mark_messages_as_viewed`;

        // Send message and set unviewed messages to viewed
        this.apiService.doPost(url, {})
            .subscribe(
                (data) => {
                    this.currentConversationService.markMessagesAsViewed();
                },
                (error) => {
                    console.log(error);
                },
            )
    }

    notifyTypingStarted(){
        this.socket.emit("user-typing", {conversationId: this.conversationId, userId: this.currentUser._id})
    }

    showTyping(){
        this.isTyping = true;
        setTimeout( () => { this.scrollToBottom(); } )
        this.hideTyping();
    }

    hideTyping(){
        this.isTyping = false;
    }
}
