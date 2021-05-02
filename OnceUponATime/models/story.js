const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
    author: String,
    date: String,
    content: String,
    img: {
		data: Buffer,
		contentType: String
	},
    follow: Boolean, // can remove after implement options
    options: [[String, String], [String, String]], //[[node id, string],[node id, string]]
    closed: Boolean
});


const StorySchema = new mongoose.Schema({
    title: String,
    contributor: [String], //username
    likes: [String], //username
    nodeCount: Number, //number of node in the story
    nodes: [NodeSchema]
});

const Story = mongoose.model('Story', StorySchema);

module.exports = { Story };
