import { supabase } from '../config/supabase.js';
import { randomUUID } from 'crypto';

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
    const id = randomUUID();
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
          category: record.categoryName,
          tshirt_size: record.tshirtSize,
          emergency_contact: record.emergencyContact,
          previous_experience: record.previousExperience,
          experience: record.previousExperience || '',
          status: record.status,
          amount_paid: record.amountINR,
          razorpay_order_id: record.razorpayOrderId,
          order_id: record.razorpayOrderId,
          email_sent: false,
          created_at: record.createdAt
        });

        if (error) {
          console.error('[RegistrationService] Supabase insert error, storing in local memory:', error.message || error);
          inMemoryRegistrations.set(record.id, record);
        } else {
          console.log(`[RegistrationService] Successfully saved registration ${record.registrationNumber} to Supabase.`);
        }
      } catch (err: any) {
        console.error('[RegistrationService] Supabase exception, storing in local memory:', err.message || err);
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
            payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', razorpayOrderId)
          .select()
          .single();

        if (!error && data) {
          console.log(`[RegistrationService] Marked registration ${data.registration_number} as PAID in Supabase.`);
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
            previousExperience: data.previous_experience,
            status: data.status,
            amountINR: Number(data.amount_paid || 0),
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            createdAt: data.created_at
          };
        } else if (error) {
          console.warn('[RegistrationService] Supabase update error:', error.message || error);
        }
      } catch (err: any) {
        console.error('[RegistrationService] Supabase update exception:', err.message || err);
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
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('razorpay_order_id', razorpayOrderId)
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
            previousExperience: data.previous_experience,
            status: data.status,
            amountINR: Number(data.amount_paid || 0),
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        // Ignore fallback
      }
    }

    for (const reg of inMemoryRegistrations.values()) {
      if (reg.razorpayOrderId === razorpayOrderId) {
        return reg;
      }
    }
    return null;
  }

  /**
   * Retrieve all registrations for Admin Dashboard
   */
  static async getAllRegistrations(): Promise<{
    source: 'supabase' | 'in_memory';
    registrations: RegistrationRecord[];
  }> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const registrations: RegistrationRecord[] = data.map((d: any) => ({
            id: d.id,
            registrationNumber: d.registration_number || d.id,
            fullName: d.full_name || 'Anonymous Runner',
            email: d.email || 'N/A',
            phone: d.phone || 'N/A',
            age: Number(d.age || 0),
            categoryId: d.category_id || 'unknown',
            categoryName: d.category_name || 'General',
            tshirtSize: d.tshirt_size || 'M',
            emergencyContact: d.emergency_contact || 'N/A',
            previousExperience: d.previous_experience || '',
            status: (d.status as any) || 'PENDING',
            amountINR: Number(d.amount_paid || 0),
            razorpayOrderId: d.razorpay_order_id,
            razorpayPaymentId: d.razorpay_payment_id,
            createdAt: d.created_at || new Date().toISOString()
          }));

          return { source: 'supabase', registrations };
        } else {
          console.warn('[RegistrationService] Supabase getAllRegistrations returned error:', error.message || error);
        }
      } catch (err: any) {
        console.error('[RegistrationService] Supabase exception during getAllRegistrations:', err.message || err);
      }
    }

    const memoryRecords = Array.from(inMemoryRegistrations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { source: 'in_memory', registrations: memoryRecords };
  }
}

