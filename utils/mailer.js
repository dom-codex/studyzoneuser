const mailer = require("nodemailer");
exports.sendActivationaCode = async (email, code, finishSignUp) => {
  //create transporter
  const transporter = mailer.createTransport({
    service: "gmail",
    auth: {
      user: "sumomessenger.beta@gmail.com",
      pass: process.env.mailer,
    },
  });
  const mailOptions = {
    from: "studyzone Admin",
    to: email,
    subject: "Email Verification",
    html: `
     <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      Your activation code is
      <p>${code}</p>
      </body>
      </html>
    <
    `,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return res.status(300).json({
        code: 300,
        message: "an error occurred",
      });
    }
    finishSignUp();
  });
};
