import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "m.faizan11f@gmail.com",
    pass: "ipno yxzd htps olfu",
  },
});

const SendMail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"SafeJourney 👻" <m.faizan11f@gmail.com>', // sender address
      to: "faizan4601554@cloud.neduet.edu.pk", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  } catch (error) {
    console.log("Erro sending mail", error);
  }
};

// SendMail();
