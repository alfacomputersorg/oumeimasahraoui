import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  constructor() { }

  storeCurrentUser(user, authToken) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("authToken", authToken);
  }

  updateCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  getCurrentUser() {
    let rawUser = localStorage.getItem("currentUser");
    if (rawUser) {
      return JSON.parse(rawUser)
    }
    return null
  }

  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  isAuthenticated() {
    return localStorage.getItem("authToken");
  }

  logout() {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
  }
}
