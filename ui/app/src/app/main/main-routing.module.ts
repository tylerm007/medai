import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';

export const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        { path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule) },
        { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
        { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
        { path: 'Patient', loadChildren: () => import('./Patient/Patient.module').then(m => m.PatientModule) },
    
        { path: 'PatientMedication', loadChildren: () => import('./PatientMedication/PatientMedication.module').then(m => m.PatientMedicationModule) },
    
        { path: 'Contraindication', loadChildren: () => import('./Contraindication/Contraindication.module').then(m => m.ContraindicationModule) },
    
        { path: 'Dosage', loadChildren: () => import('./Dosage/Dosage.module').then(m => m.DosageModule) },
    
        { path: 'Drug', loadChildren: () => import('./Drug/Drug.module').then(m => m.DrugModule) },
    
        { path: 'Reading', loadChildren: () => import('./Reading/Reading.module').then(m => m.ReadingModule) },
    
        { path: 'Recommendation', loadChildren: () => import('./Recommendation/Recommendation.module').then(m => m.RecommendationModule) },
    
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }