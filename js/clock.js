
function startClocks() {
	if (GameState["result"] != "*") {
		return;
	}
	
	const fen = game.fen();
	let x = 0; if (fen.includes(" b ")) { x = 1; }
		
	if (GameState["times"][x] <= 0) {
		GameState["times"][x] = 0;
		if (x == 0) {
			document.getElementById("clockW").innerHTML = "00:00";
			reloadUI();
		} else {
			document.getElementById("clockB").innerHTML = "00:00";
			reloadUI();
		}
	} else {
		if (GameState["state"] == "running" && GameState["times"][x]) {
			setTimeout(function() {
				if (GameState["moves"].length) {
					GameState["times"][x] -= 1.0;
					updateClocks(x);
					startClocks(x);
					sendClocks();
				} else {
					startClocks(x);					
				}
			}, 1000);
		}
	}
}

function addTime() {
	const fen = GameState["game"].fen();
	if (fen.includes(" w ")) {
		GameState["timeW"] += GameState["inc"];
	} else {
		GameState["timeB"] += GameState["inc"];
	}	
}

function formatTime(x) {
	return new Date(x * 1000).toISOString().substr(14, 5);
}

function updateClocks() {
	document.getElementById("clockW").innerHTML = formatTime(GameState["times"][0]);		
	document.getElementById("clockB").innerHTML = formatTime(GameState["times"][1]);
}
