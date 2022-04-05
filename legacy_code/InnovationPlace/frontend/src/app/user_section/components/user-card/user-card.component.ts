import {Component, OnInit, Input} from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.sass']
})
export class UserCardComponent implements OnInit {
  @Input() user;

  constructor() {
  }

  ngOnInit() {
  }

}
