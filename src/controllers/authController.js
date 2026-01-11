const Athlete = require('../models/Athlete');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'athlete-hub' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// @desc    Register a new athlete
// @route   POST /api/auth/register
// @access  Public
const registerAthlete = async (req, res) => {
  try {
    const { name, email, password, age, sport, position, location, achievements, contact } = req.body;

    const userExists = await Athlete.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let profilePhoto = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      profilePhoto = result.secure_url;
    }

    const athlete = await Athlete.create({
      name,
      email,
      password,
      age,
      sport,
      position,
      location,
      achievements,
      contact,
      profilePhoto,
    });

    if (athlete) {
      res.status(201).json({
        _id: athlete._id,
        name: athlete.name,
        email: athlete.email,
        athleteID: athlete.athleteID,
        age: athlete.age,
        sport: athlete.sport,
        position: athlete.position,
        location: athlete.location,
        achievements: athlete.achievements,
        contact: athlete.contact,
        profilePhoto: athlete.profilePhoto,
        videos: athlete.videos,
        token: generateToken(athlete._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid athlete data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth athlete & get token
// @route   POST /api/auth/login
// @access  Public
const authAthlete = async (req, res) => {
  try {
    const { email, password } = req.body;

    const athlete = await Athlete.findOne({ email });

    if (athlete && (await athlete.matchPassword(password))) {
      res.json({
        _id: athlete._id,
        name: athlete.name,
        email: athlete.email,
        athleteID: athlete.athleteID,
        age: athlete.age,
        sport: athlete.sport,
        position: athlete.position,
        location: athlete.location,
        achievements: athlete.achievements,
        contact: athlete.contact,
        profilePhoto: athlete.profilePhoto,
        videos: athlete.videos,
        token: generateToken(athlete._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset password with AthleteID
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, athleteID, newPassword } = req.body;

    const athlete = await Athlete.findOne({ email });

    if (!athlete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (athlete.athleteID !== athleteID) {
      return res.status(401).json({ message: 'Invalid AthleteID' });
    }

    athlete.password = newPassword; // Will be hashed by pre-save hook
    await athlete.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error'});
  }
};

module.exports = {
  registerAthlete,
  authAthlete,
  resetPassword
};
