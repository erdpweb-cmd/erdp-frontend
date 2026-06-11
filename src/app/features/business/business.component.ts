import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Shift } from '../../core/models/shift.model';
import { User } from '../../core/models/user.model';

interface UserOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TabsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './business.component.html',
  styleUrl: './business.component.scss'
})
export class BusinessComponent implements OnInit {
  userOptions: UserOption[] = [];
  selectedReceptionId: string | null = null;
  selectedKitchenId: string | null = null;
  currentShift: Shift | null = null;
  isLoading = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCurrentShift();
  }

  private loadUsers(): void {
    this.firebaseService.getOrderedBy<User>('users', 'displayName').subscribe({
      next: (users) => {
        this.userOptions = users
          .filter(u => u.isActive)
          .map(u => ({
            label: `${u.displayName} (${u.role === 'admin' ? 'Admin' : 'Colaborador'})`,
            value: u.uid
          }));
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notification.showError('Error al cargar usuarios');
      }
    });
  }

  private loadCurrentShift(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.firebaseService
      .getByField<Shift>('shifts', 'date', today)
      .subscribe({
        next: (shifts) => {
          this.currentShift = shifts.length > 0 ? shifts[0] : null;
          if (this.currentShift) {
            this.selectedReceptionId = this.currentShift.receptionUserId;
            this.selectedKitchenId = this.currentShift.kitchenUserId;
          }
        },
        error: (error) => {
          console.error('Error loading shift:', error);
        }
      });
  }

  saveShifts(): void {
    if (!this.selectedReceptionId || !this.selectedKitchenId) return;

    this.isLoading = true;

    const receptionUser = this.userOptions.find(u => u.value === this.selectedReceptionId);
    const kitchenUser = this.userOptions.find(u => u.value === this.selectedKitchenId);

    const shiftData: Partial<Shift> = {
      receptionUserId: this.selectedReceptionId,
      receptionUserName: receptionUser?.label.split(' (')[0] || '',
      kitchenUserId: this.selectedKitchenId,
      kitchenUserName: kitchenUser?.label.split(' (')[0] || '',
      date: new Date(),
      isOpen: false
    };

    // Guardar en Firestore
    this.notification.showSuccess('Turnos guardados correctamente');
    this.isLoading = false;
  }

  openDay(): void {
    if (!this.selectedReceptionId || !this.selectedKitchenId) {
      this.notification.showWarning('Debes asignar personal a los turnos primero');
      return;
    }

    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    // Crear/actualizar turno como abierto
    const shiftData: Partial<Shift> = {
      isOpen: true,
      openedAt: new Date(),
      openedBy: currentUser?.uid
    };

    this.notification.showSuccess('¡Día laboral iniciado!');

    // Redirigir según el rol del usuario
    this.goToMyPanel();
    this.isLoading = false;
  }

  confirmCloseDay(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de cerrar el día laboral? Se generará un reporte detallado.',
      header: 'Cerrar Día',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cerrar',
      rejectLabel: 'Cancelar',
      accept: () => this.closeDay()
    });
  }

  closeDay(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    // Actualizar turno como cerrado
    if (this.currentShift) {
      const updateData: Partial<Shift> = {
        isOpen: false,
        closedAt: new Date(),
        closedBy: currentUser?.uid
      };

      // Actualizar en Firestore
      this.firebaseService.updateDocument('shifts', this.currentShift.id!, updateData)
        .then(() => {
          this.notification.showSuccess('Día laboral cerrado correctamente');
          // Redirigir al reporte diario
          this.router.navigate(['/reports'], {
            queryParams: {
              period: 'daily',
              date: new Date().toISOString().split('T')[0]
            }
          });
        })
        .catch((error) => {
          console.error('Error closing day:', error);
          this.notification.showError('Error al cerrar el día');
        })
        .finally(() => {
          this.isLoading = false;
        });
    } else {
      // Si no hay turno, solo redirigir al reporte
      this.router.navigate(['/reports'], {
        queryParams: {
          period: 'daily',
          date: new Date().toISOString().split('T')[0]
        }
      });
      this.isLoading = false;
    }
  }

  goToMyPanel(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) return;

    // Determinar a qué panel redirigir según el turno asignado
    if (currentUser.uid === this.selectedReceptionId) {
      this.router.navigate(['/counter']);
    } else if (currentUser.uid === this.selectedKitchenId) {
      this.router.navigate(['/kitchen']);
    } else if (currentUser.role === 'admin') {
      // Los admins pueden elegir, por defecto ir a counter
      this.router.navigate(['/counter']);
    } else {
      this.notification.showWarning('No tienes un turno asignado para hoy');
    }
  }

  get userRoleIcon(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.uid === this.selectedReceptionId) return 'pi-desktop';
    if (currentUser?.uid === this.selectedKitchenId) return 'pi-fire';
    return 'pi-user';
  }

  get userRoleText(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.uid === this.selectedReceptionId) return 'Recepción / Barra';
    if (currentUser?.uid === this.selectedKitchenId) return 'Cocina';
    return 'Sin turno asignado';
  }
}
