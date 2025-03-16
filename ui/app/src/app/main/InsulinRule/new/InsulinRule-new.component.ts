import { Component, Injector, ViewChild } from '@angular/core';
import { NavigationService, OFormComponent } from 'ontimize-web-ngx';

@Component({
  selector: 'InsulinRule-new',
  templateUrl: './InsulinRule-new.component.html',
  styleUrls: ['./InsulinRule-new.component.scss']
})
export class InsulinRuleNewComponent {
  @ViewChild("InsulinRuleForm") form: OFormComponent;
  onInsertMode() {
    const default_values = {'id': "nextval('insulin_rules_id_seq'::regclass)"}
    this.form.setFieldValues(default_values);
  }
  constructor(protected injector: Injector) {
    this.injector.get(NavigationService).initialize();
  }
}