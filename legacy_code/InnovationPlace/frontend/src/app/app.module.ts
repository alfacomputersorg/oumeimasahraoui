// From angular
import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

// 3rd party
import {AlertModule, BsDropdownModule, RatingModule, TooltipModule, PaginationModule} from "ngx-bootstrap";
import { QuillModule } from "ngx-quill";
import {MomentModule} from "angular2-moment";
import { ChartsModule } from "ng2-charts";
import { SlimScrollModule } from "ng2-slimscroll";

// Services
import { ApiService } from "./user_section/services/api.service";
import { ExtendedHttpService } from "./utils/extended_http";
import { AuthService } from "./user_section/services/auth.service";

// Guards
import { OnlyAuthenticatedGuard } from "./user_section/guards/only-authenticated.guard";
import { OnlyNotAuthenticatedGuard } from "./user_section/guards/only-not-authenticated.guard";

// Containers
import { BasicWrapperComponent } from './containers/basic-wrapper/basic-wrapper.component';

// Created components
import { AppComponent } from './app.component';

// Users component
import { NavbarComponent } from './user_section/components/navbar/navbar.component';

import { HomeComponent } from './user_section/pages/home/home.component';

import { SignupComponent } from './user_section/pages/signup/signup.component';
import { LoginComponent } from './user_section/pages/login/login.component';

import { ProfileComponent } from './user_section/components/profile/profile.component';
import { UserFormComponent } from './user_section/components/profile/user-form/user-form.component';
import { UserPasswordFormComponent } from './user_section/components/profile/user-password-form/user-password-form.component';

import { NewPostComponent } from './user_section/pages/new-post/new-post.component';
import { SinglePostComponent } from './user_section/pages/single-post/single-post.component';
import { MyPostsComponent } from './user_section/pages/my-posts/my-posts.component';
import { PostComponent } from './user_section/components/post/post.component';
import { EditPostComponent } from "./user_section/pages/edit-post/edit-post.component";
import { PostCommentsComponent } from './user_section/components/post-comments/post-comments.component';
import { EmptyPageComponent } from './shared_components/empty-page/empty-page.component';

// Admin components
import { AdminWrapperComponent } from "./containers/admin-wrapper/admin-wrapper.component";
import { AdminNavbarComponent } from "./admin-section/components/admin-navbar/admin-navbar.component";
import { AdminHomeComponent } from './admin-section/pages/admin-home/admin-home.component';
import { AdminProfileComponent } from './admin-section/pages/admin-profile/admin-profile.component';
import { AdminLoginComponent } from './admin-section/pages/admin-login/admin-login.component';
import {OnlyNotAuthenticatedAdminGuard} from "./admin-section/guards/only-not-authenticated-admin.guard";
import {OnlyAuthenticatedAdminGuard} from "./admin-section/guards/only-authenticated-admin.guard";
import {PendingPostsComponent} from "./user_section/pages/pending-posts/pending-posts.component";
import {DatePipe} from "@angular/common";
import { UserCardComponent } from './user_section/components/user-card/user-card.component';
import { TopRatedPostsComponent } from './user_section/components/top-rated-posts/top-rated-posts.component';
import { ShouldLoginPanelComponent } from './user_section/components/should-login-panel/should-login-panel.component';
import { ChatSidebarComponent } from './user_section/components/chat-sidebar/chat-sidebar.component';

import { SocketIoModule, SocketIoConfig, Socket} from 'ng2-socket-io';
import {CurrentConversationService} from "./user_section/services/current-conversation.service";
import { ChatBoxComponent } from './user_section/components/chat-box/chat-box.component';
import { UserDetailsComponent } from './user_section/pages/user-details/user-details.component';
import { UserInformationsComponent } from './user_section/components/user-informations/user-informations.component';
import {CeiboShare} from "ng2-social-share";
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

// Routes
const appRoutes: Routes = [
  {
    path: '',
    component: BasicWrapperComponent,
    children: [
      { path: '', component: HomeComponent }, // public
      { path: 'profile', canActivate: [OnlyAuthenticatedGuard], component: ProfileComponent },
      { path: 'posts/new', canActivate: [OnlyAuthenticatedGuard], component: NewPostComponent },
      { path: 'posts/:id', component: SinglePostComponent }, // Public
      { path: 'posts/:id/edit', canActivate: [OnlyAuthenticatedGuard], component: EditPostComponent },
      { path: 'users/:id', component: UserDetailsComponent },

      { path: 'login', canActivate: [OnlyNotAuthenticatedGuard], component: LoginComponent },
      { path: 'signup', canActivate: [OnlyNotAuthenticatedGuard], component: SignupComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminWrapperComponent,
    children: [
      { path: '', canActivate: [OnlyAuthenticatedAdminGuard], component: AdminHomeComponent }, // public
      { path: 'profile', canActivate: [OnlyAuthenticatedAdminGuard], component: AdminProfileComponent },
      { path: 'login', canActivate: [OnlyNotAuthenticatedAdminGuard], component: AdminLoginComponent },
    ]
  },
  { path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    BasicWrapperComponent,
    NavbarComponent,
    SignupComponent,
    ProfileComponent,
    UserFormComponent,
    UserPasswordFormComponent,
    NewPostComponent,
    EditPostComponent,
    SinglePostComponent,
    MyPostsComponent,
    PendingPostsComponent,
    PostComponent,
    PostCommentsComponent,
    EmptyPageComponent,
    // Admin,
      AdminWrapperComponent,
      AdminNavbarComponent,
      AdminHomeComponent,
      AdminProfileComponent,
      AdminLoginComponent,
      UserCardComponent,
      TopRatedPostsComponent,
      ShouldLoginPanelComponent,
      ChatSidebarComponent,
      ChatBoxComponent,
      UserDetailsComponent,
      UserInformationsComponent,
    CeiboShare,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    QuillModule,
    RouterModule.forRoot(appRoutes),
    AlertModule.forRoot(),
    BsDropdownModule.forRoot(),
    RatingModule.forRoot(),
    TooltipModule.forRoot(),
    MomentModule,
    ChartsModule,
    PaginationModule.forRoot(),
    SocketIoModule.forRoot(config),
    SlimScrollModule,
  ],
  providers: [
    ApiService,
    AuthService,
    CurrentConversationService,
    OnlyAuthenticatedGuard,
    OnlyNotAuthenticatedGuard,
    OnlyAuthenticatedAdminGuard,
    OnlyNotAuthenticatedAdminGuard,
    DatePipe,
    { provide: Http, useClass: ExtendedHttpService },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
