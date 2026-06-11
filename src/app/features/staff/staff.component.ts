import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TabsModule } from 'primeng/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, UserRole } from '../../core/models/user.model';
import { Payment, PaymentType } from '../../core/models/payment.model';

interface RoleOption {
  label: string;
  value: UserRole;
}

interface PaymentTypeOption {
  label: string;
  value: PaymentType;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    InputMaskModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    TabsModule,
    FileUploadModule,
    TextareaModule
  ],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  users: User[] = [];
  payments: Payment[] = [];
  userOptions: { label: string; value: string }[] = [];

  roleOptions: RoleOption[] = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Colaborador', value: 'collaborator' }
  ];

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  paymentTypes: PaymentTypeOption[] = [
    { label: 'Salario', value: 'salary' },
    { label: 'Bono', value: 'bonus' },
    { label: 'Adelanto', value: 'advance' },
    { label: 'Otro', value: 'other' }
  ];

  userDialog = false;
  paymentDialog = false;
  isUserEdit = false;
  isPaymentEdit = false;
  userSearchText = '';
  paymentSearchText = '';

  get filteredUsers(): User[] {
    if (!this.userSearchText) return this.users;
    const search = this.userSearchText.toLowerCase();
    return this.users.filter(u =>
      u.displayName.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      (u.cedula && u.cedula.includes(search))
    );
  }

  get filteredPayments(): Payment[] {
    if (!this.paymentSearchText) return this.payments;
    const search = this.paymentSearchText.toLowerCase();
    return this.payments.filter(p =>
      p.userName.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  user: User = { uid: '', email: '', displayName: '', role: 'collaborator', isActive: true, createdAt: new Date() };
  payment: Payment = { id: '', userId: '', userName: '', type: 'salary', amount: 0, description: '', paymentDate: new Date(), createdAt: new Date() };

  constructor(
    private firebaseService: FirebaseService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void { this.loadUsers(); this.loadPayments(); }

  private loadUsers(): void {
    this.firebaseService.getOrderedBy<User>('users', 'displayName').subscribe({
      next: (users) => {
        this.users = users;
        this.userOptions = users.map(u => ({ label: u.displayName, value: u.uid }));
      },
      error: (error) => { console.error('Error loading users:', error); this.notification.showError('Error al cargar usuarios'); }
    });
  }

  private loadPayments(): void {
    this.firebaseService.getOrderedBy<Payment>('payments', 'paymentDate', 'desc').subscribe({
      next: (payments) => { this.payments = payments; },
      error: (error) => { console.error('Error loading payments:', error); this.notification.showError('Error al cargar pagos'); }
    });
  }

  openUserDialog(): void { this.isUserEdit = false; this.user = { uid: '', email: '', displayName: '', role: 'collaborator', isActive: true, createdAt: new Date() }; this.userDialog = true; }
  editUser(user: User): void { this.isUserEdit = true; this.user = { ...user }; this.userDialog = true; }
  saveUser(): void { if (!this.isUserFormValid()) return; this.notification.showSuccess('Usuario guardado correctamente'); this.userDialog = false; }
  confirmDeleteUser(user: User): void { this.confirmationService.confirm({ message: `¿Eliminar a "${user.displayName}"?`, header: 'Confirmar eliminación', icon: 'pi pi-exclamation-triangle', accept: () => this.notification.showSuccess('Usuario eliminado'), reject: () => {} }); }

  openPaymentDialog(): void { this.isPaymentEdit = false; this.payment = { id: '', userId: '', userName: '', type: 'salary', amount: 0, description: '', paymentDate: new Date(), createdAt: new Date() }; this.paymentDialog = true; }
  savePayment(): void { if (!this.isPaymentFormValid()) return; this.notification.showSuccess('Pago registrado correctamente'); this.paymentDialog = false; }
  confirmDeletePayment(payment: Payment): void { this.confirmationService.confirm({ message: '¿Eliminar este pago?', header: 'Confirmar eliminación', icon: 'pi pi-exclamation-triangle', accept: () => this.notification.showSuccess('Pago eliminado'), reject: () => {} }); }

  isUserFormValid(): boolean { return !!this.user.displayName && !!this.user.email && !!this.user.role; }
  isPaymentFormValid(): boolean { return !!this.payment.userId && !!this.payment.type && this.payment.amount > 0; }

  onFileSelect(event: any): void { console.log('File selected:', event); }

  getPaymentTypeLabel(type: PaymentType): string {
    const labels: Record<PaymentType, string> = { salary: 'Salario', bonus: 'Bono', advance: 'Adelanto', other: 'Otro' };
    return labels[type];
  }

  getPaymentTypeSeverity(type: PaymentType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<PaymentType, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = { salary: 'success', bonus: 'info', advance: 'warn', other: 'secondary' };
    return severities[type];
  }
}
