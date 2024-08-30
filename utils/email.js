const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return new Promise((resolve, reject) => {
    transport.sendMail(
      {
        from: 'Rafaqat Mahmood <hello@rafaqat.dev>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
      },
      (err, info) => {
        if (err) {
          return reject();
        }
        resolve(info);
      },
    );
  });
};

module.exports = sendEmail;
