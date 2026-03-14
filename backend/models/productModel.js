const mongoose = require('mongoose');

const JewelryCategories = [
    'anello', 'collana', 'orecchino', 'bracciale',
    'orologio', 'ciondolo', 'spilla', 'gemelli',
    'fermacravatta', 'charm', 'cornice', 'altro'
];

const productSchema = new mongoose.Schema({
    listPrice: {
        type: Number,
        required: true,
        default: 0
    },

    brand: {
        type: String
    },

    gender: {
        type: String,
        enum: ['uomo', 'donna', 'unisex'],
    },

    barcode: {
        type: String,
        required: true,
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
