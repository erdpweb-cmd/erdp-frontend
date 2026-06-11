import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'business',
        loadComponent: () => import('./features/business/business.component').then(m => m.BusinessComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'promotions',
        loadComponent: () => import('./features/promotions/promotions.component').then(m => m.PromotionsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/staff/staff.component').then(m => m.StaffComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'kitchen',
        loadComponent: () => import('./features/kitchen/kitchen.component').then(m => m.KitchenComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'collaborator'] }
      },
      {
        path: 'counter',
        loadComponent: () => import('./features/counter/counter.component').then(m => m.CounterComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'collaborator'] }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
