import { Component, OnInit, ViewChild, Input, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { RoslibService } from '../roslib/roslib.service';

declare var require: any;
import * as THREE from 'three';
import { Vector3 } from 'three';
const OBJLoader = require('three-obj-loader')(THREE);
const OrbitControls = require('three-orbit-controls')(THREE);
const PCDLoader = require('../../assets/PCDLoader.js')(THREE);

@Component({
  selector: 'app-three-model',
  templateUrl: './three-model.component.html',
  styleUrls: ['./three-model.component.css']
})
export class ThreeModelComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('threejsWindow') threejsWindow;
  @Input() topicName: string;
  @Input() messageType: string;

  scene: any;
  camera: any;
  threeRenderer: any;
  modelObject: any;
  objLoader: any;
  pcdLoader: any;
  light: any;
  light2: any;
  controls: any;
  THREE: any;
  rotation: any;

  BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  ranOnce = false;

  constructor(private rosLib: RoslibService, private renderer: Renderer2) { }

  ngOnInit() {
    this.rosLib.createTopic(this.topicName, this.messageType).subscribe((data: any) => {
      const mag = data.vector;
      this.modelObject.rotation.y = mag.y - (9 * Math.PI / 2);
    });

    this.rosLib.createTopic('/velodyne_points', 'sensor_msgs/PointCloud2').subscribe((data: any) => {

      if (!this.ranOnce) {

      }
      const message = data;
      const n = message.height * message.width;
      var buffer;
      if (message.data.buffer) {
        buffer = message.data.buffer.buffer;
      } else {
        buffer = Uint8Array.from(this.decode64(message.data)).buffer;
      }
      var dv = new DataView(buffer);

      var particleCount = n;
      var particles = new THREE.Geometry();
      var pMaterial = new THREE.PointsMaterial({
          vertexColors: THREE.VertexColors,
          size: 0.05
        });

      for (var i = 0; i < n; i++) {
        var pt = this.read_point(message, i, dv);
        var position = new THREE.Vector3(pt['x'] * 2, pt['y'] * 2, pt['z'] * 2);
        var d = position.distanceTo( new Vector3() );
        var red = (d - 0) / 10;
        particles.vertices.push(position);
        particles.colors.push(new THREE.Color(red, 0.0, 0.0));
      }
      var pointCloud = new THREE.Points(particles, pMaterial);
      pointCloud.rotateX(Math.PI/2); 
      this.scene.add(pointCloud);
      this.ranOnce = true;
      // var enc = new TextEncoder(); // always utf-8
      // console.log(enc.encode(data.data));
      // console.log(data);
    });
  }

  decode64(x) {
    var a = [], z = 0, bits = 0;
    for (var i = 0, len = x.length; i < len; i++) {
      z += this.BASE64.indexOf(x[i]);
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        a.push(z >> bits);
        z = z & (Math.pow(2, bits) - 1);
      }
      z = z << 6;
    }
    return a;
  }

  read_point(msg, index, data_view) {
    var pt = [];
    var base = msg.point_step * index;
    var n = 4;
    for (var fi = 0; fi < msg.fields.length; fi++) {
      var si = base + msg.fields[fi].offset;
      if (msg.fields[fi].name === 'rgb') {
        pt['rgb'] = data_view.getInt32(si, 1);
      } else {
        pt[msg.fields[fi].name] = data_view.getFloat32(si, 1);
      }
    }
    return pt;
  }


  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.THREE = THREE;
    this.rotation = new this.THREE.Quaternion(0, 0, 0, 1);
    this.objLoader = new this.THREE.OBJLoader();
    this.pcdLoader = new this.THREE.PCDLoader();
    this.scene = new this.THREE.Scene();
    this.objLoader.load(
      './assets/models/boat/10634_SpeedBoat_v01_LOD3.obj', (object) => {

        this.camera = new this.THREE.PerspectiveCamera(75, this.threejsWindow.nativeElement.getBoundingClientRect().width / this.threejsWindow.nativeElement.getBoundingClientRect().height);
        this.threeRenderer = new this.THREE.WebGLRenderer();
        this.threeRenderer.setClearColor(0x27618e, 1);
        this.threeRenderer.setSize(this.threejsWindow.nativeElement.getBoundingClientRect().width, this.threejsWindow.nativeElement.getBoundingClientRect().height);
        this.renderer.appendChild(this.threejsWindow.nativeElement, this.threeRenderer.domElement);

        this.modelObject = object;
        // this.scene.add(this.modelObject);
        this.light = new this.THREE.DirectionalLight(0x6ec8cd);
        this.light.position.set(0, 1, 1).normalize();
        this.scene.add(this.light);

        this.light2 = new this.THREE.DirectionalLight(0xff7360);
        this.light2.position.set(1, 1, -1).normalize();
        this.scene.add(this.light2);

        this.camera.position.x = 10;
        this.camera.position.z = -15;
        this.camera.position.y = 5;
        this.controls = new OrbitControls(this.camera, this.threeRenderer.domElement);

        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper(20);
        this.scene.add(axesHelper);

        this.controls.mouseButtons = {
          ORBIT: this.THREE.MOUSE.LEFT,
          PAN: this.THREE.MOUSE.MIDDLE,
          ZOOM: this.THREE.MOUSE.RIGHT
        };

        this.animate();
      }
    );
  }

  animate() {
    const self: ThreeModelComponent = this;
    (function animate() {
      requestAnimationFrame(animate);
      // self.modelObject.setRotationFromQuaternion(self.rotation);
      self.threeRenderer.render(self.scene, self.camera);
      self.controls.update();
      self.camera.aspect = self.threejsWindow.nativeElement.getBoundingClientRect().width / self.threejsWindow.nativeElement.getBoundingClientRect().height;
      self.camera.updateProjectionMatrix();
      self.threeRenderer.setSize(self.threejsWindow.nativeElement.getBoundingClientRect().width, self.threejsWindow.nativeElement.getBoundingClientRect().height);
    }());
  }

}
