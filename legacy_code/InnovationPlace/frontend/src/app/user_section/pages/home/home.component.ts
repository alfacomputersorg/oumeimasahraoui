import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
    posts = [];
    users = [];
    paginationMeta = {page: 1};
    searchAuthorId = "";
    searchKeyword = "";
    searchVerified = true;
    searchOrderBy = "viewsCount";
    currentUser;
    currentPage = 1;

    constructor(private apiService: ApiService, private authService: AuthService) {
        this.currentUser = authService.getCurrentUser();
        this.getPosts();
        this.getUsers();
    }

    ngOnInit() {
    }

    getPosts() {
        let url = `api/posts?authorId=${this.searchAuthorId}&keyword=${this.searchKeyword}`;
        url += `&verified=${this.searchVerified}`;
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
        this.currentPage = 1;
        this.getPosts();
    }

    filterBy(event, field, value){
        this.currentPage = 1;
        this.searchOrderBy = "";
        event.preventDefault();

        this[field] = value;

        if(field === "searchAuthorId"){
            this.searchVerified = true;
        }
        if(field === "searchVerified"){
            this.searchAuthorId = "";
        }

        this.getPosts();
    }

    orderBy(event, field){
        this.currentPage = 1;
        event.preventDefault();
        this.searchVerified = true;
        this.searchAuthorId = "";

        this.searchOrderBy = field;
        this.getPosts();
    }

    pageChanged(data){
        this.currentPage = data.page;
        this.getPosts();
    }
}
