require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { client } = require("./db");
const handleNotFound = require("./utilities/Errors/NotFoundError");
const handleEveryError = require("./utilities/Errors/ErrorHandler");
const { crossOriginResourceSharing, corsOptions } = require("./utilities/Cors");

// routes
const userRoutes = require("./routes/auth/AuthRoutes");
const appRoutes = require("./routes/appRoutes/appRoutes");
const listRoutes = require("./routes/ListRoutes");

const PORT = process.env.PORT || 3002;
const app = express();

// files
app.use("/profile", express.static("uploads/profile"));

// Middleware
// app.use(morgan("dev")); // Logs routes in console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(crossOriginResourceSharing);
app.use(cors(corsOptions));

app.use((req, res, next) => {
  const start = Date.now();

  // Continue processing the request
  next();

  const end = Date.now();
  const responseTime = end - start;

  console.log(
    `Response time for ${req.method} ${req.originalUrl}: ${responseTime}ms`
  );
});

// Routes
app.use("/api", userRoutes);
app.use("/api", appRoutes);
app.use("/api", listRoutes);

app.get("/", (req, res) => {
  res.json({ message: "done" });
});

// Error Handling
app.use(handleNotFound);
app.use(handleEveryError);

// Start the server and connect to MongoDB
async function startServer() {
  try {
    await client.connect();

    app.listen(PORT, () => {
      console.log(`Server port - ${PORT} and MongoDB Connected`);
    });

    process.on("SIGINT", async () => {
      console.log("Closing MongoDB connection...");
      await client.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
