const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Explicitly use Gmail host
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Fluxalab" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html, 
    });

    console.log('✅ Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Email could not be sent:', error);
    // We throw the error so the Controller knows to delete the user
    throw new Error('Email sending failed'); 
  }
};

module.exports = sendEmail;