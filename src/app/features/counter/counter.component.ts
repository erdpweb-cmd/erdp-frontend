import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../core/models/product.model';
import { Order, OrderItem, OrderStatus, AppliedPromotion, AppliedCoupon } from '../../core/models/order.model';
import { Promotion } from '../../core/models/promotion.model';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    BadgeModule,
    CardModule,
    TagModule
  ],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.scss'
})
export class CounterComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  availablePromotions: Promotion[] = [];
  selectedProduct: Product | null = null;
  orderItems: OrderItem[] = [];
  customerName = '';
  couponCode = '';
  appliedCoupon: AppliedCoupon | null = null;
  appliedPromotions: AppliedPromotion[] = [];
  paymentMethod: 'cash' | 'card' | 'transfer' = 'cash';
  productSearchText = '';
  currentUser = this.authService.getCurrentUser();

  promoDiscount = 0;
  couponDiscount = 0;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadPromotions();
  }

  private loadProducts(): void {
    this.firebaseService.getByField<Product>('products', 'isActive', true).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notification.showError('Error al cargar productos');
      }
    });
  }

  private loadPromotions(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.firebaseService
      .getByField<Promotion>('promotions', 'isActive', true)
      .subscribe({
        next: (promos) => {
          this.availablePromotions = promos.filter(p => 
            p.isDaily || (p.startDate && p.endDate && 
              p.startDate <= today && p.endDate >= today)
          );
        },
        error: (error) => {
          console.error('Error loading promotions:', error);
        }
      });
  }

  filterProducts(): void {
    if (!this.productSearchText) {
      this.filteredProducts = this.products;
    } else {
      const search = this.productSearchText.toLowerCase();
      this.filteredProducts = this.products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.type.toLowerCase().includes(search)
      );
    }
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    
    const existingItem = this.orderItems.find(item => item.productId === product.id);
    if (existingItem) {
      existingItem.quantity++;
      existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      this.orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.publicPrice,
        subtotal: product.publicPrice,
        ingredients: product.ingredients
      });
    }
    
    this.calculateTotals();
    this.notification.showInfo(`${product.name} agregado al pedido`);
  }

  updateItemTotal(item: OrderItem): void {
    item.subtotal = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
    this.calculateTotals();
  }

  newOrder(): void {
    this.confirmationService.confirm({
      message: '¿Crear un nuevo pedido? Se perderán los items actuales.',
      header: 'Nuevo Pedido',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orderItems = [];
        this.customerName = '';
        this.couponCode = '';
        this.appliedCoupon = null;
        this.appliedPromotions = [];
        this.promoDiscount = 0;
        this.couponDiscount = 0;
        this.paymentMethod = 'cash';
        this.notification.showInfo('Nuevo pedido iniciado');
      },
      reject: () => {}
    });
  }

  cancelOrder(): void {
    this.confirmationService.confirm({
      message: '¿Cancelar el pedido actual?',
      header: 'Cancelar Pedido',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orderItems = [];
        this.customerName = '';
        this.couponCode = '';
        this.appliedCoupon = null;
        this.appliedPromotions = [];
        this.promoDiscount = 0;
        this.couponDiscount = 0;
        this.notification.showWarning('Pedido cancelado');
      },
      reject: () => {}
    });
  }

  togglePromotion(promo: Promotion): void {
    const index = this.appliedPromotions.findIndex(p => p.promotionId === promo.id);
    if (index > -1) {
      this.appliedPromotions.splice(index, 1);
    } else {
      // Aplicar promoción
      let discount = 0;
      const freeItems: OrderItem[] = [];

      if (promo.type === 'bonus' || promo.type === 'free_product') {
        // Lógica para productos gratis
        // Se busca el producto más barato aplicable
      } else if (promo.type === 'discount') {
        discount = this.orderSubtotal * (promo.discountPercentage || 0) / 100;
      }

      this.appliedPromotions.push({
        promotionId: promo.id,
        promotionName: promo.name,
        discountAmount: discount,
        freeItems
      });
    }
    
    this.calculateTotals();
  }

  isPromoApplied(promoId: string): boolean {
    return this.appliedPromotions.some(p => p.promotionId === promoId);
  }

  applyCoupon(): void {
    if (!this.couponCode) return;

    // Buscar cupón en Firestore
    this.firebaseService
      .getByField<{ code: string; discountType: string; discountValue: number; minPurchase: number; maxUses: number; usedCount: number; isActive: boolean } & { id: string }>('coupons', 'code', this.couponCode.toUpperCase())
      .subscribe({
        next: (coupons) => {
          if (coupons.length === 0) {
            this.notification.showError('Cupón no encontrado');
            return;
          }

          const coupon = coupons[0];
          if (!coupon.isActive) {
            this.notification.showError('Cupón inactivo');
            return;
          }

          if (coupon.usedCount >= coupon.maxUses) {
            this.notification.showError('Cupón agotado');
            return;
          }

          if (this.orderSubtotal < coupon.minPurchase) {
            const formattedMinPurchase = new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(coupon.minPurchase);
            this.notification.showError(`Compra mínima requerida: ${formattedMinPurchase}`);
            return;
          }

          let discount = 0;
          if (coupon.discountType === 'percentage') {
            discount = this.orderSubtotal * coupon.discountValue / 100;
          } else {
            discount = coupon.discountValue;
          }

          this.appliedCoupon = {
            couponId: coupon.id,
            code: coupon.code,
            discountAmount: discount
          };

          this.couponDiscount = discount;
          this.calculateTotals();
          this.notification.showSuccess('Cupón aplicado correctamente');
        },
        error: (error) => {
          console.error('Error applying coupon:', error);
          this.notification.showError('Error al aplicar cupón');
        }
      });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponDiscount = 0;
    this.calculateTotals();
  }

  get orderSubtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get orderTotal(): number {
    return this.orderSubtotal - this.promoDiscount - this.couponDiscount;
  }

  private calculateTotals(): void {
    this.promoDiscount = this.appliedPromotions.reduce((sum, p) => sum + p.discountAmount, 0);
    // El total se calcula automáticamente con el getter
  }

  createOrder(): void {
    if (this.orderItems.length === 0 || !this.customerName) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const order: Omit<Order, 'id'> = {
      orderNumber: Date.now(), // Esto debería ser un secuencial
      customerName: this.customerName,
      items: [...this.orderItems],
      subtotal: this.orderSubtotal,
      discount: this.promoDiscount + this.couponDiscount,
      total: this.orderTotal,
      status: 'pending',
      paymentMethod: this.paymentMethod,
      appliedPromotions: [...this.appliedPromotions],
      appliedCoupon: this.appliedCoupon || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName
    };

    this.firebaseService.addDocument('orders', order)
      .then((id) => {
        this.notification.showSuccess(`Pedido #${order.orderNumber} creado correctamente`);
        this.resetOrder();
      })
      .catch((error) => {
        console.error('Error creating order:', error);
        this.notification.showError('Error al crear pedido');
      });
  }

  private resetOrder(): void {
    this.orderItems = [];
    this.customerName = '';
    this.couponCode = '';
    this.appliedCoupon = null;
    this.appliedPromotions = [];
    this.promoDiscount = 0;
    this.couponDiscount = 0;
    this.paymentMethod = 'cash';
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
