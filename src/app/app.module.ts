import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

import { MaterialModule } from './material/material.module';
import { MapComponent } from './map/map.component';

import { RoslibService } from './roslib/roslib.service';
import { ChartsModule } from 'ng2-charts';
import { VideoComponent } from './video/video.component';
import { ThreeModelComponent } from './three-model/three-model.component';
import { ControlsComponent } from './controls/controls.component';
import { LongPressDirective } from './directives/long-press.directive';

@NgModule({

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule,
    ChartsModule
  ],
  providers: [
    RoslibService,
  ],
  declarations: [
    AppComponent,
    MapComponent,
    VideoComponent,
    ThreeModelComponent,
    ControlsComponent,
    LongPressDirective,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
