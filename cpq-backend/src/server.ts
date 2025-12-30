import app from "./app";
import dotenv from "dotenv";
import cron from "node-cron";
import fetch from "node-fetch";

dotenv.config();

const PORT = process.env.PORT || 8080;

// Define a root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Cron job to ping server every 12 minutes to prevent sleep on Render
  cron.schedule('*/1 * * * *', async () => {
    try {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
      const response = await fetch(`${backendUrl}/api/ping`);
      const data: any = await response.json();
      console.log(`[Cron] Keep-alive ping successful at ${data.timestamp}`);
    } catch (error) {
      console.error('[Cron] Keep-alive ping failed:', error);
    }
  });
  
  console.log('[Cron] Keep-alive job scheduled (every 12 minutes)');
});
