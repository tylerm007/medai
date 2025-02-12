import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientHomeComponent } from './home/Patient-home.component';
import { PatientNewComponent } from './new/Patient-new.component';
import { PatientDetailComponent } from './detail/Patient-detail.component';

const routes: Routes = [
  {path: '', component: PatientHomeComponent},
  { path: 'new', component: PatientNewComponent },
  { path: ':id', component: PatientDetailComponent,
    data: {
      oPermission: {
        permissionId: 'Patient-detail-permissions'
      }
    }
  },{
    path: ':patient_id/PatientMedication', loadChildren: () => import('../PatientMedication/PatientMedication.module').then(m => m.PatientMedicationModule),
    data: {
        oPermission: {
            permissionId: 'PatientMedication-detail-permissions'
        }
    }
},{
    path: ':patient_id/Reading', loadChildren: () => import('../Reading/Reading.module').then(m => m.ReadingModule),
    data: {
        oPermission: {
            permissionId: 'Reading-detail-permissions'
        }
    }
},{
    path: ':patient_id/Recommendation', loadChildren: () => import('../Recommendation/Recommendation.module').then(m => m.RecommendationModule),
    data: {
        oPermission: {
            permissionId: 'Recommendation-detail-permissions'
        }
    }
}
];

export const PATIENT_MODULE_DECLARATIONS = [
    PatientHomeComponent,
    PatientNewComponent,
    PatientDetailComponent 
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }