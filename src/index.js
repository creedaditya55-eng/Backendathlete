const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const connectCloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/authRoutes');
const athleteRoutes = require('./routes/athleteRoutes');
const path = require("path");


dotenv.config();

connectDB();
connectCloudinary();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/athletes', athleteRoutes);

// Serve static build from the top-level `client/dist` directory
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("Mongo URI:", process.env.MONGO_URI);
