module.exports = function(io) {

	io.sockets.on('connection', function(socket) {
		socket.on('set_nickname', function(nickname, color, callback) {
			console.log('Setting up nick for' + nickname);

			var nickAvailable = isAvailable(nickname);
			var colorAvailable = isColorAvailable(color);

			if (nickAvailable && colorAvailable) {
				socket.nickname = nickname;
				socket.color = color;
				sendMsg('SERVER','','User '+ socket.nickname+' has connected.');
			}

			callback(nickAvailable, colorAvailable);
		});

		socket.on('message', function(msg){
			console.log(msg);
			sendMsg(socket.nickname, socket.color, msg);
		});

		socket.on('disconnect', function(){
			console.log(socket.nickname + ' disconnected');
			if(socket.nickname){
				sendMsg("", "",socket.nickname+' left.');
			}
		});
	});

	var sendMsg = function(nickname, color, msg){
		io.sockets.emit('message', nickname, color, msg);
	};

	var isColorAvailable = function(color){
		var clients = io.sockets.sockets;

		for (var client in clients) {
			if (clients.hasOwnProperty(client)) {
				client = clients[client];

				if (client.color == color) {
					return false;
				}
			}
		}
		return true;
	};

	var isAvailable = function(nickname) {

		var clients = io.sockets.sockets;

		for (var client in clients) {
			if (clients.hasOwnProperty(client)) {
				client = clients[client];

				if (client.nickname == nickname) {
					return false;
				}
			}
		}
		return true;
	};



};