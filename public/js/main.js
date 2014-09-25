$(function() {
	var $login = $("#login"),
		$chat = $("#chat"),
		$message = $("#message");


	var canvas = document.getElementById('canvas');
	var circles = [];
	var myCircle = {};
	var ownNickname, ownColor;

	var socket = io.connect('/');


	socket.on('connect', function() {
		console.log('Connected with sockets');

		init();
	});

	var init = function() {
		$chat.hide();

		$("#color").val("#" + Math.floor((Math.random() * 999999) + 1));

		$("#enter").click(function() {
			ownNickname = $("#nickname").val();
			ownColor = $("#color").val();
			confUser(ownNickname, ownColor);

		});
		$("#nickname").keyup(function(e) {
			var code = e.wich || e.keyCode;

			if (code == 13) {
				ownNickname = $(this).val();
				ownColor = $("#color").val();
				confUser($(this).val(), $("#color").val());
			}
		});

		drawCanvas();
		canvas.addEventListener('click', function(evt){
			refresh(evt);
		}, false);

		socket.on('moveCircle', function(newCircles){
			circles = newCircles;
			addNews();
		});

	};

	var confUser = function(nickname, color) {
		socket.emit('set_nickname', nickname, color, function(nick_available, color_available, newCircles) {
			if (nick_available && color_available) {
				circles = newCircles;
				addNews();
				chatOn(nickname, color);

			} else if (!nick_available && color_available) {
				console.log('Nick not available');
			} else if (nick_available && !color_available) {
				console.log('Color not available');
			} else console.log('Nick and color not available');
		});
	};

	var chatOn = function(nickname, color) {
		$login.hide();
		$chat.show();

		$message.keyup(function(e) {
			var code = e.wich || e.keyCode;

			if (code == 13) {
				sendMessage($message.val());
			}
		});

		socket.on('message', function(nickname, color, msg) {
			addMessage(nickname, color, msg);
		});

	};

	var sendMessage = function(mess) {
		$message.val('');
		socket.emit('message', mess);
	};

	var addMessage = function(nickname, color, msg) {
		$("#messages").append($("<li><h3 style='color:" + color + ";'>" + nickname + "</h3>  " + msg + "</li>"));
	
	};


	var refresh = function(evt) {
		var context = canvas.getContext('2d');
		var mousePos = getMousePos(canvas, evt);

		canvas.width = canvas.width;


		drawCircle(myCircle.x, myCircle.y, ownColor);


		myCircle = {
			"nickname": ownNickname,
			"color": ownColor,
			"x": mousePos.x,
			"y": mousePos.y
		};

		for(var i = 0; i<circles.length; i++){
			if(myCircle.nickname != circles[i].nickname){
				circle = circles[i];
				
				drawCircle(circle.x, circle.y, circle.color);
			}
		}

		socket.emit('moveCircle', mousePos.x, mousePos.y, ownColor);
	};

	var addNews = function(){
		var context = canvas.getContext('2d');
		canvas.width = canvas.width;

		drawCircle(myCircle.x, myCircle.y, ownColor);

		for(var i = 0; i<circles.length; i++){
			if(myCircle.nickname != circles[i].nickname){
				circle = circles[i];
				
				drawCircle(circle.x, circle.y, circle.color);
			}
		}

	};

	var drawCanvas = function() {
		var context = canvas.getContext('2d');


		var rand = Math.floor((Math.random()*500)+1),
			rand2 = Math.floor((Math.random()*500)+1);


		drawCircle(rand, rand2, ownColor);

		myCircle = {
			"nickname": ownNickname,
			"color": ownColor,
			"x": rand,
			"y": rand2
		};



	};


	var drawCircle = function(x, y, color){

		var context = canvas.getContext('2d');
		context.beginPath();
		context.arc(x, y, 20, 0, 2 * Math.PI, false);
		context.fillStyle = color;
		context.fill();
		context.lineWidth = 5;
		context.strokeStyle = '#003300';
		context.stroke();
	};


	var getMousePos = function(canvas, evt){
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};



});