app.factory('layoutFactory', ['$http', ($http) => {
	let signIn = (data, autoLogin, recaptcha) => {
		return $http({
			url: '/login',
			method: 'POST',
			data: { 'data' : data, 'autoLogin': autoLogin, 'recaptcha': recaptcha }
		}).then((response) => {
			return response.data;
		}, () => { // optional
			console.log('fail');
		});
	};

	let signUp = (data, recaptcha) => {
		return $http({
			url: '/register',
			method: 'POST',
			data: { 'data' : data, 'recaptcha': recaptcha }
		}).then((response) => {
			return response.data;
		}, () => { // optional
			console.log('fail');
		});
	};

	let forgotPassword = (email) => {
		return $http({
			url: '/forgotPassword',
			method: 'POST',
			data: { 'email' : email }
		}).then((response) => {
			return response.data;
		}, () => { // optional
			console.log('fail');
		});
	};

	let subscribe = (email) => {
		return $http({
			url: '/subscribe',
			method: 'POST',
			data: { 'email' : email }
		}).then((response) => {
			return response.data;
		}, () => { // optional
			console.log('fail');
		});
	};

	return {
		signIn: signIn,
		signUp: signUp,
		forgotPassword: forgotPassword,
		subscribe: subscribe
	};
}]);
