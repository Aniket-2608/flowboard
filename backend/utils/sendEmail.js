const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FlowBoard Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });

    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Email could not be sent:', error);
  }
};

module.exports = sendEmail;