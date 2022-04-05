import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../user_section/services/api.service";
import {AuthService} from "../../user_section/services/auth.service";

@Component({
  selector: 'app-basic-wrapper',
  templateUrl: 'basic-wrapper.component.html',
})
export class BasicWrapperComponent implements OnInit {

  constructor(private apiService: ApiService, private authService: AuthService) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser(){
    let url = "api/users/get_current_user";
    this.apiService.doGet(url)
        .subscribe(
            (data) => {
              console.log(data);
              this.authService.storeCurrentUser(data.user, data.authToken);
            },
            (error) => {
              console.log(error);
            },
        )
  }
}
