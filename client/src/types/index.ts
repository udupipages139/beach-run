export interface Category {
  id: string;
  name: string;
  distance: string;
  priceINR: number;
  isFree: boolean;
  description: string;
  eligibility: string;
  flagOffTime: string;
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  categoryId: string;
  tshirtSize: string;
  emergencyContact: string;
  previousExperience?: string;
}

export interface OrderResponse {
  success: boolean;
  isFree: boolean;
  isMock?: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  registrationNumber: string;
  registrationId?: string;
  message?: string;
}

export interface VerificationResponse {
  success: boolean;
  registrationNumber: string;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}
