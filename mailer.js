require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // your Gmail
    pass: process.env.EMAIL_PASS      // your App Password
  }
});

const sendNotificationEmail = (to, subject, htmlMessage) => {
  const mailOptions = {
    from: '"Smart City Portal" <no-reply@smartcity.com>',
    to,
    subject,
    html: htmlMessage
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendNotificationEmail };
