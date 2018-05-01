/*eslint-disable */
const app = angular.module('app',[
	'ngRoute',
	'ngFileUpload',
	'ngImgCrop',
	'angularMoment',
	'thatisuday.ng-image-gallery',
	'ngWig',
	'ngSanitize',
	'bw.paging',
	'vcRecaptcha',
	'google.places',
	'slugifier'
]);

app.value('config', {
	's3_upload_url': 'https://easyad-static.s3-eu-central-1.amazonaws.com',
	's3_upload_signature_service_url': 'https://jqueryegitimseti.com/amazon-service.php',
});
/*eslint-enable */
