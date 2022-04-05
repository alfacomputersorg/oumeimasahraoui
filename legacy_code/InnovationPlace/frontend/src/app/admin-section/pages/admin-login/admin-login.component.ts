import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {ApiService} from "../../../user_section/services/api.service";
import {Router, ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../user_section/services/auth.service";

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
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
                this.router.navigate(["/admin"]);
              }
            },
            (error) => {
              console.log(error);
              component.serverFormErrors = error.data.errors;
            },
        )
  }
}
