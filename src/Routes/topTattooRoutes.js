const express = require('express');
const router = express.Router();
const { addImageAtPosition,toggleActiveImage, reOrder } = require('../Controllers/TopTattooController');

router.post('/', addImageAtPosition);
router.patch("/toggle-active/:id", toggleActiveImage);
router.patch("/reorder", reOrder);

module.exports = router;
