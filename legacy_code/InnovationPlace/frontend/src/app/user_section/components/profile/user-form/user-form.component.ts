import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { ApiService } from "../../../services/api.service";
import { AuthService } from "../../../services/auth.service";

@Component({
    selector: 'app-user-form',
    templateUrl: 'user-form.component.html',
    styleUrls: ['user-form.component.css']
})
export class UserFormComponent implements OnInit {
    userForm: FormGroup;
    serverFormErrors = [];

    user = {
        _id: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        twitterUrl: "",
        facebookUrl: "",
        linkedinUrl: "",
    }

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
    ) {
        this.user = authService.getCurrentUser();
        this.createForm()
    }

    ngOnInit() {
    }

    // private
    createForm() {
        this.userForm = this.fb.group({
            email: [this.user.email, Validators.required],
            fullName: [this.user.fullName, Validators.required],
            phoneNumber: [this.user.phoneNumber],
            twitterUrl: [this.user.twitterUrl],
            facebookUrl: [this.user.facebookUrl],
            linkedinUrl: [this.user.linkedinUrl],
        })
    }

    handleSubmit() {
        let url = `api/users/${this.user._id}`;
        let component = this;
        this.apiService.doPut(url, component.userForm.value)
            .subscribe(
            (data) => {
                console.log(data);
                component.serverFormErrors = [];
                this.authService.updateCurrentUser(data.user);
            },
            (error) => {
                console.log(error);
                component.serverFormErrors = error.data.errors;
            },
        )
    }
}

