const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,              // 👈 Stick to 465 (SSL) for Cloud Servers
      secure: true,           // 👈 Must be true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // 🛠️ NETWORK FIXES FOR RENDER
      family: 4,              // Force IPv4 (Crucial for Gmail timeouts)
      connectionTimeout: 10000, 
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    // We removed 'await transporter.verify()' to make it faster
    
    const info = await transporter.sendMail({
      from: `"FluxaLab Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return null;
  }
};

module.exports = sendEmail;