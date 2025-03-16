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
    const default_values = {'id': "nextval('reading_id_seq'::regclass)"}
    this.form.setFieldValues(default_values);
  }
  constructor(protected injector: Injector) {
    this.injector.get(NavigationService).initialize();
  }
}