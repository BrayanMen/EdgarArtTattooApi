const mongoose = require('mongoose');

const ReviewsSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        comment: {
          type: String,
          maxlength: 500,
          required: true
        }
      },
      target: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel',
        required: true
      },
      targetModel: {
        type: String,
        enum: ['Projects', 'Seminar', 'Products', 'GalleryArt' ],
        required: true
      }
    }, { timestamps: true });

const Reviews = mongoose.model('GalleryArt', ReviewsSchema);

module.exports = Reviews;