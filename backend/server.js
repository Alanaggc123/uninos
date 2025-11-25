const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const postsRoutes = require("./routes/posts");
const friendsRoutes = require("./routes/friends");
const notificationsRoutes = require("./routes/notifications");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/posts", postsRoutes);
app.use("/friends", friendsRoutes);
app.use("/notifications", notificationsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
