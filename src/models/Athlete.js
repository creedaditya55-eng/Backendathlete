const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const athleteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  achievements: {
    type: String,
    default: '',
  },
  contact: {
    type: String,
    default: '',
  },
  profilePhoto: {
    type: String,
    default: '', // URL from Cloudinary
  },
  athleteID: {
    type: String,
    unique: true,
    immutable: true,
    default: () => 'ATH-' + Math.floor(100000 + Math.random() * 900000), // Random 6 digit number
  },
  videos: [
    {
      url: String,
      platform: {
        type: String,
        enum: ['youtube', 'google_drive'],
      },
      title: String,
    },
  ],
}, {
  timestamps: true,
});

// Hash password before saving
athleteSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
athleteSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Athlete = mongoose.model('Athlete', athleteSchema);

module.exports = Athlete;
