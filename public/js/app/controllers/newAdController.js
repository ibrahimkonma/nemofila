app.controller('newAdController', ['$scope', 'Upload', '$timeout', '$http', '$window', 'newAdFactory', 'countriesFactory', 'categoriesFactory', 'config', 'Slug', 'guidFactory', ($scope, Upload, $timeout, $http, $window, newAdFactory, countriesFactory, categoriesFactory, config, Slug, guidFactory) => {

	$scope.mapLoading = false;
	$scope.locate = () => {
		$scope.mapLoading = true;
		navigator.geolocation.getCurrentPosition(initialize, fail);
	};

	$scope.getPin = () => {
		try{
			const latLng = ($scope.newAdForm.coordinates).split(',');

			initialize(false, false, false, false, latLng[0], latLng[1], true, false);
		}catch(e){
			// e
		}
	};

	function getLocation(location){

		let index;
		const index_level_4 = location.results.findIndex(x => x.types[0] == 'administrative_area_level_4');
		if(index_level_4 !== -1){
			index = index_level_4;
		}else{
			index = location.results.findIndex(x => x.types[0] == 'administrative_area_level_2');
		}

		const city_and_country = location.results[index].formatted_address;

		const result = location.results[0];
		result.formatted_address = city_and_country;
		$scope.newAdForm.place = result;
	}

	/*eslint-disable-next-line*/
	function initialize(position, latLng, zoom, elementId, customLat, customLng, draggable = true, previewPage = false) {
		try{
			let lat, lng;

			if (latLng){
				lat = latLng.lat;
				lng = latLng.lng;
			}else{

				try{
					lat = position.coords.latitude;
					lng = position.coords.longitude;
				}catch(e){ // edit page
					lat = customLat;
					lng = customLng;
				}

				if((draggable || !elementId) && !previewPage){
					newAdFactory.getLocationDetail(lat, lng).then((location) => {
						getLocation(location);

						// $scope.newAdForm.place.fullPlaceName = getFullPlaceName();
					});
				}
			}

			$scope.latLng = { lat, lng };

			const myLatLng = new google.maps.LatLng(lat, lng);
			const mapOptions = {
				zoom: zoom ? zoom : 15,
				center: myLatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			const map = new google.maps.Map(
				document.getElementById(elementId || 'map'),
				mapOptions
			);

			/* eslint-disable-next-line */
			const marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				draggable: draggable,
				title:'Drag me!'
			});

			setTimeout(() => {
				$scope.mapLoading = false;
				$scope.$apply();
			});

			google.maps.event.addListener(marker, 'dragend', (position) => {
				const lat = position.latLng.lat();
				const lng = position.latLng.lng();

				$scope.latLng = { lat, lng };

				newAdFactory.getLocationDetail(lat, lng).then((location) => {
					getLocation(location);
				});
			});
		}catch(e){
			console.log(e);
		}
	}

	function fail(){
		alert('navigator.geolocation failed, may not be supported');
		$scope.mapLoading = false;
	}

	$scope.latLng;
	$scope.$watch('newAdForm.place', (newValue) => {
		if (typeof newValue === 'object') {
			try{
				const lat = newValue.geometry.location.lat();
				const lng = newValue.geometry.location.lng();

				const latLng = { lat: lat, lng: lng };
				$scope.latLng = latLng;

				initialize(0, latLng, 12, 'map', false, false, true);
			}catch (e){
				// do stuff
			}
		}
	});

	// New Ad Form
	$scope.newAdForm = {};
	$scope.newAdForm.anotherContact =  { };

	$scope.steps = {};
	$scope.steps.informations = true;
	$scope.steps.power = false;
	$scope.steps.preview = false;

	$scope.powerNumber = '0';
	$scope.buyPowerStatus = false;
	$scope.buyPowerLoader = false;

	$scope.newAdForm.place = null;

	$scope.autocompleteOptions = {
		types: ['(regions)']
	};

	$(() => {

		// stripe
		$('#buttonCheckout').on('click', () => {
			$scope.powerNumber = ($scope.powerNumber.split(':'))[1];
			if(parseInt($scope.powerNumber) > 0)
				checkoutHandler.open({
					name: 'Easyad',
					description: 'Power Purchase',
					token: handleToken
				});
		});

		$('.powerNumber').on('change', () => {
			$scope.powerNumber = $('.powerNumber').val();
		});

		function handleToken(token) {
			$scope.buyPowerLoader = true;
			$scope.$apply();
			fetch('/charge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(Object.assign(token, { amount: parseInt($scope.powerNumber) })),
			})
				.then(output => {
					if (output.statusText === 'OK') {
						$scope.buyPowerStatus = true;
						$scope.buyPowerLoader = false;
						$scope.$apply();
					}
				});
		}

		// # stripe

		$('#newAdForm').form({
			keyboardShortcuts: false,
			on: 'blur',
			inline : true,
			fields: {
				title: {
					identifier  : 'title',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please enter a title.'
						},
						{
							type   : 'maxLength[100]',
							prompt : 'Your title can be up to {ruleValue} characters long.'
						}
					]
				},
				mobile_phone: {
					identifier  : 'mobile_phone',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please enter a mobile phone.'
						}
					]
				},
				description: {
					identifier  : 'description',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please enter a description.'
						},
						{
							type   : 'maxLength[2000]',
							prompt : 'Your description can be up to {ruleValue} characters long.'
						}
					]
				},
				description2: {
					identifier  : 'description2',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please enter a description2.'
						},
						{
							type   : 'maxLength[2000]',
							prompt : 'Your description2 can be up to {ruleValue} characters long.'
						}
					]
				},

				country: {
					identifier: 'country',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please select a country.'
						}
					]
				},
				city: {
					identifier: 'city',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please select a city.'
						}
					]
				},
				category: {
					identifier: 'category',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please select a category.'
						}
					]
				},
				website: {
					identifier  : 'website',
					optional: true,
					rules: [
						{
							type   : 'url',
							prompt : 'Please enter a valid URL'
						}
					]
				},
			},
			onSuccess: () => {
				if (typeof $scope.newAdForm.place == 'object' && $scope.newAdForm.place)
					$scope.next();
				else
					alert('Please select a location.');
			}
		});

		$('#terms').on('click', () => {
			$('#termsModal').modal('show');
		});


		// $('#workTimesModal').modal('show');

		$('#workTimesBtn').on('click', () => {
			$('#workTimesModal').modal('show');
		});

		/*$('.openClose.checkbox').checkbox({
			  onChecked: () => {
				  const $childCheckbox  = $(this).closest('.checkbox');

				  console.log($childCheckbox);
			  }
		  });*/

		$('.hour24').change(function() {
			let $clockDropdowns = $(this).parent('div').parent('div').next('div').children('.dropdowns');
			if(this.checked) {
				$clockDropdowns.addClass('timeDropdownsVisible');
			}else{
				$clockDropdowns.removeClass('timeDropdownsVisible');
			}
		});

		$('.openClose').change(function() {
			let $elem = $(this).parent('div').parent('div').next('div');

			if(this.checked) {
				$elem.removeClass('workTimeSettingsDisplay');
			}else{
				$elem.addClass('workTimeSettingsDisplay');
			}
		});

		$('#anotherPerson').checkbox({
			onChecked: () => {
				$scope.newAdForm.anotherContact.checked = true;
				setTimeout( () => {
					$('input[name="anotherContactName"]').focus();
				},20);
			},
			onUnchecked: () => {
				$scope.newAdForm.anotherContact.checked = false;
			},
			onChange: () => {
				$scope.$apply();
			}
		});
	});

	$scope.init = (id, userExists) => {
		if (id !== 'false'){
			$scope.getAd(id, () => {
				initialize(0, false, 12, 'map', $scope.newAdForm.place.geometry.location.lat, $scope.newAdForm.place.geometry.location.lng); // map
				$scope.latLng = { lat: $scope.newAdForm.place.geometry.location.lat, lng: $scope.newAdForm.place.geometry.location.lng };
			});

			$scope.isEdit = true;
		}

		$scope.userExists =  (userExists == 'true');

		if (!$scope.userExists){
			$scope.openSignInModal();
		}

		categoriesFactory.getCategories().then((response) => {
			$scope.categories = response;
		});

		$scope.clocks = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
		$scope.newAdForm.workTimes = {
			'monday': {
				open: false
			},
			'tuesday': {
				open: false
			},
			'wednesday': {
				open: false
			},
			'thursday': {
				open: false
			},
			'friday': {
				open: false
			},
			'saturday': {
				open: false
			},
			'sunday': {
				open: false
			},
		};
	};

	$scope.filterWorkTime =  (openTime) => {
		return function (item) {
			if (item > openTime) {
				return true;
			}
			return false;
		};
	};

	$scope.next = () => {
		/*if ( !$scope.isEdit )
			$scope.powerTab();
		else
			$scope.previewTab();
		*/
		$scope.previewTab();
		$scope.$apply();
	};

	$scope.back = () => {
		/*if ( !$scope.isEdit )
			$scope.powerTab();
		else
			$scope.adInformationTab();*/

		$scope.adInformationTab();
	};

	$scope.uploadedFiles = [];
	$scope.getAd = (id, callback) => {
		$scope.loadingBufferData = true;
		$http( {
			url: '/newAd/getEditAd/' + id,
			method: 'GET',
		}).then( (response) => {

			$scope.newAdForm.title = response.data.title || '';
			$scope.newAdForm.description = response.data.description || '';
			$scope.newAdForm.description2 = response.data.description2 || '';
			$scope.newAdForm.phone = response.data.phone || '';
			$scope.newAdForm.mobile_phone = response.data.mobile_phone || '';
			$scope.newAdForm.address = response.data.address || '';
			$scope.newAdForm.website = response.data.website || '';
			$scope.newAdForm.anotherContact = response.data.anotherContact;
			$scope.newAdForm.place = response.data.place;
			$scope.newAdForm.workTimes = response.data.workTimes;

			if (!$scope.newAdForm.anotherContact){
				$scope.newAdForm.anotherContact =  { };
				$scope.newAdForm.anotherContact.checked = false;
			}

			try{
				$scope.newAdForm.files = response.data.photos || '';
				$scope.uploadedFiles = $scope.newAdForm.files;
				$scope.newAdForm.showcaseIndex = response.data.photoShowcaseIndex;
			}catch (e){
				$scope.newAdForm.files = [];
			}

			let category = response.data.category;
			setTimeout(() => {
				$scope.newAdForm.category = (($scope.categories).findIndex(x => String(x._id) === String(category.categoryId))).toString();
				$scope.newAdForm.categoryChild = (($scope.categories[$scope.newAdForm.category].subCategories).findIndex(x => String(x._id) === String(category.categoryChildId))).toString();

				/*$scope.newAdForm.country = (($scope.countries).findIndex(x => String(x._id) === String(country.countryId))).toString();
				$scope.newAdForm.city = (($scope.countries[$scope.newAdForm.country].cities).findIndex(x => String(x._id) === String(country.cityId))).toString();
				$scope.newAdForm.district = (($scope.countries[$scope.newAdForm.country].cities[$scope.newAdForm.city].districts).findIndex(x => String(x._id) === String(country.districtId))).toString();*/
			});

			$scope.loadingBufferData = false;

			callback();
		}, () => { // optional
			console.log( 'fail' );
			$scope.loadingBufferData = false;
		});
	};

	$scope.uploadAndSaveMongo = (id) => {
		if($scope.newAdForm.files && $scope.newAdForm.files.length > 0){
			$scope.uploadFiles($scope.newAdForm.files, id);
		} else {
			$scope.onSubmitAd( null, id, false );
		}
	};

	$scope.nextLoader = false;
	$scope.uploading = false;
	$scope.photos = [];
	let oldPhotos = 0;

	$scope.uploadFiles = (files, id) => {
		$scope.nextLoader = true;
		$scope.uploading = true;
		if (files && files.length) {
			let itemsProcessed = 0;
			let totalNewFiles = files.filter((x) => { return x.name; }).length;

			if (totalNewFiles < 1){
				$scope.uploading = false;
				$scope.onSubmitAd( files, id, false );
			}

			files.forEach((file, key) => {
				let title = Slug.slugify($scope.newAdForm.title);
				let formatted_address = Slug.slugify($scope.newAdForm.place.formatted_address);

				let category = $scope.categories[$scope.newAdForm.category];
				let categoryName = Slug.slugify(category.name);

				let childCategoryName = '';
				try{
					childCategoryName = Slug.slugify(category.subCategories[$scope.newAdForm.categoryChild].name);
				}catch (e){
					// console.log(e);
				}

				let extensionData = (file.name).split('.');
				let fileExtension = extensionData[extensionData.length - 1];

				let number = (key + 1) % 3;

				let photoName = '';
				let altTag = '';

				if(number === 1){
					photoName = title +'-'+ formatted_address +'-'+ guidFactory.generateGuid() + '.' + fileExtension;
					altTag = title + ',' + formatted_address + ' - nemofila';
				}else if(number === 2){
					photoName = categoryName +'-'+ formatted_address +'-'+ guidFactory.generateGuid() + '.' + fileExtension;
					altTag = title + ',' + categoryName +','+ formatted_address;
				}else {
					photoName = childCategoryName +'-'+ categoryName +'-'+ formatted_address +'-'+ guidFactory.generateGuid() + '.' + fileExtension;
					altTag = title +','+ categoryName +','+ formatted_address;
				}

				if (!file.name) {
					oldPhotos++;
					return true;
				}

				file.upload = Upload.upload({
					url: config.s3_upload_url,
					method: 'POST',
					data: {
						key: photoName, // the key to store the file on S3, could be file name or customized
						acl: $scope.acl, // sets the access to the uploaded file in the bucket: private, public-read, ...
						policy: $scope.policy, // base64-encoded json policy (see article below)
						'X-amz-signature': $scope.X_amz_signature, // base64-encoded signature based on policy string (see article below)
						'X-amz-credential': $scope.x_amz_credential,
						'X-amz-algorithm': $scope.X_amz_algorithm,
						'X-amz-date': $scope.X_amz_date,
						'Content-Type': file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
						filename: photoName, // this is needed for Flash polyfill IE8-9
						file: file,
					}
				});

				file.upload.then((response) => {
					$scope.result = response.data;
					file.progressFinish = true;

					itemsProcessed++;

					if (file.showcase)
						$scope.photos.push({ filename: photoName, showcase: true, altTag: altTag });
					else
						$scope.photos.push({ filename: photoName, altTag: altTag });

					if(itemsProcessed + oldPhotos === files.length) {
						$scope.uploading = false;
						$scope.onSubmitAd( $scope.photos, id );
					}
				}, (response) => {
					if (response.status > 0) {
						$scope.errorMsg = response.status + ': ' + response.data;
					}
				}, (evt) => {
					file.progress = Math.min(100, parseInt(100.0 *
						evt.loaded / evt.total));
				});
			}); // foreach
		}
	};

	$scope.adSaveComplete = false;
	$scope.submitBtnLoading = false;
	$scope.onSubmitAd = (photos, id, newPhotos) => {
		$scope.submitBtnLoading = true;

		let data = Object.assign({}, $scope.newAdForm);

		delete data.files;

		let photoList;
		if (newPhotos === false){
			photoList = photos;
		}else{
			if($scope.uploadedFiles){
				photoList = photos ? photos.concat($scope.uploadedFiles) : null;
			}else {
				photoList = photos;
			}
		}

		let showcaseIndex;
		try {
			showcaseIndex = photoList.findIndex(x => x.showcase === true);
		}catch (e){
			showcaseIndex = null;
		}
		/*
		let district;
		try{
			district = $scope.countries[$scope.newAdForm.country].cities[$scope.newAdForm.city].districts[$scope.newAdForm.district]._id;
		}catch(e){
			district = null;
		}*/

		let childCategory;
		try{
			childCategory = $scope.categories[$scope.newAdForm.category].subCategories[$scope.newAdForm.categoryChild]._id;
		}catch(e){
			childCategory = null;
		}

		let isEdit = id !== 'false' ? true : false;

		$http({
			url: '/newAd/create',
			method: 'POST',
			data: {
				recaptcha: document.getElementById('g-recaptcha-response').value,
				data: data,
				isEdit: isEdit,
				editId: id,
				power: {
					powerStatus: $scope.buyPowerStatus,
					powerNumber: $scope.powerNumber,
				},
				photos: photoList,
				showcaseIndex: showcaseIndex,
				category: {
					categoryId: $scope.categories[$scope.newAdForm.category]._id,
					childCategoryId: childCategory
				}
			}
		}).then((response) => {
			$scope.submitBtnLoading = false;

			if(response.data.status === 1){
				$scope.adSaveComplete = true;
				$window.scrollTo(0, 0);
			}
		}, () => { // optional
			$scope.submitBtnLoading = false;
			console.log('fail');
		});
	};

	$scope.newAdForm.showcaseIndex = 0;
	$scope.onPhotoSelect = () => {
		if ($scope.isEdit){
			if ($scope.uploadedFiles < 1)
				$scope.newAdForm.files[0].showcase = true;
		}else{
			if ($scope.newAdForm.files.length > 0)
				$scope.newAdForm.files[$scope.newAdForm.showcaseIndex].showcase = true;
		}
	};

	$scope.onDeletePhoto = (index) => {
		$scope.newAdForm.files.splice(index, 1);
		if ($scope.newAdForm.showcaseIndex === index){
			$scope.newAdForm.files[0].showcase = true;
			$scope.newAdForm.showcaseIndex = 0;
		}
	};

	$scope.onSelectShowCase = (index) => {
		$scope.newAdForm.files[$scope.newAdForm.showcaseIndex].showcase = false;

		$scope.newAdForm.showcaseIndex = index;
		$scope.newAdForm.files[index].showcase = true;
	};

	$scope.triggerUploadWindow = () => {
		$('input[type="file"]').trigger('click');
	};

	/*let completeSaveAd = () => {
		$scope.openSignInModal();
		$scope.powerTab();
		$scope.nextLoader = false;
	};*/

	$scope.previewTab = () => {
		initialize(0, $scope.latLng, 12, 'mapPreview', false , false, false, false );

		$scope.steps.informations = false;
		$scope.steps.power = false;
		$scope.steps.preview = true;
		$window.scrollTo(0, 0);
	};

	$scope.powerTab = () => {
		$scope.steps.informations = false;
		$scope.steps.power = true;
		$scope.steps.preview = false;
		$window.scrollTo(0, 0);
	};

	$scope.adInformationTab = () => {
		$scope.steps.informations = true;
		$scope.steps.power = false;
		$scope.steps.preview = false;
		$window.scrollTo(0, 0);
	};

	// recaptcha
	$scope.activeSaveBtn = false;
	$scope.successCaptcha = () => {
		$scope.activeSaveBtn = true;
	};
}]);



