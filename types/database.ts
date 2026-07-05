export interface SiteSettings { 
  id: string; shop_name: string; primary_color: string; secondary_color: string; 
  contact_phone: string; contact_email: string; contact_address: string;
  banner_url: string | null; favicon_url: string | null;
  sections_config: any; promo_banners: any; social_links: any; 
  footer_text: string; hero_text: string; font_family: string;
}
export interface PaymentMethod { id: string; operator_name: string; account_name: string; phone_number: string; ussd_template: string; is_active: boolean; }
export interface Category { id: string; name: string; description: string; image_url: string; is_active: boolean; display_order: number; }
export interface Product { 
  id: string; name: string; slug: string; price: number; promo_price: number | null; 
  stock_quantity: number; images: string[]; category_id: string; short_description: string; 
  description: string; status: string; colors: string[]; sizes: string[]; brand: string; 
  sku: string; weight: number | null; dimensions: string; warranty: string; video_url: string; 
  is_popular: boolean; is_recommended: boolean; scheduled_at: string | null;
  promo_end_date: string | null; condition: string;
  categories?: { name: string };
}
export interface Order { 
  id: string; user_id: string; total_amount: number; status: string; payment_method: string; 
  payment_status: string; shipping_region: string; shipping_city: string; 
  shipping_neighborhood: string; transaction_id: string | null; created_at: string; 
  coupon_code: string | null; discount_amount: number;
  profiles?: { full_name: string; phone_number: string };
}
export interface Review { 
  id: string; product_id: string; user_id: string; rating: number; comment: string; 
  created_at: string; profiles?: { full_name: string };
}
export interface Coupon { 
  id: string; code: string; discount_type: 'percent' | 'fixed'; discount_value: number; 
  min_amount: number; expires_at: string | null; is_active: boolean; usage_count: number; 
  max_uses: number; category_id: string | null;
}
export interface Favorite { id: string; user_id: string; product_id: string; created_at: string; }
export interface Notification {
  id: string; user_id: string; type: string; title: string; message: string;
  is_read: boolean; related_id: string | null; created_at: string;
  }
