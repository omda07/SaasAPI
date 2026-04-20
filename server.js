require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require("./config/logger");
const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

//* Initialize Express
const app = express();

//* Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/quranAudios/yasser', express.static(path.join(__dirname, 'quranAudios/yasser')));


//* initial start
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/quranAudios/yasser', express.static(__dirname + '/quranAudios/yasser'));

//* mongoose connection
mongoose.set('strictQuery', true);

const DB_URLS = [
  process.env.DATABASE_URL,
  // process.env.DATABASE_URL_FALLBACK1,
  // process.env.DATABASE_URL_FALLBACK2,
].filter(Boolean);

const connectDB = async () => {
  for (let i = 0; i < DB_URLS.length; i++) {
    const url = DB_URLS[i];
    try {
      console.log(`⏳ Trying DB connection ${i + 1}/${DB_URLS.length}...`);
      const conn = await mongoose.connect(url, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (URL ${i + 1})`);

      // Handle disconnection — try to reconnect with fallbacks
      mongoose.connection.on('disconnected', async () => {
        console.log('⚠️  MongoDB disconnected! Attempting reconnect...');
        await connectDB();
      });

      return;
    } catch (error) {
      console.log(`❌ DB URL ${i + 1} failed: ${error.message}`);
      if (i === DB_URLS.length - 1) {
        console.log('💀 All database connections failed. Exiting...');
        process.exit(1);
      }
      console.log(`🔄 Trying next URL...\n`);
    }
  }
};

//* compressed requests
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(cors());

//* Import Routes
const userRoutes = require("./routes/users");
const tenantRoutes = require("./routes/tenant_route");
const staffRoutes = require("./routes/staff_route");
const serviceRoutes = require("./routes/service_route");
const bookingRoutes = require("./routes/booking_route");
const availabilityRoutes = require("./routes/availablity_route");
// const notificationRoutes = require("./routes/notification_route");

//* API Routes
app.use("/api/user", userRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
// app.use("/api/notifications", notificationRoutes);

//* 404 handler
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "false",
    message: "Page not found !",
  });
});

//* start server
connectDB().then(() => {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 8080}`);
  });
});
