let mongoose = require('mongoose');
let Schema	 = mongoose.Schema;
let ObjectId = Schema.ObjectId;


let adSchema = new Schema({
	title: {
		type: String,
		// required: true
	},
	slug: {
		type: String
	},
	description: {
		type: String,
	},
	photos: [],
	photoShowcaseIndex: {
		type: Number,
	},
	power: {
		powerStatus: Boolean,
		powerNumber: Number
	},
	uuid: {
		type: String
	},
	place: {},
	category: {
		categoryId: ObjectId ,
		categoryChildId: ObjectId ,
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
		default: Date.now
	},
	listingDate: {
		type: Date,
	},
	updateAt: { // for sorting. not edit date.
		type: Date,
		default: Date.now
	},
	ownerId: {
		type: ObjectId
	},
	status: {
		type: Number,
		default: 0,
	},
	statusText: {
		type: String,
		default: 'Waiting'
	},
	phone: {
		type: String,
	},
	mobile_phone: {
		type: String,
	},
	address:String,
	website: String,
	pageView: {
		type: Number,
		default: 0
	},
	rates: [
		{
			userId: ObjectId,
			score: Number
		},
	],
	workTimes: {
		monday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		},
		tuesday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		},
		wednesday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		},
		thursday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		},
		friday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		},
		saturday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		},
		sunday: {
			startH: Number,
			startM: Number,
			endH: Number,
			endM: Number,
			open: Boolean
		}
	}
});

module.exports = mongoose.model('ads', adSchema);
