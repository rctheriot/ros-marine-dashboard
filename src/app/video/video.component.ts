import { Component, OnInit, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { RoslibService } from '../roslib/roslib.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  @ViewChild('video') videoData;
  @Input() topicName: string;
  @Input() messageType: string;
  loaded = false;
  selected = {};
  private topicSub: any;

  videoTopics = [];

  constructor(private rosLib: RoslibService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.rosLib.topicsSub.subscribe((topics) => {
      this.videoTopics = [];
      topics.forEach(el => {
        if (el['type'] == 'sensor_msgs/CompressedImage') {
          this.videoTopics.push(el);
        }
      })
    })
    this.updateSub();
  }

  public changeTopic() {
    if (this.selected !== {}) {
      this.topicName = this.selected['name'];
      this.messageType = this.selected['type'];
      if (this.topicSub) {
        this.topicSub.unsubscribe();
      }
      this.updateSub();
    }
  }

  public disconnectVideo() {
    this.loaded = false;
    if (this.topicSub) {
      this.topicSub.unsubscribe();
    }
  }


  private updateSub() {
    this.topicSub = this.rosLib.createTopic(this.topicName, this.messageType);
    this.topicSub.subscribe((data) => {
      this.loaded = true;
      this.changeDetectorRef.detectChanges();
      this.videoData.nativeElement.src = 'data:image/jpeg;base64,' + data.data;
    });
  }

}
