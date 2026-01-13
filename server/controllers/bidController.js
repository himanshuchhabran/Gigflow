const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');


const placeBid = async (req, res, next) => {
  try {
    const { gigId, price, message } = req.body;

    // 1. Check if Gig exists and is Open
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'Open') {
      res.status(400);
      throw new Error('Gig is not available');
    }

    // 2. Prevent Owner from bidding on their own gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot bid on your own gig');
    }

    // 3. Create Bid (Unique index in model prevents duplicates)
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      price,
      message,
    });

    res.status(201).json(bid);
  } catch (error) {
    next(error);
  }
};


const getBidsByGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      res.status(404);
      throw new Error('Gig not found');
    }

    // Security Check: Only the owner can view bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view bids for this gig');
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (error) {
    next(error);
  }
};


const hireFreelancer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start Atomic Transaction

  try {
    const { bidId } = req.params;
    
    // Find the bid to get the gigId
    const bidToHire = await Bid.findById(bidId).session(session);
    if (!bidToHire) {
      throw new Error('Bid not found');
    }

    const gig = await Gig.findById(bidToHire.gigId).session(session);

    // Security & Integrity Checks
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      throw new Error('Not authorized to hire for this gig');
    }
    if (gig.status !== 'Open') {
      throw new Error('This gig is no longer open');
    }

    // --- EXECUTE UPDATES ---

    // 1. Mark Gig as Assigned
    gig.status = 'Assigned';
    await gig.save({ session });

    // 2. Mark Chosen Bid as Hired
    bidToHire.status = 'Hired';
    await bidToHire.save({ session });

    // 3. Auto-Reject all OTHER bids for this gig
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } }, // $ne = not equal
      { status: 'Rejected' },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // --- REAL-TIME NOTIFICATION (Socket.io) ---
    // We access 'io' from the app instance we set in server.js
    const io = req.app.get('socketio');
    
    // Emit event to the specific freelancer
    // Note: In a real app, you map userId to socketId. 
    // For this demo, we broadcast to the room named after the userId.
    io.to(bidToHire.freelancerId.toString()).emit('notification', {
      type: 'HIRED',
      message: `Congratulations! You have been hired for: ${gig.title}`,
      gigId: gig._id
    });

    res.status(200).json({ message: 'Freelancer hired successfully' });

  } catch (error) {
    // If anything fails, roll back everything
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = { placeBid, getBidsByGig, hireFreelancer };