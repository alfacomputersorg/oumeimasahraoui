import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Injectable } from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { ApiService } from "../../services/api.service"

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html'
})

@Injectable()
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    serverFormErrors = [];
    next;

    user = {
        email: "",
        password: ""
    }

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            if (params['next']) {
                this.next = params["next"]
            }
        });
        this.createForm()
    }

    ngOnInit() {
    }

    // private
    createForm() {
        this.loginForm = this.fb.group({
            email: [this.user.email, Validators.required],
            password: [this.user.password, Validators.required],
        })
    }

    handleSubmit() {
        let url = "api/login";
        let component = this;
        console.log(this.next);
        this.apiService.doPost(url, component.loginForm.value)
            .subscribe(
            (data) => {
                console.log(data);
                component.serverFormErrors = [];
                this.authService.storeCurrentUser(data.user, data.authToken);
                if(this.next){
                    window.location.assign(this.next);
                } else {
                    this.router.navigate(["/"]);
                }
            },
            (error) => {
                console.log(error);
                component.serverFormErrors = error.data.errors;
            },
        )
    }
}
