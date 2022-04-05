import {Component, OnInit, Input, Output, OnChanges} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-post-comments',
  templateUrl: 'post-comments.component.html',
  styleUrls: ['post-comments.component.css']
})
export class PostCommentsComponent implements OnInit, OnChanges {
  @Input()
  post;
  @Input()
  full;

  currentUser;
  commentBody = "";


  constructor(private authService: AuthService, private apiService : ApiService) {

  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }
  ngOnChanges(){

  }

  handleKeyup(event){
    if(event.keyCode === 13){
        this.handleSubmit();
        event.preventDefault();
    }
  }

    handleSubmit(){
        let url = `api/posts/${this.post._id}/comments`;
        this.apiService.doPost(url, {body: this.commentBody})
            .subscribe(
                (data) => {
                    this.post = data.post;
                    this.commentBody = "";
                },
                (error) => {
                },
            )
    }

  destroyComment(comment){
    let url = `api/posts/${this.post._id}/comments/${comment._id}`;
    this.apiService.doDelete(url)
        .subscribe(
            (data) => {
              this.post = data.post;
            },
            (error) => {
            },
        )
  }

    isTheAuthor(comment){
        if(comment && this.currentUser){
            if(this.currentUser._id === comment._user._id){
                return true
            }
        }
    }
}
