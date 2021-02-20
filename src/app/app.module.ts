import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {ImageInputComponentsModule} from 'ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        ImageInputComponentsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
