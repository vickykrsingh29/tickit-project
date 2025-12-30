import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middlewares/logger';
import sequelize from "./config/database";
import productRoutes from "./routes/productRoutes";
import customerRoutes from "./routes/customerRoutes";
import { checkJwt } from './middlewares/auth';
import quoteRoutes from './routes/quoteRoutes';
import userRoutes from './routes/userRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import pocRoutes from "./routes/pocRoutes"
import orderRoutes from "./routes/orderRoutes"
import licenseRoutes from "./routes/licenseRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/poc",pocRoutes);
app.use("/api/licenses", licenseRoutes);

app.get("/api/protected", checkJwt, (req, res) => {
    res.send({ message: 'You accessed a protected route!' });
});

// Ping endpoint to keep server awake
app.get("/api/ping", (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected!");
    // Only sync in development, and without alter to prevent constant schema changes
    if (process.env.NODE_ENV === 'development') {
      return sequelize.sync(); // Use sync() without alter, or remove entirely if tables exist
    }
  })
  .then(() => console.log("Database ready!"))
  .catch((err) => console.error("Database connection error:", err));

export default app;
