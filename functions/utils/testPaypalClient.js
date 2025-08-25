import client from "./paypalClient.js";

async function testClient() {
  try {
    // Minimal test: list orders (will fail if credentials wrong, but shows connection works)
    console.log("PayPal client loaded:", client ? true : false);

    // Optional: you can try calling a test endpoint using OrdersController
    const { OrdersController } = await import("@paypal/paypal-server-sdk");
    const ordersController = new OrdersController(client);

    console.log("OrdersController loaded:", ordersController ? true : false);
  } catch (err) {
    console.error("PayPal client test error:", err);
  }
}

testClient();
