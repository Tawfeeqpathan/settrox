const express = require("express");
const bodyParser = require("body-parser");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 3000;
const path = require("path"); // For serving static files
const initDb = require("./utils/InitDB");
const userRoutes = require("./routes/user-routes");
const productsRoutes = require("./routes/products-routes");
const couponRoutes = require("./routes/coupon-routes");
const cartRoutes = require("./routes/cart-routes");
const orderRoutes = require("./routes/order-routes");
const adminRoutes = require("./routes/admin-routes");
const uploadRoutes = require("./routes/upload-routes");
const paymentRoutes = require("./routes/payment-routes");
const wishlistRoutes = require("./routes/wishlist-routes");
const faqRoutes = require("./routes/faq-routes");
const brandRoutes = require("./routes/brand-routes");
const specificationsRoutes = require("./routes/specifications-routes");
const adminAPIRoutes= require('./routes/adminRoutes');
const categoryRoutes = require("./routes/category-routes");
const customerRoutes = require("./routes/customer-routes");

const corsOptions = {
    origin: "https://react.server55.net", // Replace with your domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies if needed
};
app.use(cors());
app.use("/", adminRoutes);
// Set the views directory
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(
  session({
    secret: process.env.JWT_SECRET, // Change this key to a more secure one
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Your MongoDB connection URL
      collectionName: "sessions",
    }),
    cookie: { secure: false }, // Set to true in production when using HTTPS
  })
);
app.use(bodyParser.json());

// Routes

app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/faq", faqRoutes);
app.use('/api/admin',adminAPIRoutes);
app.use("/api/category/", categoryRoutes);
app.use("/api/customer/",customerRoutes)
app.use("/api/brand", brandRoutes);
app.use("/api/specification", specificationsRoutes);

// Add a root route for rendering a view
app.get("/", (req, res) => {
  res.render("layout", { page: "Admin Dashboard", content: "dashboard" });
});

// Add a dashboard route
// app.get('/dashboard', (req, res) => {
//   res.render('dashboard', { page: 'Dashboard', user: req.session.user || 'Guest' });
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
