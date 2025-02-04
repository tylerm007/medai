import { Component, Injector, ViewChild } from '@angular/core';
import { NavigationService, OFormComponent } from 'ontimize-web-ngx';

@Component({
  selector: 'Reading-new',
  templateUrl: './Reading-new.component.html',
  styleUrls: ['./Reading-new.component.scss']
})
export class ReadingNewComponent {
  @ViewChild("ReadingForm") form: OFormComponent;
  onInsertMode() {
    const default_values = {'reading_date': "2025-01-01","morning": 0.0,"afternoon": 0.0,"dinner": 0.0,"bedtime": 0.0};  
    this.form.setFieldValues(default_values);
  }
  constructor(protected injector: Injector) {
    this.injector.get(NavigationService).initialize();
  }
}