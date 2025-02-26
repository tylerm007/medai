import { Component, Injector, ViewChild } from '@angular/core';
import { NavigationService, OFormComponent } from 'ontimize-web-ngx';

@Component({
  selector: 'PatientLab-new',
  templateUrl: './PatientLab-new.component.html',
  styleUrls: ['./PatientLab-new.component.scss']
})
export class PatientLabNewComponent {
  @ViewChild("PatientLabForm") form: OFormComponent;
  onInsertMode() {
    const default_values = {'id': "nextval('patient_lab_id_seq'::regclass)"}
    this.form.setFieldValues(default_values);
  }
  constructor(protected injector: Injector) {
    this.injector.get(NavigationService).initialize();
  }
}