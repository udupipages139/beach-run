import { Request, Response } from 'express';
import { CATEGORIES } from '../config/categories.js';
import { razorpayInstance, getRazorpayKeyId } from '../config/razorpay.js';
import { RegistrationService } from '../services/registrationService.js';

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, age, categoryId, tshirtSize, emergencyContact, previousExperience } = req.body;

    if (!fullName || !email || !phone || !age || !categoryId || !tshirtSize || !emergencyContact) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const category = CATEGORIES[categoryId];
    if (!category) {
      return res.status(400).json({ error: `Invalid category: ${categoryId}` });
    }

    // Handle Free Category (3K Fun Run)
    if (category.isFree || category.priceINR === 0) {
      const freeRegistration = await RegistrationService.createRegistration({
        fullName,
        email,
        phone,
        age: Number(age),
        categoryId,
        categoryName: category.name,
        tshirtSize,
        emergencyContact,
        previousExperience,
        amountINR: 0,
        isFree: true
      });

      return res.status(200).json({
        success: true,
        isFree: true,
        registrationNumber: freeRegistration.registrationNumber,
        message: 'Free registration successful!'
      });
    }

    // Handle Paid Category (5K, 10K, 15K)
    const amountInPaise = Math.round(category.priceINR * 100);
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}`;
    const currentKeyId = getRazorpayKeyId();
    const isPlaceholderKey = !currentKeyId || currentKeyId.includes('YourTestKeyIdHere') || currentKeyId.includes('placeholder');

    let razorpayOrderId: string;
    let isMock = false;

    if (!isPlaceholderKey) {
      try {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            category_id: categoryId,
            runner_name: fullName,
            runner_email: email
          }
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr: any) {
        console.warn('[OrderController] Razorpay API call failed, falling back to development order mode:', rzpErr.message || rzpErr);
        razorpayOrderId = `order_mock_${Date.now()}`;
        isMock = true;
      }
    } else {
      console.log('[OrderController] RAZORPAY_KEY_ID is placeholder. Running in test/mock order mode.');
      razorpayOrderId = `order_mock_${Date.now()}`;
      isMock = true;
    }

    // Save pending registration in database
    const pendingRegistration = await RegistrationService.createRegistration({
      fullName,
      email,
      phone,
      age: Number(age),
      categoryId,
      categoryName: category.name,
      tshirtSize,
      emergencyContact,
      amountINR: category.priceINR,
      isFree: false,
      razorpayOrderId
    });

    return res.status(200).json({
      success: true,
      isFree: false,
      isMock,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: isMock ? 'rzp_test_mock' : currentKeyId,
      registrationId: pendingRegistration.id,
      registrationNumber: pendingRegistration.registrationNumber
    });
  } catch (error: any) {
    console.error('[OrderController] Error creating order:', error);
    return res.status(500).json({
      error: 'Failed to create registration order',
      details: error.message || 'Internal server error'
    });
  }
};
