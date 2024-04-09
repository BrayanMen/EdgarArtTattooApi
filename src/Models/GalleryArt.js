const mongoose = require('mongoose');

const galleryArtSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: [
        'tatuaje', 
        'ilustracion', 
        'diseño', 
        'pintura'
    ] 
},
  image: { type: String, required: true }
});

const GalleryArt = mongoose.model('GalleryArt', galleryArtSchema);

module.exports = GalleryArt;