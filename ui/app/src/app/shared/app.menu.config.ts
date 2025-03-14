import { MenuRootItem } from 'ontimize-web-ngx';

import { ContraindicationCardComponent } from './Contraindication-card/Contraindication-card.component';

import { DosageCardComponent } from './Dosage-card/Dosage-card.component';

import { DrugCardComponent } from './Drug-card/Drug-card.component';

import { DrugUnitCardComponent } from './DrugUnit-card/DrugUnit-card.component';

import { PatientCardComponent } from './Patient-card/Patient-card.component';

import { PatientLabCardComponent } from './PatientLab-card/PatientLab-card.component';

import { PatientMedicationCardComponent } from './PatientMedication-card/PatientMedication-card.component';

import { ReadingCardComponent } from './Reading-card/Reading-card.component';

import { ReadingHistoryCardComponent } from './ReadingHistory-card/ReadingHistory-card.component';

import { RecommendationCardComponent } from './Recommendation-card/Recommendation-card.component';


export const MENU_CONFIG: MenuRootItem[] = [
    { id: 'home', name: 'HOME', icon: 'home', route: '/main/home' },
    
    {
    id: 'data', name: ' data', icon: 'remove_red_eye', opened: true,
    items: [
    
        { id: 'Patient', name: 'Patient', icon: 'view_list', route: '/main/Patient' }
    
        ,{ id: 'Reading', name: 'Readings', icon: 'view_list', route: '/main/Reading' }
        ,{ id: 'ReadingHistory', name: 'History', icon: 'view_list', route: '/main/ReadingHistory' }
        ,{ id: 'PatientMedication', name: 'Medication', icon: 'view_list', route: '/main/PatientMedication' }
    
        ,{ id: 'Contraindication', name: 'Contraindication', icon: 'view_list', route: '/main/Contraindication' }
    
        ,{ id: 'Dosage', name: 'Dosage', icon: 'view_list', route: '/main/Dosage' }
    
        ,{ id: 'Drug', name: 'Drug', icon: 'view_list', route: '/main/Drug' }
    
        ,{ id: 'Recommendation', name: 'Recommendation', icon: 'view_list', route: '/main/Recommendation' }
	,{ id: 'PatientLab', name: 'Labs', icon: 'view_list', route: '/main/PatientLab' }
    
    ] 
},
    
    { id: 'settings', name: 'Settings', icon: 'settings', route: '/main/settings'}
    ,{ id: 'DrugUnit', name: 'Unit of Measure', icon: 'view_list', route: '/main/DrugUnit' }
    ,{ id: 'about', name: 'About', icon: 'info', route: '/main/about'}
    ,{ id: 'logout', name: 'LOGOUT', route: '/login', icon: 'power_settings_new', confirm: 'yes' }
];

export const MENU_COMPONENTS = [

    ContraindicationCardComponent

    ,DosageCardComponent

    ,DrugCardComponent

    ,DrugUnitCardComponent

    ,PatientCardComponent

    ,PatientLabCardComponent

    ,PatientMedicationCardComponent

    ,ReadingCardComponent

    ,ReadingHistoryCardComponent

    ,RecommendationCardComponent

];