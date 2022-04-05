import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { ApiService } from "../../../services/api.service";
import { AuthService } from "../../../services/auth.service";


@Component({
    selector: 'app-user-password-form',
    templateUrl: 'user-password-form.component.html',
    styleUrls: ['user-password-form.component.css']
})

export class UserPasswordFormComponent implements OnInit {
    userPasswordForm: FormGroup;
    serverFormErrors = [];

    user = {
        currentPassword: "",
        password: "",
        passwordConfirmation: "",
    }

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
    ) {
        this.createForm()
    }

    ngOnInit() {
    }

    // private
    createForm() {
        this.userPasswordForm = this.fb.group({
            currentPassword: [this.user.currentPassword, Validators.required],
            password: [this.user.password, Validators.required],
            passwordConfirmation: [this.user.passwordConfirmation, Validators.required],
        })
    }

    handleSubmit() {
        let url = `api/users/${this.authService.getCurrentUser()._id}/update_password`;
        let component = this;
        this.apiService.doPut(url, component.userPasswordForm.value)
            .subscribe(
            (data) => {
                console.log(data);
                component.serverFormErrors = [];
                this.user = { currentPassword: "", password: "", passwordConfirmation: "", }
                this.userPasswordForm.setValue(this.user);
            },
            (error) => {
                console.log(error);
                component.serverFormErrors = error.data.errors || [];
            },
        )
    }
}
