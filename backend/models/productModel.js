const mongoose = require('mongoose');

const JewelryCategories = [
    'anello', 'collana', 'orecchino', 'bracciale',
    'orologio', 'ciondolo', 'spilla', 'gemelli',
    'fermacravatta', 'charm', 'cornice', 'altro'
];

const productSchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        lowercase: true,
        enum: JewelryCategories
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    oldPrice: {
        type: Number,
        required: true,
    },
    newPrice: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
