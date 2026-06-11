import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';

interface ReportPeriod {
  label: string;
  value: string;
}

interface ReportData {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  ordersCount: number;
  productsSold: { name: string; quantity: number; revenue: number }[];
  promotionsApplied: { name: string; count: number; discount: number }[];
  couponsApplied: { code: string; count: number; discount: number }[];
  promoCost: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    ToastModule,
    CardModule,
    TagModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  periodOptions: ReportPeriod[] = [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Trimestral', value: 'quarterly' },
    { label: 'Semestral', value: 'semester' },
    { label: 'Personalizado', value: 'custom' }
  ];

  selectedPeriod = 'daily';
  startDate: Date | null = null;
  endDate: Date | null = null;
  reportData: ReportData | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    // Aquí se cargarían los datos reales desde Firestore
    // Por ahora usamos datos de ejemplo
    this.reportData = {
      totalSales: 2850000,
      totalExpenses: 980000,
      balance: 1870000,
      ordersCount: 342,
      productsSold: [
        { name: 'Hamburguesa Clásica', quantity: 120, revenue: 960000 },
        { name: 'Perro Especial', quantity: 95, revenue: 760000 },
        { name: 'Papas Fritas', quantity: 150, revenue: 450000 },
        { name: 'Coca Cola 350ml', quantity: 200, revenue: 400000 },
        { name: 'Jugo Natural', quantity: 80, revenue: 280000 }
      ],
      promotionsApplied: [
        { name: '2x1 en Hamburguesas', count: 25, discount: 240000 },
        { name: 'Papas Gratis', count: 40, discount: 120000 }
      ],
      couponsApplied: [
        { code: 'BIENVENIDO10', count: 15, discount: 45000 },
        { code: 'PERRITO20', count: 8, discount: 64000 }
      ],
      promoCost: 360000
    };

    this.notification.showSuccess('Reporte generado correctamente');
  }

  getPercentage(value: number): number {
    if (!this.reportData) return 0;
    const total = this.reportData.productsSold.reduce((sum, p) => sum + p.revenue, 0);
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  exportReport(type: string): void {
    // Lógica para exportar a PDF o Excel
    this.notification.showInfo('Exportando reporte...');
  }

  printReport(): void {
    window.print();
  }

  sendWhatsApp(): void {
    if (!this.reportData) return;

    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value);

    const message = `*Reporte de Ventas - El Rincón De Los Perritos*\n\n` +
      `Total Ventas: ${formatCurrency(this.reportData.totalSales)}\n` +
      `Total Egresos: ${formatCurrency(this.reportData.totalExpenses)}\n` +
      `Balance: ${formatCurrency(this.reportData.balance)}\n` +
      `Pedidos: ${this.reportData.ordersCount}\n\n` +
      `Productos más vendidos:\n` +
      this.reportData.productsSold.slice(0, 5).map(p => 
        `- ${p.name}: ${p.quantity} unidades (${formatCurrency(p.revenue)})`
      ).join('\n');

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
}
