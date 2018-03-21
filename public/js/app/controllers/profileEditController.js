/*eslint-disable */
app.controller('profileEditController', ['$scope', 'Upload', '$timeout', ($scope, Upload, $timeout) => {
/*eslint-enable */

	$scope.openUploadProfilePictureModal = () => {
		$('#uploadProfilePictureModal').modal('show');
	};

	$scope.onPhotoSelect = () => {
		$scope.openUploadProfilePictureModal();
	};

	$scope.upload = function (dataUrl, name) {
		Upload.upload({
			url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
			data: {
				file: Upload.dataUrltoBlob(dataUrl, name)
			},
		}).then(function (response) {
			$timeout(function () {
				$scope.result = response.data;
			});
		}, function (response) {
			if (response.status > 0) $scope.errorMsg = response.status
				+ ': ' + response.data;
		}, function (evt) {
			$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
		});
	}

}]);
