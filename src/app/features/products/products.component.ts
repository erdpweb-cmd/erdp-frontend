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
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product, Ingredient } from '../../core/models/product.model';

interface ProductType {
  label: string;
  value: string;
}

@Component({
  selector: 'app-products',
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
    CardModule,
    TooltipModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productTypes: ProductType[] = [
    { label: 'Bebida', value: 'bebida' },
    { label: 'Comida', value: 'comida' },
    { label: 'Acompañamiento', value: 'acompanamiento' },
    { label: 'Otro', value: 'otro' }
  ];
  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  displayDialog = false;
  isEdit = false;
  searchText = '';

  product: Product = this.getEmptyProduct();

  get filteredProducts(): Product[] {
    if (!this.searchText) return this.products;
    const search = this.searchText.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.type.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }

  constructor(
    private firebaseService: FirebaseService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private getEmptyProduct(): Product {
    return {
      id: '',
      name: '',
      type: 'comida',
      category: '',
      ingredients: [],
      productionCost: 0,
      publicPrice: 0,
      profit: 0,
      profitPercentage: 0,
      isActive: true,
      createdAt: new Date()
    };
  }

  private loadProducts(): void {
    this.firebaseService.getOrderedBy<Product>('products', 'name').subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notification.showError('Error al cargar productos');
      }
    });
  }

  openDialog(): void {
    this.isEdit = false;
    this.product = this.getEmptyProduct();
    this.displayDialog = true;
  }

  editProduct(product: Product): void {
    this.isEdit = true;
    this.product = { ...product, ingredients: [...(product.ingredients || [])] };
    this.displayDialog = true;
  }

  saveProduct(): void {
    if (!this.isFormValid()) return;

    this.product.profit = this.product.publicPrice - this.product.productionCost;
    this.product.profitPercentage = this.product.productionCost > 0
      ? Math.round((this.product.profit / this.product.productionCost) * 100)
      : 0;

    if (this.isEdit && this.product.id) {
      this.firebaseService.updateDocument('products', this.product.id, this.product)
        .then(() => {
          this.notification.showSuccess('Producto actualizado correctamente');
          this.displayDialog = false;
        })
        .catch((error) => {
          console.error('Error updating product:', error);
          this.notification.showError('Error al actualizar producto');
        });
    } else {
      this.firebaseService.addDocument('products', this.product)
        .then(() => {
          this.notification.showSuccess('Producto creado correctamente');
          this.displayDialog = false;
        })
        .catch((error) => {
          console.error('Error creating product:', error);
          this.notification.showError('Error al crear producto');
        });
    }
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${product.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteProduct(product.id!),
      reject: () => {}
    });
  }

  private deleteProduct(id: string): void {
    this.firebaseService.deleteDocument('products', id)
      .then(() => {
        this.notification.showSuccess('Producto eliminado correctamente');
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
        this.notification.showError('Error al eliminar producto');
      });
  }

  isFormValid(): boolean {
    return !!this.product.name && 
           !!this.product.type && 
           !!this.product.category && 
           this.product.productionCost >= 0 && 
           this.product.publicPrice >= 0;
  }

  calculateProfit(): number {
    return this.product.publicPrice - this.product.productionCost;
  }

  calculateProfitPercentage(): number {
    if (this.product.productionCost <= 0) return 0;
    return Math.round(((this.product.publicPrice - this.product.productionCost) / this.product.productionCost) * 100);
  }

  addIngredient(): void {
    this.product.ingredients.push({
      inventoryItemId: '',
      name: '',
      quantity: 0,
      unit: ''
    });
  }

  removeIngredient(index: number): void {
    this.product.ingredients.splice(index, 1);
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      bebida: 'info',
      comida: 'success',
      acompanamiento: 'warn',
      otro: 'secondary'
    };
    return severities[type] || 'secondary';
  }
}
