import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-user-informations',
  templateUrl: './user-informations.component.html',
  styleUrls: ['./user-informations.component.sass']
})
export class UserInformationsComponent implements OnInit {
  @Input() user;

  constructor() { }

  ngOnInit() {
  }

}
