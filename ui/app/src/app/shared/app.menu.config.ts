import { MenuRootItem } from 'ontimize-web-ngx';

import { ContraindicationCardComponent } from './Contraindication-card/Contraindication-card.component';

import { DosageCardComponent } from './Dosage-card/Dosage-card.component';

import { DrugCardComponent } from './Drug-card/Drug-card.component';

import { PatientCardComponent } from './Patient-card/Patient-card.component';

import { ReadingCardComponent } from './Reading-card/Reading-card.component';

import { RecommendationCardComponent } from './Recommendation-card/Recommendation-card.component';


export const MENU_CONFIG: MenuRootItem[] = [
    { id: 'home', name: 'HOME', icon: 'home', route: '/main/home' },
    
    {
    id: 'data', name: ' Main', icon: 'remove_red_eye', opened: true,
    items: [
        { id: 'Patient', name: 'Patient', icon: 'people', route: '/main/Patient' }
    
        ,{ id: 'Reading', name: 'Daily Readings', icon: 'view_list', route: '/main/Reading' }

        ,{ id: 'Recommendation', name: 'Recommendations', icon: 'view_list', route: '/main/Recommendation' }
    ]
    },
    {
    id: 'other', name: ' System', icon: 'remove_red_eye', opened: true,
    items: [
    
        { id: 'Drug', name: 'Drug', icon: 'view_list', route: '/main/Drug' }
        ,{ id: 'Dosage', name: 'Dosage', icon: 'view_list', route: '/main/Dosage' }
        ,{ id: 'Contraindication', name: 'Contraindication', icon: 'view_list', route: '/main/Contraindication' }
    
        ] 
    },
    
    { id: 'settings', name: 'Settings', icon: 'settings', route: '/main/settings'}
    ,{ id: 'about', name: 'About', icon: 'info', route: '/main/about'}
    ,{ id: 'logout', name: 'LOGOUT', route: '/login', icon: 'power_settings_new', confirm: 'yes' }
];

export const MENU_COMPONENTS = [

    ContraindicationCardComponent

    ,DosageCardComponent

    ,DrugCardComponent

    ,PatientCardComponent

    ,ReadingCardComponent

    ,RecommendationCardComponent

];