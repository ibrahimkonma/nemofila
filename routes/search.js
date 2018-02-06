const express = require('express');
const router = express.Router();
const round = require('mongo-round');

const i18n = require('i18n');
const ObjectId = require('mongoose').Types.ObjectId;

// Models
const Ads = require('../models/ads');
const Events = require('../models/events');

let adPerPage = 48;

/* GET home page. */
router.get( '/', ( req, res ) => {
	let location = req.query.location;
	let categoryId = req.query.categoryId;
	let subCategoryId = req.query.subCategoryId;
	let categoryName = req.query.categoryName;
	let subCategoryName = req.query.subCategoryName;
	let sortWith = req.query.sortWith;

	let sort;
	if (sortWith === 'rate'){
		sort = { 'rate': -1 };
	}else{
		sort = { 'totalPower':-1, 'updateAt': -1 };
	}

	const url = req.protocol + '://' + req.get('host') + req.originalUrl;

	let pattern = /^[1-9]+$/;

	let page;
	if (!pattern.test(req.query.page))
		page = 1;
	else
		page = Math.abs(parseInt(req.query.page));

	let lastAd = (page -1) * adPerPage;


	Ads.aggregate([
		{
			'$match': {
				status: 1,
				title: new RegExp(req.query.title, 'i'),
				'place.address_components.long_name': location !== '' ? location : { $exists: true },
				'category.categoryId': categoryId ? ObjectId(categoryId) :  { $exists: true },
				'category.categoryChildId': subCategoryId ? ObjectId(subCategoryId) :  { $exists: true },
			}
		},

		// Power collection
		{
			$lookup: {
				from: 'powers',
				localField: '_id',
				foreignField: 'adId',
				as: 'power'
			}
		},
		{
			$unwind: {
				path: '$power',
				// ad collection, power collectionda herhangi eşleşme yapamasa bile ad'i döndür.
				preserveNullAndEmptyArrays: true
			}
		},

		{
			$group: {
				_id: {
					_id: '$_id',
					title: '$title',
					slug: '$slug',
					updateAt: '$updateAt',
					photos: '$photos',
					photoShowcaseIndex: '$photoShowcaseIndex',
					place: '$place',
					rate: { $avg: '$rates.score' },
				},
				power: {
					$push: '$power'
				},
				totalPower: {
					$sum: { $cond: [{ $gte: [ '$power.endingAt', new Date() ] }, '$power.powerNumber', 0] }
				}
			}
		},
		{
			$project: {
				_id: '$_id._id',
				title: '$_id.title',
				slug: '$_id.slug',
				updateAt: '$_id.updateAt',
				photos: '$_id.photos',
				photoShowcaseIndex: '$_id.photoShowcaseIndex',
				powers: '$power',
				totalPower: 1,
				place: '$_id.place',
				rate: round('$_id.rate', 1),
			}
		}, // ,
		{ $sort: sort },
		{ $skip: lastAd },
		{ $limit: adPerPage }
	], (err, data) => {
		if (err)
			throw new Error(err);

		const category = subCategoryName !== '' ? subCategoryName : categoryName;
		const locationTitle = (location !== '') && (location !== undefined)   ? 'in '+ location : '';
		const best = category !== '' ? i18n.__( 'best' ) : '';
		const title = `${best} ${category} ${locationTitle}`;

		let d = { data: data };

		let result = Object.assign(d, {
			adCount: data.length,
			adPerPage: adPerPage,
			page: req.query.page,
			url: url,
			title: title.trim() !== '' ? title : i18n.__( 'Search Results' )
		});

		res.render('search', result);
	});
});

router.get('/getEventsByLocationName', (req, res) => {
	// const location = req.query.location;

	Events.aggregate([
		{
			'$match': {
				// '_id': _id,
			}
		},

		// ads collection
		{
			$lookup: {
				from: 'ads',
				localField: 'adId',
				foreignField: '_id',
				as: 'ad'
			}
		},
		{ '$unwind': '$ad' },

		{ $limit: 1 },
		{
			'$project': {
				'title': 1,
				'description': 1,
				'status': 1,
				'startDate': 1,
				'endDate': 1,
				'photoShowcaseIndex': 1,
				'photos': 1,
				'ad': '$ad',
			},
		},
	], (err, result)=>{
		if (err)
			throw err;

		console.log(result[0]);
		res.json(result[0]);
	});
});

module.exports = router;
