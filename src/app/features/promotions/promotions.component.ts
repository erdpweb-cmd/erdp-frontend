import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { Promotion, Coupon, PromotionType } from '../../core/models/promotion.model';

interface PromotionTypeOption {
  label: string;
  value: PromotionType;
}

@Component({
  selector: 'app-promotions',
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
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    ToggleButtonModule,
    MultiSelectModule,
    TabsModule,
    TextareaModule
  ],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  coupons: Coupon[] = [];
  productOptions: { label: string; value: string }[] = [];
  promotionTypes: PromotionTypeOption[] = [
    { label: 'Bono (Lleva X paga Y)', value: 'bonus' },
    { label: 'Producto Gratis', value: 'free_product' },
    { label: 'Descuento', value: 'discount' },
    { label: 'Cupón', value: 'coupon' }
  ];
  discountTypes = [{ label: 'Porcentaje', value: 'percentage' }, { label: 'Valor Fijo', value: 'fixed' }];
  promoDialog = false;
  couponDialog = false;
  isPromoEdit = false;
  isCouponEdit = false;
  promoSearchText = '';

  get filteredPromotions(): Promotion[] {
    if (!this.promoSearchText) return this.promotions;
    const search = this.promoSearchText.toLowerCase();
    return this.promotions.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
  }

  promotion: Promotion = { id: '', name: '', type: 'bonus', description: '', buyQuantity: 1, getQuantity: 1, applicableProductIds: [], isActive: true, isDaily: false, createdAt: new Date() };
  coupon: Coupon = { id: '', code: '', discountType: 'percentage', discountValue: 0, minPurchase: 0, maxUses: 1, usedCount: 0, isActive: true };

  constructor(private firebaseService: FirebaseService, private notification: NotificationService, private confirmationService: ConfirmationService) {}
  ngOnInit(): void { this.loadPromotions(); this.loadCoupons(); this.loadProducts(); }
  private loadPromotions(): void { this.firebaseService.getOrderedBy<Promotion>('promotions', 'createdAt', 'desc').subscribe({ next: (promos) => { this.promotions = promos; }, error: (error) => { console.error('Error loading promotions:', error); this.notification.showError('Error al cargar promociones'); } }); }
  private loadCoupons(): void { this.firebaseService.getOrderedBy<Coupon>('coupons', 'createdAt', 'desc').subscribe({ next: (coupons) => { this.coupons = coupons; }, error: (error) => { console.error('Error loading coupons:', error); this.notification.showError('Error al cargar cupones'); } }); }
  private loadProducts(): void { this.firebaseService.getOrderedBy<{ id: string; name: string }>('products', 'name').subscribe({ next: (products) => { this.productOptions = products.map(p => ({ label: p.name, value: p.id })); }, error: (error) => { console.error('Error loading products:', error); } }); }
  openPromotionDialog(): void { this.isPromoEdit = false; this.promotion = { id: '', name: '', type: 'bonus', description: '', buyQuantity: 1, getQuantity: 1, applicableProductIds: [], isActive: true, isDaily: false, createdAt: new Date() }; this.promoDialog = true; }
  editPromotion(promo: Promotion): void { this.isPromoEdit = true; this.promotion = { ...promo }; this.promoDialog = true; }
  savePromotion(): void { if (!this.isPromoFormValid()) return; this.notification.showSuccess('Promoción guardada correctamente'); this.promoDialog = false; }
  confirmDeletePromotion(promo: Promotion): void { this.confirmationService.confirm({ message: `¿Eliminar "${promo.name}"?`, header: 'Confirmar eliminación', icon: 'pi pi-exclamation-triangle', accept: () => this.notification.showSuccess('Promoción eliminada'), reject: () => {} }); }
  openCouponDialog(): void { this.isCouponEdit = false; this.coupon = { id: '', code: '', discountType: 'percentage', discountValue: 0, minPurchase: 0, maxUses: 1, usedCount: 0, isActive: true }; this.couponDialog = true; }
  editCoupon(coupon: Coupon): void { this.isCouponEdit = true; this.coupon = { ...coupon }; this.couponDialog = true; }
  saveCoupon(): void { if (!this.isCouponFormValid()) return; this.notification.showSuccess('Cupón guardado correctamente'); this.couponDialog = false; }
  confirmDeleteCoupon(coupon: Coupon): void { this.confirmationService.confirm({ message: `¿Eliminar cupón "${coupon.code}"?`, header: 'Confirmar eliminación', icon: 'pi pi-exclamation-triangle', accept: () => this.notification.showSuccess('Cupón eliminado'), reject: () => {} }); }
  isPromoFormValid(): boolean { return !!this.promotion.name && !!this.promotion.type && !!this.promotion.description && this.promotion.buyQuantity >= 1; }
  isCouponFormValid(): boolean { return !!this.coupon.code && !!this.coupon.discountType && this.coupon.discountValue >= 0 && this.coupon.maxUses >= 1; }
  getPromoTypeLabel(type: PromotionType): string { const labels: Record<PromotionType, string> = { bonus: 'Bono', free_product: 'Producto Gratis', discount: 'Descuento', coupon: 'Cupón' }; return labels[type]; }
  getPromoTypeSeverity(type: PromotionType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' { const severities: Record<PromotionType, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = { bonus: 'success', free_product: 'info', discount: 'warn', coupon: 'secondary' }; return severities[type]; }
}
