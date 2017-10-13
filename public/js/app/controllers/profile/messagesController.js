/*eslint-disable */
app.controller('messagesController', ['$scope', 'messageFactory', function($scope, messageFactory){
/*eslint-enable */

	$scope.loadingConversations = true;
	messageFactory.getConversations().then((response) => {
		console.log(response);
	});

	$scope.messageSended = false;
	$scope.sendMessage = () => {
		$scope.sendMessageLoading = true;
		console.log($scope.sendMessageFormData);
	};
}]);
