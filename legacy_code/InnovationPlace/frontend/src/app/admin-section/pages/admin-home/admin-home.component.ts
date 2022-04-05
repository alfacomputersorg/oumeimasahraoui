import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../../user_section/services/api.service";
import { reverse } from "lodash";
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  stats;
  postsByMinuteData=[{data: [], label: "Posts by minute"}];
  postsByMinuteLabels=[];

  postsByHourData=[{data: [], label: "Posts by hour"}];
  postsByHourLabels=[];

  postsByDayData=[{data: [], label: "Posts by Day"}];
  postsByDayLabels=[];

  constructor(
      private apiService: ApiService,
      private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.getStats();
  }

  getStats(){
    let url = `api/stats/general`;

    this.apiService.doGet(url)
        .subscribe(
            (data) => {
              console.log(data);
              this.stats = data.stats;
              this.preparePostsByHour();
              this.preparePostsByMinute();
              this.preparePostsByDay();
            },
            (error) => {
              console.log(error);
            },
        )
  }

    preparePostsByDay(){
        this.stats.postsByDay.forEach((item, index) => {
            let data = item._id
            let date = new Date(data.year, data.month - 1, data.day);
            let preparedDate = this.datePipe.transform(date, 'dd/MM')
            this.postsByDayLabels.push(preparedDate);

            this.postsByDayData[0].data.push(item.count);
        });
    }

  preparePostsByHour(){
      this.stats.postsByHour.forEach((item, index) => {
          let data = item._id
          let date = new Date(data.year, data.month - 1, data.day, data.hour);
          let preparedDate = this.datePipe.transform(date, 'dd/MM hh:mm')
          this.postsByHourLabels.push(preparedDate);

          this.postsByHourData[0].data.push(item.count);
      });
  }
    preparePostsByMinute(){
        this.stats.postsByMinute.forEach((item, index) => {
            let data = item._id
            let date = new Date(data.year, data.month - 1, data.day, data.hour, data.minute);
            let preparedDate = this.datePipe.transform(date, 'dd/MM hh:mm')
            this.postsByMinuteLabels.push(preparedDate);

            this.postsByMinuteData[0].data.push(item.count);
        });
    }
}
