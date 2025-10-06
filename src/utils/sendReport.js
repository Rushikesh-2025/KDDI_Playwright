import nodemailer from "nodemailer";
import fs from "fs";

// Configure SMTP (use your company mail or Gmail with app-password)
const transporter = nodemailer.createTransport({
  service: "gmail", // or "outlook", "yahoo", or custom SMTP
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password", // ⚠️ not your Gmail password, use App password
  },
});

async function sendReport() {
  const mailOptions = {
    from: '"Playwright Automation" <your-email@gmail.com>',
    to: "receiver1@example.com, receiver2@example.com",
    subject: "Playwright Test Report - Allure",
    text: "Hello Team,\n\nPlease find the attached Allure Test Report.\n\nRegards,\nAutomation Bot",
    attachments: [
      {
        filename: "allure-report.zip",
        content: fs.createReadStream("./allure-report.zip"),
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Report sent: " + info.response);
  } catch (err) {
    console.error("❌ Failed to send report:", err);
  }
}

sendReport();
