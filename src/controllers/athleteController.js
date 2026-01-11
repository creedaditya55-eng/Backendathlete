const Athlete = require('../models/Athlete');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

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

// @desc    Get all athletes (with search filters)
// @route   GET /api/athletes
// @access  Public
const getAthletes = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          name: {
            $regex: req.query.search,
            $options: 'i',
          },
        }
      : {};

    const sportFilter = req.query.sport
      ? {
          sport: {
            $regex: req.query.sport,
            $options: 'i',
          },
        }
      : {};

    const positionFilter = req.query.position
      ? {
          position: {
            $regex: req.query.position,
            $options: 'i',
          },
        }
      : {};

    const athletes = await Athlete.find({ ...keyword, ...sportFilter, ...positionFilter }).select('-password');
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get athlete by ID
// @route   GET /api/athletes/:id
// @access  Public
const getAthleteById = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id).select('-password');
    if (athlete) {
      res.json(athlete);
    } else {
      res.status(404).json({ message: 'Athlete not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current athlete profile
// @route   GET /api/athletes/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.athlete._id).select('-password');
    if (athlete) {
      res.json(athlete);
    } else {
      res.status(404).json({ message: 'Athlete not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update athlete profile
// @route   PUT /api/athletes/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.athlete._id);

    if (athlete) {
      athlete.name = req.body.name || athlete.name;
      athlete.email = req.body.email || athlete.email;
      athlete.age = req.body.age || athlete.age;
      athlete.sport = req.body.sport || athlete.sport;
      athlete.position = req.body.position || athlete.position;
      athlete.location = req.body.location || athlete.location;
      athlete.achievements = req.body.achievements || athlete.achievements;
      athlete.contact = req.body.contact || athlete.contact;

      if (req.body.password) {
        athlete.password = req.body.password;
      }

      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        athlete.profilePhoto = result.secure_url;
      }

      const updatedAthlete = await athlete.save();

      res.json({
        _id: updatedAthlete._id,
        name: updatedAthlete.name,
        email: updatedAthlete.email,
        athleteID: updatedAthlete.athleteID,
        age: updatedAthlete.age,
        sport: updatedAthlete.sport,
        position: updatedAthlete.position,
        location: updatedAthlete.location,
        achievements: updatedAthlete.achievements,
        contact: updatedAthlete.contact,
        profilePhoto: updatedAthlete.profilePhoto,
        videos: updatedAthlete.videos,
        token: req.headers.authorization.split(' ')[1], // Return same token
      });
    } else {
      res.status(404).json({ message: 'Athlete not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add video
// @route   POST /api/athletes/video
// @access  Private
const addVideo = async (req, res) => {
  try {
    const { url, platform, title } = req.body;
    
    if (!req.athlete) {
        return res.status(401).json({ message: 'User not found' });
    }

    const athlete = await Athlete.findById(req.athlete._id);

    if (athlete) {
      const newVideo = { url, platform, title };
      athlete.videos.push(newVideo);
      await athlete.save();
      res.status(201).json(athlete.videos);
    } else {
      res.status(404).json({ message: 'Athlete not found' });
    }
  } catch (error) {
    console.error('Add Video Error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Remove video
// @route   DELETE /api/athletes/video/:videoId
// @access  Private
const removeVideo = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.athlete._id);

    if (athlete) {
      athlete.videos = athlete.videos.filter(
        (video) => video._id.toString() !== req.params.videoId
      );
      await athlete.save();
      res.json(athlete.videos);
    } else {
      res.status(404).json({ message: 'Athlete not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get platform stats
// @route   GET /api/athletes/stats/public
// @access  Public
const getStats = async (req, res) => {
  try {
    const athleteCount = await Athlete.countDocuments({});
    
    // Aggregate to count total videos across all athletes
    const videoStats = await Athlete.aggregate([
      { $project: { videoCount: { $size: "$videos" } } },
      { $group: { _id: null, totalVideos: { $sum: "$videoCount" } } }
    ]);
    
    const totalVideos = videoStats.length > 0 ? videoStats[0].totalVideos : 0;

    res.json({
      athletes: athleteCount,
      videos: totalVideos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAthletes,
  getAthleteById,
  getMyProfile,
  updateProfile,
  addVideo,
  removeVideo,
  getStats,
};
