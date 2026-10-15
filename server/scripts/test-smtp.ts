import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testSMTP() {
  console.log('\n📧 Testing SMTP Configuration for Udupipages Beach Run 2026...\n');

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user || 'noreply@udupipagesbeachrun.com';

  console.log(`  Host:      ${host || '❌ MISSING'}`);
  console.log(`  Port:      ${port}`);
  console.log(`  User:      ${user ? (user.includes('your-email') ? '⚠️ Placeholder' : user) : '❌ MISSING'}`);
  console.log(`  Pass:      ${pass ? (pass.includes('your-16-char') ? '⚠️ Placeholder' : '******** (' + pass.length + ' chars)') : '❌ MISSING'}`);
  console.log(`  From:      ${from}\n`);

  if (!host || !user || !pass || user.includes('your-email') || pass.includes('your-16-char')) {
    console.error('❌ SMTP credentials not configured yet.');
    console.error('👉 Please update SMTP_USER and SMTP_PASS in server/.env with your real credentials.\n');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  try {
    console.log('🔄 Verifying SMTP connection and authentication...');
    await transporter.verify();
    console.log('✅ SMTP Connection & Authentication Successful!\n');

    const recipient = process.argv[2] || user;
    console.log(`🔄 Sending test email to: ${recipient}...`);

    const info = await transporter.sendMail({
      from: `"Udupipages Beach Run 2026" <${from}>`,
      to: recipient,
      subject: '🏃 SMTP Test Email — Udupipages Beach Run 2026',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A0A0A; color: #F5F3EE; border-radius: 8px;">
          <h2 style="color: #FF7A30; margin-top: 0;">🎉 SMTP Email Working!</h2>
          <p>This is a test email from your <strong>Udupipages Beach Run 2026</strong> backend server.</p>
          <div style="background-color: #1a1a1a; padding: 15px; border-left: 4px solid #FF7A30; margin: 20px 0;">
            <p style="margin: 0;"><strong>Status:</strong> Connected & Verified</p>
            <p style="margin: 5px 0 0 0;"><strong>Host:</strong> ${host}:${port}</p>
            <p style="margin: 5px 0 0 0;"><strong>Sender:</strong> ${from}</p>
          </div>
          <p style="color: #888; font-size: 12px;">When runners complete registration, their QR code ticket and Bib number will be automatically sent from this email.</p>
        </div>
      `
    });

    console.log(`✅ Test email delivered successfully! Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox at: ${recipient}\n`);
  } catch (err: any) {
    console.error('\n❌ SMTP Verification / Send Failed:');
    console.error(`  Error Code:    ${err.code || 'N/A'}`);
    console.error(`  Error Message: ${err.message}\n`);

    if (err.code === 'EAUTH') {
      console.log('💡 Tip: Authentication failed. If using Gmail:');
      console.log('   1. Ensure 2-Step Verification is enabled on your Google account.');
      console.log('   2. Generate a 16-character App Password at: https://myaccount.google.com/apppasswords');
      console.log('   3. Put that 16-character password in SMTP_PASS (without spaces).\n');
    }
    process.exit(1);
  }
}

testSMTP().catch(console.error);
