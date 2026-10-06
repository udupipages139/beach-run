import { Request, Response } from 'express';
import { CATEGORIES } from '../config/categories.js';
import { razorpayInstance, getRazorpayKeyId } from '../config/razorpay.js';
import { RegistrationService, finalizeTicket } from '../services/registrationService.js';

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const {
      fullName, email, phone, age, categoryId, tshirtSize,
      emergencyContactName, emergencyContactPhone, previousExperience,
      // legacy compat
      emergencyContact
    } = req.body;

    const emgName = emergencyContactName || (emergencyContact ? emergencyContact.split(' ').slice(0, -1).join(' ') || emergencyContact : '');
    const emgPhone = emergencyContactPhone || (emergencyContact ? emergencyContact.split(' ').pop() || '' : '');

    if (!fullName || !email || !phone || !age || !categoryId || !tshirtSize || (!emgName && !emergencyContact)) {
      return res.status(400).json({ success: false, error: 'Missing required registration fields' });
    }

    const category = CATEGORIES[categoryId];
    if (!category) {
      return res.status(400).json({ success: false, error: `Invalid category: ${categoryId}` });
    }

    // Age eligibility (server-side)
    const ageNum = Number(age);
    const ageChecks: Record<string, number> = { '5k': 12, '10k': 16, '15k': 18 };
    if (ageChecks[categoryId] && ageNum < ageChecks[categoryId]) {
      return res.status(400).json({
        success: false,
        error: `Age ${ageNum} is below the minimum ${ageChecks[categoryId]} for ${category.name}`
      });
    }

    // Create Razorpay order
    const amountInPaise = Math.round(category.priceINR * 100);
    const currentKeyId = getRazorpayKeyId();
    const isPlaceholderKey = !currentKeyId || currentKeyId.includes('YourTestKeyIdHere') || currentKeyId.includes('placeholder');

    let razorpayOrderId: string;
    let isMock = false;

    if (!isPlaceholderKey) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `reg_${Date.now().toString().slice(-8)}`,
          notes: { category_id: categoryId, runner_name: fullName, runner_email: email }
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr: any) {
        console.warn('[OrderController] Razorpay API error, falling back to mock:', rzpErr.message);
        razorpayOrderId = `order_mock_${Date.now()}`;
        isMock = true;
      }
    } else {
      razorpayOrderId = `order_mock_${Date.now()}`;
      isMock = true;
    }

    const pendingReg = await RegistrationService.createRegistration({
      fullName,
      email,
      phone,
      age: ageNum,
      categoryId,
      categoryName: category.name,
      tshirtSize,
      emergencyContactName: emgName || emergencyContact || '',
      emergencyContactPhone: emgPhone || '',
      experience: previousExperience,
      amountINR: category.priceINR,
      razorpayOrderId
    });

    return res.status(200).json({
      success: true,
      isMock,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: isMock ? 'rzp_test_mock' : currentKeyId,
      registrationId: pendingReg.id,
      registrationNumber: pendingReg.registrationNumber
    });
  } catch (error: any) {
    console.error('[OrderController] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create order', details: error.message });
  }
};
