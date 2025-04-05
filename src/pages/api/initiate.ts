import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || "https://your-callback-url.com";

type PaystackInitResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    amount,
    email,
    name,
    phoneNumber,
    fund,
    referenceNumber,
    channels,
    metadata = {}
  } = req.body;

  if (!amount || !email) {
    return res.status(400).json({ error: "Amount and email are required" });
  }

  const formattedAmount = Math.round(parseFloat(amount) * 100);

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: formattedAmount,
        currency: "GHS",
        reference: referenceNumber || `REF-${Date.now()}`,
        callback_url: PAYSTACK_CALLBACK_URL,
        channels: channels || ["card", "mobile_money"],
        metadata: {
          full_name: name || "",
          phone_number: phoneNumber || "",
          fund: fund || "",
          ...metadata,
          custom_fields: metadata.custom_fields || [],
        },
      }),
    });

    const data = (await response.json()) as PaystackInitResponse;

    if (!response.ok || !data.status || !data.data) {
      console.error("Paystack init failed:", data);
      return res.status(400).json({
        success: false,
        error: data.message || "Failed to initialize transaction",
      });
    }

    return res.status(200).json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });

  } catch (error) {
    console.error("Payment initialization error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error initializing payment",
    });
  }
}
