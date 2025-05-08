import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [] };
  displayedColumns: string[] = [
    'product',
    'name',
    'price',
    'quantity',
    'total',
    'action',
  ];
  dataSource: CartItem[] = [];
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart.subscribe((_cart) => {
      this.cart = _cart;
      this.dataSource = _cart.items;
    });
  }

  getTotal(items: CartItem[]): number {
    return this.cartService.getTotal(items);
  }

  onAddQuantity(item: CartItem): void {
    this.cartService.addToCart(item);
  }

  onRemoveFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }

  onRemoveQuantity(item: CartItem): void {
    this.cartService.removeQuantity(item);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  onCheckout(): void {
    this.http
      .post<{ url: string }>('http://localhost:4242/checkout', {
        items: this.cart.items,
      })
      .subscribe(
        (res) => {
          if (res.url) {
            // توجه مباشرةً إلى صفحة الدفع المستضافة من Stripe
            window.location.href = res.url;
          } else {
            console.error('❌ Checkout URL not returned');
          }
        },
        (err) => {
          console.error('❌ Checkout request failed', err);
        }
      );
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }
}
