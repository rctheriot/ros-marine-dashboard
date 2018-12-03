import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RoslibService } from '../roslib/roslib.service';


@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {

  topicQ1: any;
  topicQ2: any;
  topicQ3: any;
  topicQ4: any;

  min = 0;
  max = 24;
  step = 1;
  voltageScale = 5;

  @Output() disconnected = new EventEmitter<boolean>();
  constructor(private rosLib: RoslibService) { }

  ngOnInit() {
    this.topicQ1 = this.rosLib.createTopic('/Q1', '/std_msgs/UInt16');
    this.topicQ2 = this.rosLib.createTopic('/Q2', '/std_msgs/UInt16');
    this.topicQ3 = this.rosLib.createTopic('/Q3', '/std_msgs/UInt16');
    this.topicQ4 = this.rosLib.createTopic('/Q4', '/std_msgs/UInt16');
  }

  disconnect() {
    this.rosLib.disconnect();
    this.disconnected.emit(true);
  }

  updateTopics() {
    this.rosLib.updateTopics();
  }

  moveForward() {
    const forward = this.rosLib.createMessage({data: this.voltageScale});
    this.topicQ1.publish(forward);
    this.topicQ2.publish(forward);
    this.topicQ3.publish(forward);
    this.topicQ4.publish(forward);
  }

  moveBackward() {
    // const backward = this.rosLib.createMessage({data: -this.voltageScale});
    // this.topicQ1.publish(backward);
    // this.topicQ2.publish(backward);
    // this.topicQ3.publish(backward);
    // this.topicQ4.publish(backward);
  }

  turnLeft() {
    const forward = this.rosLib.createMessage({data: this.voltageScale});
    this.topicQ1.publish(forward);
    this.topicQ2.publish(forward);
  }

  turnRight() {
    const forward = this.rosLib.createMessage({data: this.voltageScale});
    this.topicQ3.publish(forward);
    this.topicQ4.publish(forward);
  }

}
