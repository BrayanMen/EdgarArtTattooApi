const mongoose = require('mongoose');
import bg from '../assets/images/bg.jpg';
import { stringRequired } from '../Utils/mongooseUtils';

const galleryArtSchema = new mongoose.Schema({
  title: stringRequired('El título', 100),
  images: {
    main: {
      type: String, 
      required: true
    },
    secondary: {
      type: String,
      required: true
    },
    background: {
      type: String,
      default: bg
    }
  },  
  content: {
    subtitles: {
      left: {
        type: String,
        maxlength: [40, 'Subtítulo izquierdo muy largo'],
        default: 'Black & Gray'
      },
      right: {
        type: String,
        maxlength: [30, 'Subtítulo derecho muy largo'],
        default: 'Realismo'
      }
    },    
    taglines: {
      left: {
        type: String,
        maxlength: [20, 'Tagline izquierdo muy largo'],
        default: 'tattoo'
      },
      right: {
        type: String,
        maxlength: [20, 'Tagline derecho muy largo'],
        default: 'tattoo'
      }
    }
  },
  styling: {
    maskType: {
      type: String,
      enum: ['radial', 'linear', 'none'],
      default: 'radial'
    },
    shadowIntensity: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },    
  },  
  category: {
    type: String,
    enum: ['tattoo', 'art', 'illustration', 'design', 'painting'],
    required: true
  },    
  displayType: {
    type: String,
    enum: ['simple', 'advanced'],
    default: 'advanced'
  },
  isFeatured: Boolean,
  order: Number,
  active: { type: Boolean, default: true },  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

galleryArtSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const GalleryArt = mongoose.model('GalleryArt', galleryArtSchema);

module.exports = GalleryArt;