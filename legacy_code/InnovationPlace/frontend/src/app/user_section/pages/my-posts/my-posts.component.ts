import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-my-posts',
  templateUrl: 'my-posts.component.html',
  styleUrls: ['my-posts.component.css']
})
export class MyPostsComponent implements OnInit {
  posts = [];

  constructor(private apiService: ApiService, private authService: AuthService) {
    this.getPosts();
  }

  ngOnInit() {
  }

  getPosts() {
    let url = `api/posts?ownPosts=true`;

    this.apiService.doGet(url)
      .subscribe(
      (data) => {
        console.log(data);
        this.posts = data.posts;
      },
      (error) => {
        console.log(error);
      },
    )
  }

}
