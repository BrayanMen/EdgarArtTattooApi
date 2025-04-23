const express = require('express');
const router = express.Router();
const { addImageAtPosition,toggleActiveImage } = require('../Controllers/topTattooController');

router.post('/', addImageAtPosition);
router.patch("/toggle-active/:id", toggleActiveImage);

module.exports = router;
