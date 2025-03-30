import { StreamClient, UserRequest } from "@stream-io/node-sdk";
import { NextApiRequest, NextApiResponse } from "next";

// Get environment variables
const apikey = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_SECRET;

// Check if API keys are available
if (!apikey || !secret) {
  throw new Error("Missing GetStream API Keys");
}

// Initialize Stream client
const client = new StreamClient(apikey, secret);

// API handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Parse request body
    const { userId, name, image = null, email, role } = req.body;

    // Validate required fields
    if (!userId || !name || !email ||!role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Define new user details
    const newUser: UserRequest = {
      id: userId,
      role,
      name,
      ...(image && { image }), // Add image if provided
      custom: { email },
    };

    // Add user to GetStream
    await client.upsertUsers([newUser]);

    // Generate user token (valid for 1 hour)
    const validity = 60 * 60;
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    });

    console.log(`✅ User ${userId} created with token: ${token}`);

    // Return success response
    return res.status(200).json({ token });
  } catch (error) {
    console.error("❌ API Error:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
}
