const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // NEW FIXES HERE
      family: 4,              // Force IPv4 (Fixes network hangs)
      connectionTimeout: 10000, // Wait 10 seconds before failing
      greetingTimeout: 5000,    // Wait 5 seconds for Hello
    });

    const info = await transporter.sendMail({
      from: `"FluxaLab Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html, 
    });

    console.log('✅ Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Email could not be sent:', error);
    throw new Error('Email sending failed'); 
  }
};

module.exports = sendEmail;