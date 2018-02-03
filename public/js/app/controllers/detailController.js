app.controller('detailController', ['$scope', 'favFactory', 'rateFactory', 'messageFactory', ($scope, favFactory, rateFactory, messageFactory) => {

	$(() => {
		$('.detail-right-menu a').popup({
			position: 'bottom center'
		});

		$('#detailRating').rating({
			maxRating: 5,
			onRate: (value) => {
				rateFactory.setRate($scope.adId, value).then((data) => {
					console.log(data);
				});
			}
		});

		// Send Message Form validation
		$('#sendMessageForm').form({
			keyboardShortcuts: false,
			on: 'blur',
			fields: {
				pw: {
					identifier  : 'message',
					rules: [
						{
							type   : 'empty',
							prompt : 'Please enter your message.'
						},
						{
							type   : 'maxLength[600]',
							prompt : 'Your message can be up to {ruleValue} characters long.'
						}
					]
				}
			},
			onSuccess: () => {
				$scope.sendMessage();
			},
			onInvalid:() => {
				$scope.sendMessageErr = null;
			},
		});
	});


	/*eslint-disable*/
	function initMap(lat, lng){
		const geocoder = new google.maps.Geocoder();
		const latlng = new google.maps.LatLng( lat, lng );
		const mapOptions = {
			zoom: 8,
			center: latlng
		};
		const map = new google.maps.Map( document.getElementById( 'googleMap' ), mapOptions );
	}
	/*eslint-enable*/

	$scope.init = (userId, adId, photos, amazon_base_url, mapLat, mapLng) => {
		$scope.adId = adId;

		initMap(mapLat, mapLng);

		if ( userId !== 'null' ){
			favFactory.isFav(userId,adId).then((response) => {
				$scope.isFav = response.isFav;
			});
		}

		let photoList = JSON.parse(photos);
		photoList.forEach((elem,index)=>{
			elem.url = amazon_base_url+'/'+elem.filename;
			elem.id = index;
		});

		$scope.imagesa = photoList;
	};

	$scope.addFavourites = (adId, userId) => {
		favFactory.addFavourites(adId,userId).then((response) => {
			if (response.status){
				$scope.isFav = true;
			}
		});
	};

	$scope.delFavourites = (adId, userId) => {
		favFactory.delFavourites(adId,userId).then((response) => {
			if (response.status){
				$scope.isFav = false;
			}
		});
	};

	$(() => {
		$('#sendMessageModal').modal({
			onHide: function(){
				$scope.messageSended = false;
				$scope.sendMessageFormData.message = '';
				$('body').removeClass('ios11-input-bug-fixer');
			},
			onShow: () => {
				$('body').addClass('ios11-input-bug-fixer');
			}
		});
	});

	$scope.openSendMessageModal = () => {
		$('#sendMessageModal').modal('show');
	};

	/*setTimeout(() => {
		$scope.openSendMessageModal();
	});*/


	$scope.sendMessage = () => {
		$scope.sendMessageLoading = true;

		messageFactory.createConversation($scope.sendMessageFormData).then((response) => {
			if (response.status !== 1){
				$scope.sendMessageLoading = false;
				$scope.sendMessageErr = response.error;
				return false;
			}

			messageFactory.createMessage($scope.sendMessageFormData, response.conversationId).then((response) => {
				$scope.sendMessageLoading = false;
				if (response.status !== 1) {
					$scope.sendMessageErr = response.error;
					return false;
				}

				$scope.messageSended = true;
			});
		});
	};


	// Photo gallery
	$scope.methods = {};
	$scope.openGallery = function(){
		$scope.methods.open();
	};

	$scope.changePhoto = (index) => {
		$scope.showcase = $scope.photos[index].filename;
	};

	$scope.showcase = (data, showcaseIndex) => {
		console.log(data);
		console.log(showcaseIndex);
		$scope.photos = data;
		$scope.showcaseIndex = showcaseIndex;
		$scope.showcase = data[$scope.showcaseIndex].filename;
	};

}]);

app.config(['ngImageGalleryOptsProvider', function(ngImageGalleryOptsProvider){
	ngImageGalleryOptsProvider.setOpts({
		thumbnails  	:   true,
		thumbSize		: 	40,
		inline      	:   false,
		bubbles     	:   true,
		bubbleSize		: 	20,
		imgBubbles  	:   false,
		bgClose     	:   true,
		piracy 			: 	false,
		imgAnim 		: 	'fadeup',
	});
}]);
