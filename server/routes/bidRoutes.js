const express = require('express');
const router = express.Router();
const { placeBid, getBidsByGig, hireFreelancer } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, placeBid);
router.get('/:gigId', protect, getBidsByGig);
router.patch('/:bidId/hire', protect, hireFreelancer);

module.exports = router;