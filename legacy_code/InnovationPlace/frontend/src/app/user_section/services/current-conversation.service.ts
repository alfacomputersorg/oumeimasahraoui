import {Injectable, Input, Output, EventEmitter, OnChanges} from '@angular/core';

@Injectable()
export class CurrentConversationService implements OnChanges {
    currentConversationId;
    @Output() onNewConversation = new EventEmitter();
    @Output() onNewMessage = new EventEmitter();
    @Output() onMarkMessagesAsViewed = new EventEmitter();
    @Output() onUserTyping = new EventEmitter();

    constructor() {
    }

    ngOnChanges(changes){
    }

    setNewActiveConversation(conversationId){
        this.currentConversationId = conversationId;
        this.onNewConversation.emit(this.currentConversationId);
    }

    handleTyping(data){
        this.onUserTyping.emit(data);
    }

    handleNewMessage(message){
        this.onNewMessage.emit(message);
    }

    markMessagesAsViewed(){
        this.onMarkMessagesAsViewed.emit(this.currentConversationId);
    }
}
