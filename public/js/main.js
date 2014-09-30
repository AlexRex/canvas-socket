$(function() {
	var $login = $("#login"),
		$chat = $("#chat"),
		$message = $("#message");


	var canvas = document.getElementById('canvas');
	var circles = [];
	var myCircle = {};
	var ownNickname;

	var colors = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#f1c40f",
	"#e67e22","#e74c3c","#ecf0f1","#16a085","#27ae60","#2980b9","#8e44ad",
	"#2c3e50","#f39c12","#d35400","#c0392b","#bdc3c7"];

	var random = Math.floor((Math.random() * colors.length)),
	ownColor = colors[random];

	var socket = io.connect('/');


	socket.on('connect', function() {
		console.log('Connected with sockets');

		init();
	});

	var init = function() {
		$chat.hide();

		
		$("#enter").click(function() {
			ownNickname = $("#nickname").val();
			confUser(ownNickname, ownColor);

		});
		$("#nickname").keyup(function(e) {
			var code = e.wich || e.keyCode;

			if (code == 13) {
				ownNickname = $(this).val();
				confUser($(this).val(), ownColor);
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

			if (code == 13 && $message.val()!='') {
				sendMessage($message.val());
			}
		});

		socket.on('message', function(nickname, color, msg, type) {
			if(type=='user')
			   addMessage(nickname, color, msg);
			else if(type=='server')
				addServerMessage(msg);
		});

	};

	var sendMessage = function(mess) {
		$message.val('');
		socket.emit('message', mess);
	};

	var addMessage = function(nickname, color, msg) {
		$("#messages").append($("<li><strong><span class='userName' style='color:" + color + ";'>" + nickname + "</span></strong>  " + msg + "</li>"));
		$('ul li:last-child').show('slow', function() {
			$("#mess").scrollTop($("#mess")[0].scrollHeight);});
	};

	var addServerMessage = function(msg){
		$("#messages").append($("<li class='serverMsg'>" + msg + "</li>"));
		$('ul li:last-child').show('slow', function() {
			$("#mess").scrollTop($("#mess")[0].scrollHeight);});
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
		context.strokeStyle = '#033330';
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