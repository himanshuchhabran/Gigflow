const express = require('express');
const router = express.Router();
const { getAllGigs, createGig, getGigById } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');


router.get('/', getAllGigs);
router.get('/:id', getGigById);

router.post('/', protect, createGig);

module.exports = router;