const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    img: {
		data: Buffer,
		contentType: String
	},
    points: Number,
    value: Number,
    type: String
});

const ProductSectionSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    description: String,
    products: [ProductSchema]
});

const ProductSection = mongoose.model('ProductSection', ProductSectionSchema);

module.exports = { ProductSection };
