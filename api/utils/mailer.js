const nodemailer = require("nodemailer");

const sendMail = async (to, subject, htmlContent, textContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "aroosiapp.com",
      port: 465,           
      secure: true,
      auth: {
        user: "no-reply@aroosiapp.com", 
        pass: process.env.MAIL_PASS       
      }
    });

    const info = await transporter.sendMail({
      from: '"AroosiApp" <no-reply@aroosiapp.com>',
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Mailer error:", error);
    return false;
  }
};

module.exports = sendMail;
