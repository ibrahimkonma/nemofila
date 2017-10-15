app.directive('countryAndCategoryDropdowns', () => {
	return {
		template : '<div class="field" ng-click="updateMap()">\n' +
		'  <label>Country</label>\n' +
		'  <select name="country" ng-model="newAdForm.country" ng-options="index as country.name for (index, country) in countries " ng-change="changeCountry()">' +
		'<option value="">Please select</option>' +
		'</select>\n' +
		'</div>\n' +
		'<div class="field">\n' +
		'  <label>City</label>\n' +
		'  <select name="city" ng-disabled="visiblesCountries.cities" ng-model="newAdForm.city" ng-options="index as city.name for (index, city) in countries[newAdForm.country].cities" ng-change="changeCity()">' +
		'<option value="">Please select</option>' +
		'</select>\n' +
		'</div>\n' +
		'<div class="field">\n' +
		'  <label>District</label>\n' +
		'  <select name="district" ng-disabled="visiblesCountries.districts" ng-model="newAdForm.district" ng-options="index as district.name for (index, district) in countries[newAdForm.country].cities[newAdForm.city].districts" ng-change="changeDistrict()">' +
		'<option value="">Please select</option>' +
		'</select>\n' +
		'</div>\n' +
		'<div class="field">\n' +
		'  <label>Category</label>\n' +
		'  <select name="category" ng-model="newAdForm.category" ng-options="index as category.name for (index, category) in categories" ng-change="changeCategory()">' +
		'<option value="">Please select</option>' +
		'</select>\n' +
		'</div>\n' +
		'<div class="field">\n' +
		'  <label>Child Category</label>\n' +
		'  <select name="subCategory" ng-disabled="visiblesCategories.subCategory" ng-model="newAdForm.categoryChild" ng-options="index as subCategory.name for (index, subCategory) in categories[newAdForm.category].subCategories">' +
		'<option value="">Please select</option>' +
		'</select>\n' +
		'</div>',

		link: function($scope) {
			// Select option Countries
			$scope.visiblesCountries = {
				cities: true,
				districts: true
			};
			$scope.changeCountry = () => {
				$scope.visiblesCountries.cities = false;
			};
			$scope.changeCity= () => {
				$scope.visiblesCountries.districts = false;
			};

			// Select option Categories
			$scope.visiblesCategories = {
				subCategory: true,
			};
			$scope.changeCategory = () => {
				$scope.visiblesCategories.subCategory = false;
			};
		}

	};
});