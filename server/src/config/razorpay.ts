import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret
});

export const getRazorpayKeyId = () => key_id;
export const getRazorpayKeySecret = () => key_secret;
export const getWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_placeholder';
