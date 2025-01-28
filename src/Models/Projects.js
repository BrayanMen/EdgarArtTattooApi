const mongoose = require('mongoose');
const { stringRequired, commonSchemaOptions, booleanDefault } = require('../Utils/mongooseUtils');

const projectsSchema = new mongoose.Schema({
    title: stringRequired('El título', 100),   
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
        client: stringRequired('Cliente', 50),
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
        story: stringRequired('Historia', 500)
    },
    featured: booleanDefault(),
    active: booleanDefault(),
},commonSchemaOptions);

projectsSchema.virtual('description.totalHours').get(function () {
    return this.description.duration.sessions * this.description.duration.hoursPerSession;
});

const Projects = mongoose.model('Projects', projectsSchema);

module.exports = Projects;