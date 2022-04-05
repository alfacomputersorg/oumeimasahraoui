import { Component, OnInit, Input, OnChanges, Output } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { AuthService } from "../../services/auth.service";
import { ApiService } from "../../services/api.service";
import { assign, omit } from "lodash";

@Component({
  selector: 'app-post',
  templateUrl: 'post.component.html',
  styleUrls: ['post.component.css']
})
export class PostComponent implements OnInit, OnChanges {
  @Input() post;
  @Input() full: boolean;
  @Input() onlyHeader: boolean;

  rating = 1;
  currentUser = { _id: "", role: "user" };
  isTheAuthor = false;
  postUrl = "";

  constructor(public sanitizer: DomSanitizer, private authService: AuthService, private apiService: ApiService) {
    this.currentUser = authService.getCurrentUser();
  }

  ngOnInit() {
    this.postUrl = `http://localhost:4200/posts/${this.post._id}`;
  }

  ngOnChanges() {
    this.checkIfIsTheAuthor();
    this.setPdfUrl();
    if (this.post.currentUserRating) {
      this.rating = this.post.currentUserRating;
    } else {
      this.rating = this.post.averageRating;
    }
  }

  checkIfIsTheAuthor() {
    if (this.post && this.currentUser) {
      if (this.currentUser._id === this.post.user._id) {
        this.isTheAuthor = true;
      }
    }
  }

  setPdfUrl() {
    if (this.post) {
      this.post.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.post.pdfUrl)
    }
  }

  handleRateSelection() {
    let url = `api/posts/${this.post._id}/rate`;
    this.apiService.doPost(url, { rating: this.rating })
      .subscribe(
      (data) => {
        this.post = assign(this.post, omit(data.post, ["pdfUrl"]));
        if (this.post.currentUserRating) {
          this.rating = this.post.currentUserRating;
        } else {
          this.rating = this.post.averageRating;
        }
      },
      (error) => {
      },
    )
  }

  markAsVerified() {
    let url = `api/posts/${this.post._id}/mark_as_verified`;
    this.apiService.doPost(url)
        .subscribe(
            (data) => {
              this.post = assign(this.post, omit(data.post, ["pdfUrl"]));
              if (this.post.currentUserRating) {
                this.rating = this.post.currentUserRating;
              } else {
                this.rating = this.post.averageRating;
              }
            },
            (error) => {
            },
        )
  }
}
