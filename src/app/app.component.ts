import { Component } from '@angular/core';
import { RoslibService } from './roslib/roslib.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  roscoreIp = '192.168.1.28';
  //roscoreIp = 'rip.eng.hawaii.edu';
  tileserverIp = '192.168.99.100'
  useTileServer = false;
  topics = [];
  loading = true;

  video1Name = `/kanaloa/android_one/camera/image/compressed`;
  video1Type = `sensor_msgs/CompressedImage`;
  video2Name = `/sensor_msgs/CompressedImage:`;
  video2Type = `sensor_msgs/CompressedImage`;
  video3Name = `/wamvFrontCam/usb_cam/image_raw/compressedDepth`;
  video3Type = `sensor_msgs/CompressedImage`;
  video4Name = `/wamvFrontCam//usb_cam/image_raw//compressed`;
  video4Type = `sensor_msgs/CompressedImage`;

  modelName = `/wamvImu/mag`;
  modelType = `geometry_msgs/Vector3Stamped`;

  mapGPSName = `/gps/filtered`;
  mapGPSType = `/sensor_msgs/NavSatFix`;
  mapImuName = `/wamvImu/mag`;
  mapImuType = `geometry_msgs/Vector3Stamped`;

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    scaleShowHorizontalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      fontColor: 'white',
      text: 'Engine Voltages',
      fontSize: 22,
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          max: 80,
          min: 0,
          suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
          // OR //
          beginAtZero: true,   // minimum value will be 0.
          fontColor: 'white',
        }
      }],
      xAxes: [{
        display: true,
        ticks: {
          fontColor: 'white'
        },
        gridLines: {
          display: true,
          color: 'rgba(1, 1, 1, 1)'
        }
      }]
    }
  };
  public barChartLabels: string[] = ['Engine 1', 'Engine 2', 'Engine 3', 'Engine 4', 'Main Voltage'];
  public barChartType = 'bar';
  public barChartLegend = false;
  public chartColors: any[] = [
    {
      backgroundColor: ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600']
    }];
  public barChartData: any[] = [
    { data: [65, 65, 65, 65, 65] },
  ];

  constructor(private rosLib: RoslibService) {}

  setIP() {
    if (this.roscoreIp && this.tileserverIp) {
      this.loading = true;
      this.rosLib.setServerInfo(this.roscoreIp, this.tileserverIp, this.useTileServer).then((result) => {
        if (result) {
          this.loading = false;
          this.createBarChart();
        }
      });
    }
  }

  disconnected() {
    this.loading = true;
  }

  createBarChart() {
    this.rosLib.createTopic('/Q1', 'std_msgs/UInt16').subscribe((data: any) => {
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data[0] = data.data;
      this.barChartData = clone;
    });
    this.rosLib.createTopic('/Q2', 'std_msgs/UInt16').subscribe((data: any) => {
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data[1] = data.data;
      this.barChartData = clone;
    });
    this.rosLib.createTopic('/Q3', 'std_msgs/UInt16').subscribe((data: any) => {
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data[2] = data.data;
      this.barChartData = clone;
    });
    this.rosLib.createTopic('/Q4', 'std_msgs/UInt16').subscribe((data: any) => {
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data[3] = data.data;
      this.barChartData = clone;
    });
    this.rosLib.createTopic('/voltMain', 'std_msgs/Float64').subscribe((data: any) => {
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data[4] = Math.trunc(data.data);
      this.barChartData = clone;
    });
  }
}

