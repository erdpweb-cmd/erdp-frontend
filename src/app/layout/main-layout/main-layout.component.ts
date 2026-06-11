import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DrawerModule,
    ButtonModule,
    AvatarModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  user: User | null = null;
  sidebarCollapsed = false;
  mobileSidebarVisible = false;

  constructor(
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  getPageTitle(): string {
    const url = this.router.url;
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/business': 'Gestión del Negocio',
      '/inventory': 'Inventario',
      '/products': 'Productos',
      '/promotions': 'Promociones',
      '/staff': 'Personal',
      '/kitchen': 'Panel de Cocina',
      '/counter': 'Barra / Recepción',
      '/reports': 'Reportes'
    };
    return titles[url] || 'El Rincón De Los Perritos';
  }

  logout(): void {
    this.authService.logout();
    this.notification.showInfo('Sesión cerrada correctamente');
  }
}
