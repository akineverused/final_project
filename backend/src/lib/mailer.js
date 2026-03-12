import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async (email, token) => {
    const link = `${process.env.BACKEND_URL}/auth/verify/${token}`;

    await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Verify your email",
        html: `
      <h3>Email verification</h3>
      <p>Click link to verify your account:</p>
      <a href="${link}">${link}</a>
    `
    });
    console.log("link: " + link);
};