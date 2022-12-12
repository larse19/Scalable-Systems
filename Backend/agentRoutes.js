// // agentRoutes.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const Routes = require("./routes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.use("/api/agent", Routes);

app.listen(PORT, () => console.log(`🔥  server running on port ${PORT}`));

module.exports = app;
