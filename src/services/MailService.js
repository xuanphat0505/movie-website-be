import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Gửi email thông qua dịch vụ Brevo HTTP API V3 (Transactional Emails)
export const sendMail = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not defined in environment variables");
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Stream-Lab Admin System",
          email: senderEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error sending email via Brevo:",
      error.response?.data || error.message
    );
    throw error;
  }
};
