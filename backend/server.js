const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const socketHandler = require("./socket/socketHandler");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const queueRoutes = require("./routes/queueRoutes");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

socketHandler(io);

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/medqueue";

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", status: "OK" });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`✓ Server started successfully on port ${PORT}`);
      console.log(`API running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
