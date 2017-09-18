let mongoose = require('mongoose');
let Schema	 = mongoose.Schema;

let adSchema = new Schema({
	title: {
		type: String,
		// required: true
	},
	slug: {
		type: String
	},
	price: {
		type: Number,
		// required: true
	},
	description: {
		type: String
	},
	photos: [],
	uuid: {
		type: String
	},
	location:{
		countryId: Number,
		cityId: Number,
		districtId: Number,
	},
	category: {
		categoryId: {
			type: Number,
			// required: true
		},
		categoryChildId: {
			type: Number,
			// required: true
		}
	},
	anotherContact: {
		checked: {
			type: Boolean
		},
		name: {
			type: String,
			// required: true
		},
		phone: {
			type: String,
			// required: true
		}
	},
	createdAt: {
		type: Date,
		default: new Date()
	},
	ownerId: {
		type: String
	}
});

module.exports = mongoose.model('ads', adSchema);
