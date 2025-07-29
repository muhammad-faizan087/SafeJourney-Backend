import { transporter } from "./EmailConfig.js";
import { Verification_Email_Template } from "./EmailTemplate.js";

export const VerificationEmail = async (email, verificationCode) => {
  try {
    const info = await transporter.sendMail({
      from: '"SafeJourney 👻" <m.faizan11f@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Verify your email ✔", // Subject line
      text: "Verify your email", // plain text body
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ), // html body
    });
  } catch (error) {
    console.log("Error sending mail", error);
  }
};
