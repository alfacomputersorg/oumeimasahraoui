import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import {ActivatedRoute, Router, NavigationEnd} from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-single-post',
  templateUrl: 'single-post.component.html',
  styleUrls: ['single-post.component.css']
})
export class SinglePostComponent implements OnInit {
  post;
  postId;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public sanitizer: DomSanitizer,
  ) {

    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.postId = params["id"]
        this.getPost()
      }
    });
  }

  ngOnInit() {
  }

  getPost() {
    let url = `api/posts/${this.postId}`;

    this.apiService.doGet(url)
      .subscribe(
      (data) => {
        console.log(data);
        this.post = data.post;
      },
      (error) => {
        console.log(error);
      },
    )
  }
}
