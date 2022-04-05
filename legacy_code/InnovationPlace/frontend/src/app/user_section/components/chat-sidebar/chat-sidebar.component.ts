import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../services/api.service";
import {Socket} from "ng2-socket-io";
import {AuthService} from "../../services/auth.service";
import {includes} from "lodash";
import {forEach} from "lodash";
import {orderBy} from "lodash";
import {filter} from "lodash";
import {CurrentConversationService} from "../../services/current-conversation.service";

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: './chat-sidebar.component.html',
    styleUrls: ['./chat-sidebar.component.sass']
})
export class ChatSidebarComponent implements OnInit {
    filteredConversations = [];
    conversations = [];
    preparedConversations = [];

    connectedUsersIds = [];
    open = false;
    searchKeyword = "";
    currentUser;

    constructor(
        private apiService: ApiService,
        private socket: Socket,
        private authService: AuthService,
        private currentConversationService: CurrentConversationService
    ) {

        this.currentUser = authService.getCurrentUser()
        this.getConversations();
        this.socket.on("connection", () => {
            console.log("connected");
            this.joinRooms()
        })
        this.joinRooms()

        this.currentConversationService.onMarkMessagesAsViewed.subscribe( (conversationId) => {
            this.markMessagesAsViewed(conversationId);
        });
    }

    ngOnInit() {
    }

    joinRooms(){
        if(!this.currentUser){ return }
        this.socket.emit("join", {room: "connected-users", userId: this.currentUser._id});
        this.socket.emit("get-connected-users", {});
        this.listenToEvents();
    }

    listenToEvents(){
        this.socket.on("connected-users", (data) => {
            console.log("connected-users", data.ids)
            this.connectedUsersIds = data.ids;
            this.orderConversationsByConnection();
            this.getConversations()
        })
        this.socket.on("new-message", (data) => {
            console.log("new-message", data)
            this.currentConversationService.handleNewMessage(data.message);
            this.appendLastMessageToConversation(data.message);
            this.incrementUnviewedMessagesCount(data.message);
        })
        this.socket.on("user-typing", (data) => {
            this.currentConversationService.handleTyping(data);
        })
    }

    orderConversationsByConnection(){
        forEach(this.conversations, (conv) => {
            conv.connected = this.isConnected(this.remoteConverserForConversation(conv)._id);
        })

        this.conversations = orderBy(this.conversations, (conv) => {return !conv.connected});
        this.preparedConversations = this.conversations;
    }

    isConnected(userId){
        return includes(this.connectedUsersIds, userId);
    }

    getConversations() {
        let url = `api/conversations`;

        this.apiService.doGet(url)
            .subscribe(
                (data) => {
                    console.log(data);
                    this.conversations = data.conversations;
                    this.orderConversationsByConnection();
                },
                (error) => {
                    console.log(error);
                },
            )
    }

    remoteConverserForConversation(conversation){
        if(conversation.creator._id === this.currentUser._id){
            return conversation.user;
        } else {
            return conversation.creator;
        }
    }

    openConversation(conversationId, event){
        if(event){
            event.preventDefault();
        }
        this.currentConversationService.setNewActiveConversation(conversationId);
    }

    appendLastMessageToConversation(message){
        let conversation = filter(this.conversations, (cv) => { return message._conversation === cv._id })[0];
        if(conversation){
            conversation.lastMessageText = message.messageBody;
        }
    }

    incrementUnviewedMessagesCount(message){
        let conversation = filter(this.conversations, (cv) => { return message._conversation === cv._id })[0];
        if(conversation) {
            console.log("increment");
            if (message.owner._id === this.currentUser._id && message.viewed === false){ // and the current conversation is not open
                conversation.unviewedMessagesCount = ( conversation.unviewedMessagesCount || 0 ) + 1;
            }
        }
    }

    markMessagesAsViewed(conversationId){
        let conversation = filter(this.conversations, (cv) => { return conversationId === cv._id })[0];
        if(conversation){
            conversation.unviewedMessagesCount = 0;
        }
    }

    filterUsers(){
        this.filteredConversations = filter(this.conversations, (cv) => {
            let re = new RegExp(this.searchKeyword, "ig")
            let matchAgainst:any = {};
            if(cv.creator._id === this.currentUser._id){
                matchAgainst = cv.user
            } else {
                matchAgainst = cv.creator
            }

            if(matchAgainst.fullName.match(re)){
                return true
            }
            return false
        });

        if(this.searchKeyword){
            // The user want to search for users
            // so we display the filtered conversations
            this.preparedConversations = this.filteredConversations;
        } else {
            // There is no filter keyword so show all the conversations
            this.preparedConversations = this.conversations;
        }
    }
}
