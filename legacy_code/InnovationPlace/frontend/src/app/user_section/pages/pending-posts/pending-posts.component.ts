import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-pending-posts',
    templateUrl: 'pending-posts.component.html',
    styleUrls: ['pending-posts.component.css']
})
export class PendingPostsComponent implements OnInit {
    posts = [];
    users = [];
    searchAuthorId = "";
    searchKeyword = "";

    constructor(private apiService: ApiService, private authService: AuthService) {
        this.getPosts();
        this.getUsers();
    }

    ngOnInit() {
    }

    getPosts() {
        let url = `api/posts?authorId=${this.searchAuthorId}&keyword=${this.searchKeyword}&verified=false`;

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

    getUsers() {
        let url = `api/users`;

        this.apiService.doGet(url)
            .subscribe(
            (data) => {
                console.log(data);
                this.users = data.users;
            },
            (error) => {
                console.log(error);
            },
        )
    }

    handleSearchFormChange() {
        this.getPosts();
    }
}
