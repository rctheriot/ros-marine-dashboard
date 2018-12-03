import { Component, AfterViewInit, Input } from '@angular/core';
import { RoslibService } from '../roslib/roslib.service';
declare let L;
import 'leaflet-rotatedmarker';
import * as THREE from 'three';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  selected = {};
  GPSTopics = [];
  private gpsTopicSub: any;
  private gpsTopicSubTest: any;
  lockGPS = true;

  @Input() mapGPSName;
  @Input() mapGPSType;
  @Input() mapImuName;
  @Input() mapImuType;

  map: any;
  boatIcon: any;
  boatMarker = null;
  lastLatLong = null;
  heading = null;
  THREE: any;

  constructor(private rosLib: RoslibService) {
    this.boatIcon = L.icon({
      iconUrl: './assets/wamv-icon.png',
      iconSize: [40, 20], // size of the icon
      iconAnchor: [20, 10], // point of the icon which will correspond to marker's location
    });

    this.selected = this.mapGPSName;

    this.rosLib.topicsSub.subscribe((topics) => {
      this.GPSTopics = [];
      console.log(topics)
      topics.forEach(el => {
        if (el['type'] == 'sensor_msgs/NavSatFix') {
          this.GPSTopics.push(el);
        }
      })
    })
  }

  ngAfterViewInit() {
    this.THREE = THREE;
    this.updateGPSSub();
    // this.rosLib.createTopic(this.mapImuName, this.mapImuType).subscribe((data: any) => {
    this.rosLib.createTopic('/kanaloa/android/imu_device', '/sensor_msgs/NavSatFix').subscribe((data: any) => {
      const mag = data.vector;
      const x = mag.x * (180 / Math.PI);
      const y = mag.y * (-180 / Math.PI) - 9;
      const z = mag.z * (180 / Math.PI);
      this.heading = y;
    });
    this.createMap();
  }


  createMap() {
    this.map = L.map('map', { attributionControl: false }).setView([21.296894, -157.778955], 12);
    if (this.rosLib.useTileServer) {
      L.tileLayer(`http://${this.rosLib.getTileServerIp()}:8080/styles/osm-bright/{z}/{x}/{y}.png`).addTo(this.map);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(this.map);
    }
    this.map.invalidateSize();
  }

  addMarker(lat: number, long: number) {
    if (lat && long) {
      this.lastLatLong = L.latLng(lat, long);
      L.circle(this.lastLatLong, {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.5,
        radius: 2
      }).addTo(this.map);
    }
    if (this.boatMarker) {
      this.lastLatLong = L.latLng(lat, long);
      this.map.removeLayer(this.boatMarker);
      this.boatMarker = L.marker(this.lastLatLong, { icon: this.boatIcon, rotationAngle: this.heading }).addTo(this.map);
      this.boatMarker.setRotationAngle(this.heading);
    } else {
      this.lastLatLong = L.latLng(lat, long);
      this.boatMarker = L.marker(this.lastLatLong, { icon: this.boatIcon }).addTo(this.map);
    }
    if (this.lockGPS) {
      this.map.setView(L.latLng(lat, long));
    }
    this.map.invalidateSize();
  }

  public disconnectGPS() {
    if (this.gpsTopicSub) {
      this.gpsTopicSub.unsubscribe();
    }
  }

  private updateGPSSub() {
    this.gpsTopicSub = this.rosLib.createTopic('/kanaloa/android/gps', '/sensor_msgs/NavSatFix');
    this.gpsTopicSub.subscribe((data: any) => {
      this.addMarker(Number(data.latitude), Number(data.longitude));
    });
    this.gpsTopicSubTest = this.rosLib.createTopic('/gps/filtered', '/sensor_msgs/NavSatFix');
    this.gpsTopicSubTest.subscribe((data: any) => {
      this.addTestMarker(Number(data.latitude), Number(data.longitude));
    });
  }

  addTestMarker(lat: number, long: number) {
    if (lat && long) {
      const lastLatLong = L.latLng(lat, long);
      L.circle(lastLatLong, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.5,
        radius: 2
      }).addTo(this.map);
    }
    this.map.invalidateSize();
  }

  public changeGPSTopic() {
    if (this.selected !== {}) {
      this.mapGPSName = this.selected['name'];
      this.mapGPSType = this.selected['type'];
      if (this.gpsTopicSub) {
        this.gpsTopicSub.unsubscribe();
      }
      this.updateGPSSub();
    }
  }

  public lockUnlockGPS() {
    this.lockGPS = !this.lockGPS;
  }

}
