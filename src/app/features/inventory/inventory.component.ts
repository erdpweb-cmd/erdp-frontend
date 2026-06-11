import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { InventoryItem, InventoryCategory } from '../../core/models/inventory.model';

interface CategoryOption {
  label: string;
  value: InventoryCategory;
}

@Component({
  selector: 'app-inventory',
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
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    FileUploadModule,
    TooltipModule
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  categoryOptions: CategoryOption[] = [
    { label: 'Bebidas', value: 'bebidas' },
    { label: 'Empaques', value: 'empaques' },
    { label: 'Alimentos', value: 'alimentos' },
    { label: 'Limpieza', value: 'limpieza' },
    { label: 'Otro', value: 'otro' }
  ];

  displayDialog = false;
  scannerDialog = false;
  isEdit = false;
  searchText = '';
  scanning = false;
  scannedCode = '';

  get filteredItems(): InventoryItem[] {
    if (!this.searchText) return this.inventoryItems;
    const search = this.searchText.toLowerCase();
    return this.inventoryItems.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      (item.subcategory && item.subcategory.toLowerCase().includes(search))
    );
  }

  item: InventoryItem = {
    id: '',
    name: '',
    category: 'alimentos',
    quantity: 0,
    unit: 'unidades',
    minStock: 0,
    costPerUnit: 0,
    lastUpdated: new Date()
  };

  constructor(
    private firebaseService: FirebaseService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  private loadInventory(): void {
    this.firebaseService.getOrderedBy<InventoryItem>('inventory', 'name').subscribe({
      next: (items) => {
        this.inventoryItems = items;
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
        this.notification.showError('Error al cargar inventario');
      }
    });
  }

  openDialog(): void {
    this.isEdit = false;
    this.item = {
      id: '',
      name: '',
      category: 'alimentos',
      quantity: 0,
      unit: 'unidades',
      minStock: 0,
      costPerUnit: 0,
      lastUpdated: new Date()
    };
    this.displayDialog = true;
  }

  editItem(item: InventoryItem): void {
    this.isEdit = true;
    this.item = { ...item };
    this.displayDialog = true;
  }

  saveItem(): void {
    if (!this.isFormValid()) return;

    const itemData = {
      ...this.item,
      lastUpdated: new Date()
    };

    if (this.isEdit && this.item.id) {
      this.firebaseService.updateDocument('inventory', this.item.id, itemData)
        .then(() => {
          this.notification.showSuccess('Item actualizado correctamente');
          this.displayDialog = false;
        })
        .catch((error) => {
          console.error('Error updating item:', error);
          this.notification.showError('Error al actualizar item');
        });
    } else {
      this.firebaseService.addDocument('inventory', itemData)
        .then((id) => {
          this.notification.showSuccess('Item creado correctamente');
          this.displayDialog = false;
        })
        .catch((error) => {
          console.error('Error creating item:', error);
          this.notification.showError('Error al crear item');
        });
    }
  }

  confirmDelete(item: InventoryItem): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${item.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteItem(item.id!),
      reject: () => {}
    });
  }

  private deleteItem(id: string): void {
    this.firebaseService.deleteDocument('inventory', id)
      .then(() => {
        this.notification.showSuccess('Item eliminado correctamente');
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        this.notification.showError('Error al eliminar item');
      });
  }

  isFormValid(): boolean {
    return !!this.item.name &&
           !!this.item.category &&
           this.item.quantity >= 0 &&
           !!this.item.unit &&
           this.item.minStock >= 0 &&
           this.item.costPerUnit >= 0;
  }

  onSearch(): void {
    // La búsqueda se maneja automáticamente con el getter filteredItems
  }

  openScanner(): void {
    this.scannerDialog = true;
  }

  toggleScanner(): void {
    this.scanning = !this.scanning;
    if (this.scanning) {
      this.startScanner();
    } else {
      this.stopScanner();
    }
  }

  private startScanner(): void {
    console.log('Iniciando escáner...');
  }

  private stopScanner(): void {
    console.log('Deteniendo escáner...');
  }

  useScannedCode(): void {
    this.item.barcode = this.scannedCode;
    this.scannerDialog = false;
    this.scannedCode = '';
    this.scanning = false;
  }

  getCategoryLabel(category: InventoryCategory): string {
    const labels: Record<InventoryCategory, string> = {
      bebidas: 'Bebidas',
      empaques: 'Empaques',
      alimentos: 'Alimentos',
      limpieza: 'Limpieza',
      otro: 'Otro'
    };
    return labels[category];
  }

  getCategorySeverity(category: InventoryCategory): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<InventoryCategory, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      bebidas: 'info',
      empaques: 'secondary',
      alimentos: 'success',
      limpieza: 'warn',
      otro: 'secondary'
    };
    return severities[category];
  }

  getStockClass(item: InventoryItem): string {
    return item.quantity <= item.minStock ? 'stock-low' : 'stock-normal';
  }
}

