import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import apiV1Routes from "./routes/index.js";
import dealNotesRoutes from "./routes/dealNotes.routes.js";
import dealTasksRoutes from "./routes/dealTasks.routes.js";


const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman or server-to-server calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // VERY IMPORTANT for cookies
  })
);


app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/", apiLimiter);
app.use("/api/v1", dealTasksRoutes);


// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "crm-backend" });
});

// Auth Routes 
app.use("/api/v1", apiV1Routes);
app.use("/api/v1/", dealNotesRoutes);
// 404 handler

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", code: "ROUTE_NOT_FOUND" });
});

app.use(errorHandler);



// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.statusCode || 500).json({
//     message: err.message || "Internal Server Error",
//   });
// });

export default app;
