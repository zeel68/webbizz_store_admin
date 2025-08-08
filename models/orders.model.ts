interface iOrdersInfo {
  orders: iOrder[];
  pagination: iPagination;
}
interface iOrder {
  id: string;
  order_number: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  total_amount: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  shipping_method?: string;
  discount?: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    total?: number;
  }>;
  shipping_address?: any;
  billing_address?: any;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
