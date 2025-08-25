import fetch from "node-fetch";

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

export default function client() {
  return {
    /**
     * Execute a PayPal request
     * @param {Object} request - { endpoint, requestBody, method }
     */
    execute: async ({ endpoint, requestBody = {}, method = "POST" }) => {
      try {
        console.log("Fetching PayPal access token...");
        // Get access token
        const authRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(
                `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
              ).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });
        const tokenData = await authRes.json();
        console.log("PayPal token response:", tokenData);

        // Call PayPal endpoint
        const url = endpoint.startsWith("http")
          ? endpoint
          : `${PAYPAL_BASE}${endpoint}`;
        console.log("Calling PayPal endpoint:", url);

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.access_token}`,
          },
          body: method === "POST" ? JSON.stringify(requestBody) : undefined,
        });

        const result = await res.json();
        console.log("PayPal response:", result);
        return { result };
      } catch (err) {
        console.error("PayPal client error:", err);
        throw err;
      }
    },
  };
}
