import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/khalti/initiate", async (req, res) => {
  try {
    const { amount, purchaseOrderId, purchaseOrderName } = req.body;

    // VALIDATION: Ensure amount is valid before sending
    if (!amount || !purchaseOrderId || !purchaseOrderName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        // ASSUMPTION: 'amount' coming from frontend is in Rupees. 
        // If it's already in Paisa, remove the '* 100'.
        amount: amount * 100, 
        purchase_order_id: purchaseOrderId,
        purchase_order_name: purchaseOrderName,
        return_url: "https://example.com/return", 
        website_url: "https://example.com"
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ pidx: response.data.pidx, url: response.data.payment_url });

  } catch (error) {
    // Log the actual error from Khalti for debugging
    console.error("Khalti Error:", error.response?.data || error.message);
    
    res.status(500).json({
      error: error.response?.data || "Payment initiation failed"
    });
  }
});

app.get("/", (req, res) => {
    res.send("Khalti Payment Backend is running! Make a POST request to /khalti/initiate");
});
app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
});