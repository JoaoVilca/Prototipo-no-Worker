import { Routes } from '@angular/router';
import { DataProcessing } from './pages/data-processing/data-processing';

export const routes: Routes = [
    {
        path: '', redirectTo: 'data-processing',
        pathMatch: 'full'
    }, // página inicial
    { path: 'data-processing', component: DataProcessing }, // procesamiento
    { path: '**', redirectTo: '' } // fallback
];
