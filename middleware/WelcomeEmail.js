import { transporter } from "./EmailConfig.js";

export const WelcomeEmail = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: '"SafeJourney 👻" <m.faizan11f@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Welcome!!!", // Subject line
      text: "Welcome", // plain text body
      html: "<b>Welcome!!!</b>", // html body
    });
  } catch (error) {
    console.log("Error sending mail", error);
  }
};
