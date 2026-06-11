import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Order, OrderStatus } from '../../core/models/order.model';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.scss'
})
export class KitchenComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  expandedRows: { [key: string]: boolean } = {};
  isLoading = false;
  private ordersUnsubscribe: (() => void) | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    if (this.ordersUnsubscribe) {
      this.ordersUnsubscribe();
    }
  }

  private loadOrders(): void {
    this.firebaseService
      .getByField<Order>('orders', 'status', 'pending')
      .subscribe({
        next: (pendingOrders) => {
          this.firebaseService
            .getByField<Order>('orders', 'status', 'preparing')
            .subscribe({
              next: (preparingOrders) => {
                this.orders = [...pendingOrders, ...preparingOrders]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              }
            });
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.notification.showError('Error al cargar pedidos');
        }
      });
  }

  toggleRow(order: Order): void {
    if (this.expandedRows[order.id]) {
      delete this.expandedRows[order.id];
    } else {
      this.expandedRows[order.id] = true;
    }
  }

  dispatchOrder(order: Order): void {
    this.confirmationService.confirm({
      message: `¿Despachar pedido #${order.orderNumber}?`,
      header: 'Confirmar despacho',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.confirmDispatch(order),
      reject: () => {}
    });
  }

  private confirmDispatch(order: Order): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const updateData = {
      status: 'delivered' as OrderStatus,
      dispatchedBy: currentUser.uid,
      dispatchedByName: currentUser.displayName,
      dispatchedAt: new Date(),
      updatedAt: new Date()
    };

    this.firebaseService.updateDocument('orders', order.id, updateData)
      .then(() => {
        this.notification.showSuccess(`Pedido #${order.orderNumber} despachado`);
      })
      .catch((error) => {
        console.error('Error dispatching order:', error);
        this.notification.showError('Error al despachar pedido');
      });
  }

  getWaitTime(createdAt: Date): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  }

  getProgressValue(createdAt: Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();
    const minutes = diff / 60000;
    return Math.min((minutes / 30) * 100, 100);
  }

  getTimeClass(createdAt: Date): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();
    const minutes = diff / 60000;

    if (minutes < 10) return 'time-normal';
    if (minutes < 20) return 'time-warning';
    return 'time-danger';
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pendiente',
      preparing: 'En Preparación',
      ready: 'Listo',
      delivered: 'Despachado',
      cancelled: 'Cancelado'
    };
    return labels[status];
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<OrderStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      pending: 'warn',
      preparing: 'info',
      ready: 'success',
      delivered: 'secondary',
      cancelled: 'danger'
    };
    return severities[status] || 'info';
  }

  testNotification(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Notificación de prueba',
      detail: 'El sistema de notificaciones funciona correctamente',
      life: 3000
    });
  }
}
