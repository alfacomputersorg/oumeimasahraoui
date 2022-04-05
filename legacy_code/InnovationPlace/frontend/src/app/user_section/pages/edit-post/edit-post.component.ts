import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { assign } from "lodash"

@Component({
    selector: 'app-edit-post',
    templateUrl: 'edit-post.component.html',
    styleUrls: ['edit-post.component.css']
})
export class EditPostComponent implements OnInit {
    currentUser;
    editPostForm: FormGroup;
    serverFormErrors = [];
    formData: any = new FormData();
    saving = false;

    postId;
    post = {
        title: "",
        body: "",
        image: null,
        video: null,
        pdf: null,
        deleteImage: false,
        deletePdf: false,
        deleteVideo: false,
    }

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.currentUser = this.authService.getCurrentUser();
        this.activatedRoute.params.subscribe(params => {
            if (params['id']) {
                this.postId = params["id"]
                this.getPost()
            }
        });
        this.createForm()
    }

    ngOnInit() {
    }

    getPost() {
        let url = `api/posts/${this.postId}`;

        this.apiService.doGet(url)
            .subscribe(
            (data) => {
                console.log(data);
                this.post = assign(data.post, { deleteImage: false, deleteVideo: false, deletePdf: false });
                this.editPostForm.setValue({
                    title: this.post.title,
                    body: this.post.body,
                    image: null,
                    pdf: null,
                    video: null,
                });
            },
            (error) => {
                console.log(error);
            },
        )
    }

    // private
    createForm() {
        this.editPostForm = this.fb.group({
            title: [this.post.title, Validators.required],
            body: [this.post.body],
            image: [],
            video: [],
            pdf: [],
        })
    }

    deleteFile(field) {
        this.post[field] = true;
    }

    handleFileChange(field, event) {
        console.log(field, event)
        let fileList = FileList = event.target.files;
        if (fileList.length) {
            let file: File = fileList[0];
            this.formData.set(field, file, file.name);
            console.log("setting", field, this.formData);
        }
        if (field === "image") {
            this.post.deleteImage = true;
        }
        if (field === "video") {
            this.post.deleteVideo = true;
        }
        if (field === "pdf") {
            this.post.deletePdf = true;
        }
    }

    handleSubmit() {
        let url = `api/posts/${this.postId}`;
        let component = this;

        this.formData.append('title', component.editPostForm.value.title)
        this.formData.append('body', component.editPostForm.value.body)
        this.formData.append('deleteImage', component.post.deleteImage)
        this.formData.append('deletePdf', component.post.deletePdf)
        this.formData.append('deleteVideo', component.post.deleteVideo)

        this.saving = true;
        this.apiService.doPut(url, this.formData, { multipart: true })
            .subscribe(
            (data) => {
                this.saving = false;
                console.log(data);
                component.serverFormErrors = [];
                component.router.navigate([`/posts/${data.post._id}`])
            },
            (error) => {
                this.saving = false;
                console.log(error);
                component.serverFormErrors = error.data.errors;
            },
        )
    }
    destroyPost() {
        let component = this;
        let url = `api/posts/${this.postId}`;

        this.apiService.doDelete(url)
            .subscribe(
            (data) => {
                component.router.navigate([`/posts/my-posts`])
            },
            (error) => {
                component.serverFormErrors = error.data.errors;
            },
        )
    }
}

