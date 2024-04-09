const mongoose = require('mongoose');

const topTattooSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
});

const TopTattoo = mongoose.model('TopTattoo', topTattooSchema);

module.exports = TopTattoo;