import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../services/api.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.sass']
})
export class UserDetailsComponent implements OnInit {
  paginationMeta = {page: 1};
  searchAuthorId = "";
  searchKeyword = "";
  searchOrderBy = "";
  currentPage = 1;
  posts = [];
  user;
  userId;

  constructor(
      private apiService: ApiService,
      private activatedRoute: ActivatedRoute,
  ) {

    this.activatedRoute.params.subscribe(params => {
      this.searchAuthorId = params["id"];
      if (params['id']) {
        this.userId = params["id"];
        this.getUser();
        this.getPosts();
      }
    });
  }

  ngOnInit() {
  }

  getUser() {
    let url = `api/users/${this.userId}`;

    this.apiService.doGet(url)
        .subscribe(
            (data) => {
              console.log(data);
              this.user = data.user;
            },
            (error) => {
              console.log(error);
            },
        )
  }

  getPosts() {
    let url = `api/posts?authorId=${this.searchAuthorId}&keyword=${this.searchKeyword}`;
    url += `&allPosts=true`;
    url += `&orderBy=${this.searchOrderBy}`;
    url += `&page=${this.currentPage}`;

    this.apiService.doGet(url)
        .subscribe(
            (data) => {
              console.log(data);
              this.posts = data.posts;
              this.paginationMeta = data.meta;
              // this.currentPage = data.meta.page;
            },
            (error) => {
              console.log(error);
            },
        )
  }
    pageChanged(data){
        this.currentPage = data.page;
        this.getPosts();
    }
}
