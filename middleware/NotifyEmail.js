import { transporter } from "./EmailConfig.js";

export const NotifyEmail = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: '"SafeJourney 👻" <m.faizan11f@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Your ward is travelling with a companion using SafeJourney.", // Subject line
      text: "Kindly Contact your ward and take regular update.", // plain text body
      html: "<b>Kindly Contact your ward and take regular update.</b>", // html body
    });
    return info;
  } catch (error) {
    console.log("Error sending mail", error);
  }
};
