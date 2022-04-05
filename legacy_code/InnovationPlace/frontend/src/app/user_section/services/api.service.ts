import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class ApiService {

  baseUrl = "http://localhost:3000";

  constructor(private http: Http, private authService: AuthService) { }

  doPost(url, data = {}, sentOptions = { multipart: false }) {

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (sentOptions.multipart) {
    } else {
      headers.append('Content-Type', 'application/json');
    }

    this.appendAuthToken(headers);

    let options = new RequestOptions({ headers: headers });
    let preparedUrl = `${this.baseUrl}/${url}`;

    return this.http.post(preparedUrl, data, options)
      .map((response) => { return response.json() })
      .catch((error) => {
        if (error instanceof Response) {
          return Observable.throw({ status: error.status, data: error.json() });
        } else {
          return Observable.throw({ data: error.message });
        }
      })
      .share()
  }

  doPut(url, data, sentOptions = { multipart: false }) {

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (sentOptions.multipart) {
    } else {
      headers.append('Content-Type', 'application/json');
    }

    this.appendAuthToken(headers);

    let options = new RequestOptions({ headers: headers });
    let preparedUrl = `${this.baseUrl}/${url}`;

    return this.http.put(preparedUrl, data, options)
      .map((response) => { return response.json() })
      .catch((error) => {
        if (error instanceof Response) {
          return Observable.throw({ status: error.status, data: error.json() });
        } else {
          return Observable.throw({ data: error.message });
        }
      })
      .share()
  }

  doGet(url) {
    let headers = new Headers();
    this.appendAuthToken(headers);
    let options = new RequestOptions({ headers: headers });

    let preparedUrl = `${this.baseUrl}/${url}`;

    return this.http.get(preparedUrl, options)
      .map((response) => { return response.json() })
      .catch((error) => {
        if (error instanceof Response) {
          return Observable.throw({ status: error.status, data: error.json() });
        } else {
          return Observable.throw({ data: error.message });
        }
      })
      .share()
  }


  doDelete(url) {
    let headers = new Headers();
    this.appendAuthToken(headers);
    let options = new RequestOptions({ headers: headers });

    let preparedUrl = `${this.baseUrl}/${url}`;

    return this.http.delete(preparedUrl, options)
      .map((response) => { return response.json() })
      .catch((error) => {
        if (error instanceof Response) {
          return Observable.throw({ status: error.status, data: error.json() });
        } else {
          return Observable.throw({ data: error.message });
        }
      })
      .share()
  }

  appendAuthToken(headers) {
    if (this.authService.isAuthenticated()) {
      headers.append('Authorization', `Bearer ${this.authService.getAuthToken()}`);
    }
  }
}
