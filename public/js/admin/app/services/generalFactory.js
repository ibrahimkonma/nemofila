app.factory('generalFactory', ['$http','config', ($http, config) => {
	const get_s3_signature = () => {
		return $http({
			url: config.s3_upload_signature_service_url,
			method: 'get',
		})
			.then((response) => {
				return response.data;
			}, () => {
				console.log('fail');
			});
	};

	return {
		get_s3_signature: get_s3_signature,
	};
}]);
