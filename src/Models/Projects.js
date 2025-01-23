const mongoose = require('mongoose');

const projectsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },    
    mainImage: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    media: [{
        type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        url: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    const isImage = /\.(jpg|jpe?g|png|gif|webp)$/i.test(v);
                    const isVideo = /\.(mp4|mov|webm)$/i.test(v);
                    return this.type === 'image' ? isImage : isVideo;
                },
                message: 'Formato de archivo inválido'
            }
        },
    }],
    description: {
        client: {
            type: String,
            required: true,
            trim: true
        },
        techniques: {
            type: [String],
            validate: {
                validator: function (v) {
                    return v.length > 0;
                },
                message: 'Al menos una técnica requerida'
            }
        },
        duration: {
            sessions: { type: Number, min: 1 },
            hoursPerSession: { type: Number, min: 1 }
        },
        story: {
            type: String,
            maxlength: [500, 'Máximo 500 caracteres']
        }
    },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

projectSchema.virtual('description.totalHours').get(function () {
    return this.description.duration.sessions * this.description.duration.hoursPerSession;
});

const Projects = mongoose.model('Projects', projectsSchema);

module.exports = Projects;