import { supabase } from '../config/supabase.js';

export interface RegistrationRecord {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  categoryId: string;
  categoryName: string;
  tshirtSize: string;
  emergencyContact: string;
  previousExperience?: string;
  status: 'PENDING' | 'PAID' | 'FREE';
  amountINR: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

// In-memory fallback database for development testing when Supabase is not connected
const inMemoryRegistrations = new Map<string, RegistrationRecord>();

export class RegistrationService {
  /**
   * Generate unique registration number (e.g. UBR2026-8491)
   */
  private static generateRegistrationNumber(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `UBR2026-${randomDigits}`;
  }

  /**
   * Create a new pending or free registration
   */
  static async createRegistration(data: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    categoryId: string;
    categoryName: string;
    tshirtSize: string;
    emergencyContact: string;
    previousExperience?: string;
    amountINR: number;
    isFree: boolean;
    razorpayOrderId?: string;
  }): Promise<RegistrationRecord> {
    const id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const registrationNumber = this.generateRegistrationNumber();
    const status = data.isFree ? 'FREE' : 'PENDING';
    const createdAt = new Date().toISOString();

    const record: RegistrationRecord = {
      id,
      registrationNumber,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      age: data.age,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      tshirtSize: data.tshirtSize,
      emergencyContact: data.emergencyContact,
      previousExperience: data.previousExperience,
      status,
      amountINR: data.amountINR,
      razorpayOrderId: data.razorpayOrderId,
      createdAt
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('registrations').insert({
          id: record.id,
          registration_number: record.registrationNumber,
          full_name: record.fullName,
          email: record.email,
          phone: record.phone,
          age: record.age,
          category_id: record.categoryId,
          category_name: record.categoryName,
          tshirt_size: record.tshirtSize,
          emergency_contact: record.emergencyContact,
          status: record.status,
          amount_paid: record.amountINR,
          razorpay_order_id: record.razorpayOrderId,
          created_at: record.createdAt
        });

        if (error) {
          console.error('[RegistrationService] Supabase insert error, falling back to local memory store:', error);
          inMemoryRegistrations.set(record.id, record);
        }
      } catch (err) {
        console.error('[RegistrationService] Supabase exception:', err);
        inMemoryRegistrations.set(record.id, record);
      }
    } else {
      inMemoryRegistrations.set(record.id, record);
    }

    return record;
  }

  /**
   * Mark registration as paid after signature or webhook verification
   */
  static async markAsPaid(razorpayOrderId: string, razorpayPaymentId: string): Promise<RegistrationRecord | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .update({
            status: 'PAID',
            razorpay_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', razorpayOrderId)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            registrationNumber: data.registration_number,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            age: data.age,
            categoryId: data.category_id,
            categoryName: data.category_name,
            tshirtSize: data.tshirt_size,
            emergencyContact: data.emergency_contact,
            status: data.status,
            amountINR: data.amount_paid,
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        console.error('[RegistrationService] Supabase update error:', err);
      }
    }

    // Fallback search in memory store
    for (const [id, reg] of inMemoryRegistrations.entries()) {
      if (reg.razorpayOrderId === razorpayOrderId) {
        reg.status = 'PAID';
        reg.razorpayPaymentId = razorpayPaymentId;
        inMemoryRegistrations.set(id, reg);
        return reg;
      }
    }

    return null;
  }

  /**
   * Find registration by ID or order ID
   */
  static async findByOrderId(razorpayOrderId: string): Promise<RegistrationRecord | null> {
    for (const reg of inMemoryRegistrations.values()) {
      if (reg.razorpayOrderId === razorpayOrderId) {
        return reg;
      }
    }
    return null;
  }
}
