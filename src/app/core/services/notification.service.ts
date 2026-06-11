import { Injectable, signal, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastService = inject(MessageService);

  showSuccess(message: string, summary: string = 'Éxito'): void {
    this.toastService.add({
      severity: 'success',
      summary,
      detail: message,
      life: 3000
    });
  }

  showError(message: string, summary: string = 'Error'): void {
    this.toastService.add({
      severity: 'error',
      summary,
      detail: message,
      life: 5000
    });
  }

  showWarning(message: string, summary: string = 'Advertencia'): void {
    this.toastService.add({
      severity: 'warn',
      summary,
      detail: message,
      life: 4000
    });
  }

  showInfo(message: string, summary: string = 'Información'): void {
    this.toastService.add({
      severity: 'info',
      summary,
      detail: message,
      life: 3000
    });
  }

  clear(): void {
    this.toastService.clear();
  }
}
