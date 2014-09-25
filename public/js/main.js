$(function() {
	var $login = $("#login"),
		$chat = $("#chat"),
		$message = $("#message");

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
				confUser($(this).val(), $("#color").val());
			}
		});

		var confUser = function(nickname, color) {
			socket.emit('set_nickname', nickname, color, function(nick_available, color_available) {
				if (nick_available && color_available) {
					chatOn(nickname, color);
				} else if(!nick_available && color_available) {
					console.log('Nick not available');
				} else if(nick_available && !color_available){
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

	};

});