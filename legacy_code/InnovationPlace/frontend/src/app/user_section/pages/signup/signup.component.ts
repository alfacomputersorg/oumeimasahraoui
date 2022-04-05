import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { ApiService } from "../../services/api.service"

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.component.html'
})

@Injectable()
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  serverFormErrors = [];

  user = {
    fullName: "",
    email: "",
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
    this.signupForm = this.fb.group({
      email: [this.user.email, Validators.required],
      fullName: [this.user.fullName, Validators.required],
      password: [this.user.password, Validators.required],
      passwordConfirmation: [this.user.passwordConfirmation, Validators.required],
    })
  }

  handleSubmit() {
    let url = "api/signup";
    let component = this;
    console.log("submit", component.signupForm)
    this.apiService.doPost(url, component.signupForm.value)
      .subscribe(
      (data) => {
        console.log(data);
        component.serverFormErrors = [];
        this.authService.storeCurrentUser(data.user, data.authToken);
        this.router.navigate(["/"]);
      },
      (error) => {
        console.log(error);
        component.serverFormErrors = error.data.errors;
      },
    )
  }
}
