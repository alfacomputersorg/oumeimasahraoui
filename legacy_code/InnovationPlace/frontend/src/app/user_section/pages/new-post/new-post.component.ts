import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-new-post',
  templateUrl: 'new-post.component.html',
  styleUrls: ['new-post.component.css']
})
export class NewPostComponent implements OnInit {
  currentUser;
  saving = false;
  newPostForm: FormGroup;
  serverFormErrors = [];
  formData: any = new FormData();

  post = {
    title: "",
    body: "",
    image: null,
    video: null,
    pdf: null,
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
  ) {
      this.currentUser = authService.getCurrentUser();
    this.createForm()
  }

  ngOnInit() {
  }

  // private
  createForm() {
    this.newPostForm = this.fb.group({
      title: [this.post.title, Validators.required],
      body: [this.post.body],
      image: [],
      video: [],
      pdf: [],
    })
  }

  handleFileChange(field, event) {
    console.log(field, event)
    let fileList = FileList = event.target.files;
    if (fileList.length) {
      let file: File = fileList[0];
      this.formData.set(field, file, file.name);
      console.log("setting", field, this.formData, this.formData.get("pdf"));
    }
  }

  handleSubmit() {
    let url = "api/posts";
    let component = this;

    this.formData.append('title', component.newPostForm.value.title)
    this.formData.append('body', component.newPostForm.value.body)

    this.saving = true;
    this.apiService.doPost(url, this.formData, { multipart: true })
      .subscribe(
      (data) => {
        this.saving = false;
        console.log(data);
        component.serverFormErrors = [];
        this.router.navigate([`/posts/${data.post._id}`])
      },
      (error) => {
        this.saving = false;
        console.log(error);
        component.serverFormErrors = error.data.errors;
      },
    )
  }
}

