const Gig = require('../models/Gig');


const getAllGigs = async (req, res, next) => {
  try {
    const { search } = req.query;

    // Build the query object
    let query = { status: 'Open' };

    // If a search term exists, add regex filter for the title
    if (search) {
      query.title = { $regex: search, $options: 'i' }; // 'i' = case insensitive
    }

   
    const gigs = await Gig.find(query)
      .sort({ createdAt: -1 })
      .populate('ownerId', 'username email');

    res.status(200).json(gigs);
  } catch (error) {
    next(error);
  }
};


const createGig = async (req, res, next) => {
  try {
    const { title, description, budget } = req.body;

    // Validation
    if (!title || !description || !budget) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id, 
    });

    res.status(201).json(gig);
  } catch (error) {
    next(error);
  }
};

const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'username');
    
    if (!gig) {
      res.status(404);
      throw new Error('Gig not found');
    }

    res.status(200).json(gig);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllGigs, createGig, getGigById };