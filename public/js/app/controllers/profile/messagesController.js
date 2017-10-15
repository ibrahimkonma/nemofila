/*eslint-disable */
app.controller('messagesController', ['$scope', 'messageFactory', '$routeParams', function($scope, messageFactory, $routeParams){
/*eslint-enable */

	let objDiv = document.getElementById('messageList');

	$scope.sendMessageFormData = { };
	$scope.loadingMessages = false;

	$scope.loadingConversations = true;
	messageFactory.getConversations().then((response) => {
		$scope.loadingConversations = false;
		$scope.conversations = response;
		console.log('conversations');
	});


	if ($routeParams.id){
		$scope.sendMessageFormData.conversationId = $routeParams.id;
		$scope.visibleMessages = true;
		$scope.loadingMessages = true;
		messageFactory.getMessages($routeParams.id).then((response) => {
			$scope.loadingMessages = false;
			$scope.messages = response;
			scrollDown();
		});
	}

	$scope.messageSended = false;
	$scope.sendMessage = () => {
		$scope.sendMessageLoading = true;

		messageFactory.createMessage($scope.sendMessageFormData, $scope.sendMessageFormData.conversationId).then((response) => {
			$scope.sendMessageLoading = false;
			if (response.status !== 1) {
				$scope.sendMessageErr = response.error;
				return false;
			}

			$scope.messages.push ({
				message: $scope.sendMessageFormData.message,
				createdAt: new Date(),
				user: {
					name: $scope.sendMessageFormData.name,
					surname: $scope.sendMessageFormData.surname
				}
			});

			$scope.sendMessageFormData.message = '';
			scrollDown();
		});
	};

	function scrollDown(){
		setTimeout(()=>{
			objDiv.scrollTop = objDiv.scrollHeight;
		},1);
	}
}]);