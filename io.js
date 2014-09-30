module.exports = function(io) {

	var circles = [];
	var numCirc = 0;
	io.sockets.on('connection', function(socket) {
		socket.on('set_nickname', function(nickname, color, callback) {
			console.log('Setting up nick for' + nickname);

			var nickAvailable = isAvailable(nickname);
			var colorAvailable = isColorAvailable(color);

			if (nickAvailable /*&& colorAvailable*/) {
				socket.nickname = nickname;
				socket.color = color;
				sendMsg('', '', 'User ' + socket.nickname + ' has connected', 'server');
			}

			callback(nickAvailable, true, circles);
		});

		socket.on('message', function(msg) {
			console.log(msg);
			sendMsg(socket.nickname, socket.color, msg, 'user');
		});

		socket.on('disconnect', function() {
			console.log(socket.nickname + ' disconnected');
			var removedCirc = removeCircle(socket.nickname);
			if (socket.nickname) {
				io.sockets.emit('moveCircle', circles);
				sendMsg("", "", socket.nickname + ' left', 'server');
			}
		});

		socket.on('moveCircle', function(x, y, color) {
			console.log(socket.nickname + ' moved his circle to ' + x + ' ' + y);
			var circAdded = circleOps(socket.nickname, x, y, color);
			if (circAdded) io.sockets.emit('moveCircle', circles);
		});
		
	});

	var sendMsg = function(nickname, color, msg, type) {
		io.sockets.emit('message', nickname, color, msg, type);
	};

	var isColorAvailable = function(color) {
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


	var removeCircle = function(nickname){
		for(var i=0; i<circles.length; i++){
			if(circles[i].nickname == nickname){
				circles.splice(i, 1);
				console.log('removed circle ');
				console.dir(circles);
			}
		}
	};
	var circleOps = function(nickname, x, y, color) {
		console.log(circles);
		var circc = circles;
		if (numCirc === 0) {
			var newC = {
				"nickname": nickname,
				"x": x,
				"y": y,
				"color": color
			};
			circles.push(newC);
			numCirc++;
			return true;
		} else {
			for (var i = 0; i < circles.length; i++) {
				if (circles[i].nickname == nickname) {
					circles[i].x = x;
					circles[i].y = y;
					circles[i].color = color;
					return true;
				}
			}
			var cCirc = {
				"nickname": nickname,
				"x": x,
				"y": y,
				"color": color
			};
			circles.push(cCirc);
		}
		return true;
	};



};