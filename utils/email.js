import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmailWhenSignUp = async (recipient, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: `Welcome to Agri ${username}`,
    html: `  
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 10px 0; background-color: #f9f9f9; border-radius: 10px;">
          <h1 style="color: #4CAF50; font-size: 24px;">Welcome, ${username}!</h1>
          <p style="font-size: 18px; color: #555;">Thank you for Sign Up in to our service.</p>
          <p style="font-size: 16px; margin: 20px 0;">We are excited to have you on board. If you have any questions, feel free to reach out to us.</p>
          <a href="http://localhost:3000" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-top: 20px;">Go to Your Dashboard</a>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you did not create this account, please contact our support team immediately.</p>
          <p style="font-size: 14px; margin-top: 10px;">Best Regards,</p>
          <p style="font-size: 14px; color: #4CAF50; font-weight: bold;">The Agri Team</p>
        </div>
      </div>
      `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error Sending email: ", error);
    throw error;
  }
};

export const sendEmailWhenLogin = async (recipient, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: `Welcome to Agri ${username}`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 10px 0; background-color: #f9f9f9; border-radius: 10px;">
          <h1 style="color: #4CAF50; font-size: 24px;">Welcome, ${username}!</h1>
          <p style="font-size: 18px; color: #555;">Thank you for Sign In in to our service.</p>
          <p style="font-size: 16px; margin: 20px 0;">We are excited to have you on board. If you have any questions, feel free to reach out to us.</p>
          <a href="http://localhost:3000" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-top: 20px;">Go to Your Dashboard</a>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you did not create this account, please contact our support team immediately.</p>
          <p style="font-size: 14px; margin-top: 10px;">Best Regards,</p>
          <p style="font-size: 14px; color: #4CAF50; font-weight: bold;">The Agri Team</p>
        </div>
      </div>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch {
    console.error("Error sendng email: ", error);
    throw error;
  }
};

export const sendEmailWhenPasswordReset = async (recipient, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: `Password Reset Successfully for Agri ${username}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 10px 0; background-color: #f9f9f9; border-radius: 10px;">
          <h1 style="color: #4CAF50; font-size: 24px;">Hi, ${username}!</h1>
          <p style="font-size: 18px; color: #555;">Your password has been successfully reset.</p>
          <p style="font-size: 16px; margin: 20px 0;">You can now log in with your new password. If you did not request this change, please contact our support team immediately.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-top: 20px;">Log in to Your Account</a>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you did not request this password reset, please contact our support team immediately.</p>
          <p style="font-size: 14px; margin-top: 10px;">Best Regards,</p>
          <p style="font-size: 14px; color: #4CAF50; font-weight: bold;">The Agri Team</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch {
    console.error("Error sending email: ", error);
    throw error;
  }
};
