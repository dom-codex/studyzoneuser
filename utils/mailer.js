const mailer = require("nodemailer");
exports.sendResetToken = (email, token, pw,res) => {
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
      Your reset token is
      <p>${token}</p>
      </body>
      </html>

    `,
  };
  const cb = async(err) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: "an error occurred",
      });
    }
    await pw.save()
    res.status(200).json({
      code: 200,
      message: "check your email for reset token",
    });
  };
  MailMessenger(mailOptions, cb);
};
exports.sendActivationaCode = async (email, code, data, res, user) => {
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
  const callback = async (e) => {
    if (e) {
      console.log(e);
      await user.destroy();
      return res.status(401).json({
        code: 401,
        message: "an error occurred",
      });
    }
    return res.status(200).json({
      code: 200,
      message: "created",
      user: data,
    });
  };
  MailMessenger(mailOptions, callback);
};
exports.NotifyUserOfBlockStatus = async (cb) => {
  try {
    const mailOptions = {
      from: "studyzone Admin",
      to: "sumomessenger.beta@gmail.com",
      subject: "Block Notice",
      html: `
     <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <p>Due to some malicious activities detected, your account has been temporarily suspended, a<href="">contact support</a> for more details </p>
      </body>
      </html>
    <
    `,
    };
    MailMessenger(mailOptions, (e) => cb());
  } catch (e) {
    console.log(e);
  }
};
exports.sendEmailToAdmin = async (
  { name, email, phone, subject, description, user },
  res
) => {
  try {
    const mailOptions = {
      from: "studyzone Admin",
      to: "sumomessenger.beta@gmail.com",
      subject: "Support",
      html: `
     <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <p>Sender:${name}</p>
      <p>Email:${email}</p>
      <p>Phone:${phone}</p>
      <p>Subject:${subject}</p>
      <p>UserId:${user}</p>
      <p>PROBLEM DESCRIPTION</p>
      <p>${description}</p>
      </body>
      </html>
    <
    `,
    };
    const callback = (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          code: 500,
          message: "an error occurred",
        });
      }
      res.status(200).json({
        code: 200,
        message: "sent",
      });
    };
    MailMessenger(mailOptions, callback);
  } catch (e) {
    console.log(e);
  }
};
const MailMessenger = (mailOptions, cb) => {
  const transporter = mailer.createTransport({
    service: "gmail",
    secureConnection: false,
    requiresAuth: true,
    auth: {
      user: "sumomessenger.beta@gmail.com",
      pass: "xbcfbsmwhdhcyniq",
    },
  });
  transporter.sendMail(mailOptions, (err, info) => {
    cb(err);
  });
};
