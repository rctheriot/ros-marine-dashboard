import { Injectable } from '@angular/core';
import * as ROSLIB from 'roslib';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class RoslibService {

  private rbServer: ROSLIB.Ros;
  private topics = [];
  public topicsSub = new BehaviorSubject<Array<Object>>([]);
  private roscoreIP = '192.168.1.28';
  private tileserverIP = '192.168.1.117';
  public useTileServer = false;
  constructor() {}

  public setServerInfo(rosIP: string, tileserverIP: string, useTileServer: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.rbServer) {
        this.rbServer.close();
      }
      this.roscoreIP = rosIP;
      this.tileserverIP = tileserverIP;
      this.useTileServer = useTileServer;
      this.rbServer = new ROSLIB.Ros({
        url: `ws://${this.roscoreIP}:9090`
      });
      // This function is called upon the rosbridge connection event
      this.rbServer.on('connection', () => {
        console.log('Connected to websocket');
        this.updateTopics();
        return resolve(true);
      });
      // This function is called when there is an error attempting to connect to rosbridge
      this.rbServer.on('error', (error) => {
        // Write appropriate message to #feedback div upon error when attempting to connect to rosbridge
        console.log('Error connecting to websocket server.');
        return resolve(false);
      });
      // This function is called when the connection to rosbridge is closed
      this.rbServer.on('close', () => {
        console.log('Connection to websocket server closed');
        return resolve(false);
      });

    });

  }

  public getRosCoreIp() {
    return this.roscoreIP;
  }

  public getTileServerIp() {
    return this.tileserverIP;
  }

  public createTopic(topicName: string, messageType: string): ROSLIB.Topic {
    const imageTopic = new ROSLIB.Topic({
      ros: this.rbServer,
      name: topicName,
      messageType: messageType,
      queue: 1
    });
    return imageTopic;
  }
  public createMessage(message: any): ROSLIB.Message {
    const msg = new ROSLIB.Message(message);
    return msg;
  }

  public disconnect() {
    this.rbServer.close();
  }

  public updateTopics() {
    const topicsClient = new ROSLIB.Service({
      ros: this.rbServer,
      name: '/rosapi/topics',
      serviceType: '/rosapi/Topics'
    });
    this.topics = [];
    const request = new ROSLIB.ServiceRequest();
    topicsClient.callService(request, (result) => {
      const promises = [];
      result.topics.forEach(topic => {
        promises.push(this.getTopicInfo(topic));
      });
      Promise.all(promises).then(topics => {
        this.topics = topics;
        this.topicsSub.next(this.topics);
      })
    });
  }

  private getTopicInfo(topicName: string): Promise<Object> {
    const topicsClient = new ROSLIB.Service({
      ros: this.rbServer,
      name: '/rosapi/topic_type',
      serviceType: '/rosapi/Topics'
    });
    // console.log(topicName);
    const request = new ROSLIB.ServiceRequest({ topic: topicName });
    return new Promise((resolve, reject) => topicsClient.callService(request, (result) => {
      return resolve({ 'name': topicName, 'type': result.type });
    }));
  }

  public getVideoTopics() {
    const videoTopics = [];
    this.topics.forEach(topic => {
      if (topic.type === '/sensor_msgs/CompressedImage') {
        videoTopics.push(topic);
      }
    });
    return videoTopics;
  }

  public getGPSTopics() {
    const gpsTopics = [];
    this.topics.forEach(topic => {
      if (topic.type === '/sensor_msgs/NavSatFix') {
        gpsTopics.push(topic);
      }
    });
    return gpsTopics;
  }



}

// roslib.service.ts:85 Topic:/rosout:  ||| type: rosgraph_msgs/Log
// roslib.service.ts:85 Topic:/rosout_agg:  ||| type: rosgraph_msgs/Log

// roslib.service.ts:85 Topic:/voltMain:  ||| type: std_msgs/Float64
// roslib.service.ts:85 Topic:/tf_static:  ||| type: tf2_msgs/TFMessage

// roslib.service.ts:85 Topic:/diagnostics:  ||| type: diagnostic_msgs/DiagnosticArray
// roslib.service.ts:85 Topic:/vel:  ||| type: geometry_msgs/TwistStamped

// roslib.service.ts:85 Topic:/time_reference:  ||| type: sensor_msgs/TimeReference

// roslib.service.ts:85 Topic:/wamvGps:  ||| type: sensor_msgs/NavSatFix

// roslib.service.ts:85 Topic:/wamvImu/temperature:  ||| type: std_msgs/Float32
// roslib.service.ts:85 Topic:/wamvImu/data:  ||| type: sensor_msgs/Imu
// roslib.service.ts:85 Topic:/wamvImu/mag:  ||| type: geometry_msgs/Vector3Stamped
// roslib.service.ts:85 Topic:/wamvImu/rpy:  ||| type: geometry_msgs/Vector3Stamped

// roslib.service.ts:85 Topic:/autoQ1:  ||| type: std_msgs/Float64
// roslib.service.ts:85 Topic:/autoQ2:  ||| type: std_msgs/Float64
// roslib.service.ts:85 Topic:/autoQ3:  ||| type: std_msgs/Float64
// roslib.service.ts:85 Topic:/autoQ4:  ||| type: std_msgs/Float64
// roslib.service.ts:85 Topic:/Q1:  ||| type: std_msgs/UInt16
// roslib.service.ts:85 Topic:/Q4:  ||| type: std_msgs/UInt16
// roslib.service.ts:85 Topic:/Q2:  ||| type: std_msgs/UInt16
// roslib.service.ts:85 Topic:/Q3:  ||| type: std_msgs/UInt16

// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/compressedDepth/parameter_descriptions:  ||| type: dynamic_reconfigure/ConfigDescription
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/camera_info:  ||| type: sensor_msgs/CameraInfo
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/theora/parameter_descriptions:  ||| type: dynamic_reconfigure/ConfigDescription
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/theora/parameter_updates:  ||| type: dynamic_reconfigure/Config
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/compressedDepth/parameter_updates:  ||| type: dynamic_reconfigure/Config
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/compressed/parameter_updates:  ||| type: dynamic_reconfigure/Config
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/theora:  ||| type: theora_image_transport/Packet
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/compressed/parameter_descriptions:  ||| type: dynamic_reconfigure/ConfigDescription
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/compressed:  ||| type: sensor_msgs/CompressedImage
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw/compressedDepth:  ||| type: sensor_msgs/CompressedImage
// roslib.service.ts:85 Topic:/wamvFrontCam/usb_cam/image_raw:  ||| type: sensor_msgs/Image

// roslib.service.ts:85 Topic:/sensor_msgs/CompressedImage:  ||| type: sensor_msgs/CompressedImage
