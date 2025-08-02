export interface Payment {
  _id: string
  user?: string
  order: string
  amount: number
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled" | "processing" | "paid"
  createdAt: string
}

export interface PaymentFormData {
  order: string
  amount: number
  status?: "pending" | "completed" | "failed" | "refunded" | "cancelled" | "processing" | "paid"
}
