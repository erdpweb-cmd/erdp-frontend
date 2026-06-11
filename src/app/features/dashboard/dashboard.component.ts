import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';
import { FirebaseService } from '../../core/services/firebase.service';

interface PeriodOption {
  label: string;
  value: string;
}

interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  ordersCount: number;
  avgTicket: number;
}

interface StockAlert {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ChartModule,
    SelectModule,
    TableModule,
    BadgeModule,
    ProgressBarModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  periodOptions: PeriodOption[] = [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Trimestral', value: 'quarterly' },
    { label: 'Semestral', value: 'semester' }
  ];

  selectedPeriod = 'daily';
  stats: DashboardStats = {
    totalSales: 0,
    totalExpenses: 0,
    balance: 0,
    ordersCount: 0,
    avgTicket: 0
  };
  stockAlerts: StockAlert[] = [];
  salesChartData: any;
  productsChartData: any;
  chartOptions: any;
  doughnutOptions: any;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initCharts();
    this.loadDashboardData();
  }

  private initCharts(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    };

    this.salesChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ventas',
          data: [65, 59, 80, 81, 56, 55],
          fill: true,
          borderColor: '#7DA64A',
          backgroundColor: 'rgba(125, 166, 74, 0.1)',
          tension: 0.4
        },
        {
          label: 'Egresos',
          data: [28, 48, 40, 19, 86, 27],
          fill: true,
          borderColor: '#D62828',
          backgroundColor: 'rgba(214, 40, 40, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.productsChartData = {
      labels: ['Perros', 'Hamburguesas', 'Papas', 'Bebidas', 'Otros'],
      datasets: [
        {
          data: [300, 250, 150, 100, 50],
          backgroundColor: [
            '#F59E0B',
            '#FFC72C',
            '#4E8FA1',
            '#7DA64A',
            '#E07A5F'
          ]
        }
      ]
    };
  }

  loadDashboardData(): void {
    this.stats = {
      totalSales: 1250000,
      totalExpenses: 450000,
      balance: 800000,
      ordersCount: 156,
      avgTicket: 8012
    };

    this.stockAlerts = [
      {
        id: '1',
        name: 'Pan de perro',
        currentStock: 15,
        minStock: 20,
        unit: 'unidades'
      },
      {
        id: '2',
        name: 'Salchicha',
        currentStock: 8,
        minStock: 10,
        unit: 'kg'
      },
      {
        id: '3',
        name: 'Papas',
        currentStock: 5,
        minStock: 15,
        unit: 'kg'
      }
    ];
  }

  restock(item: StockAlert): void {
    console.log('Reponer:', item);
  }
}
