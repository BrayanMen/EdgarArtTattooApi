const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  image: { type: String, required: true }
});

const Carousel = mongoose.model('Carousel', carouselSchema);

module.exports = Carousel;