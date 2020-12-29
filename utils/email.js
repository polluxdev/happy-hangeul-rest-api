const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "af594c77ee4cb2",
      pass: "fc111959726b74",
    },
  });

  const mailOptions = {
    from: "Happy Hangeul <happy.hangeul@localhost",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
