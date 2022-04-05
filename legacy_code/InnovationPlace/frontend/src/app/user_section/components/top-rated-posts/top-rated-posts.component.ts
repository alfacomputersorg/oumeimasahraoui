import {Component, OnInit, Input} from '@angular/core';
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-top-rated-posts',
  templateUrl: './top-rated-posts.component.html',
  styleUrls: ['./top-rated-posts.component.sass']
})
export class TopRatedPostsComponent implements OnInit {
    @Input() user;
   posts = [];

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
      this.getPosts();
  }

  getPosts() {
    let url = `api/posts?`;
    url += `&verified=true`;
    url += `&orderBy=viewsCount`;
    url += `&limit=4`;
    if(this.user){
      url += `&authorId=${this.user._id}`;
    }

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
