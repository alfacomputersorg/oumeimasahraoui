import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCommentsComponent } from './post-comments.component';

describe('PostCommentsComponent', () => {
  let component: PostCommentsComponent;
  let fixture: ComponentFixture<PostCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostCommentsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
