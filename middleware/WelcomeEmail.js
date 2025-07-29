import { transporter } from "./EmailConfig.js";
import { Welcome_Email_Template } from "./EmailTemplate.js";

export const WelcomeEmail = async (email, name) => {
  try {
    const info = await transporter.sendMail({
      from: '"SafeJourney 👻" <m.faizan11f@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Welcome!!!", // Subject line
      text: "Welcome", // plain text body
      html: Welcome_Email_Template.replace("{name}", name), // html body
    });
  } catch (error) {
    console.log("Error sending mail", error);
  }
};
