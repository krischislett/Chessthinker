
function startClocks() {
	if (GameState["result"] != "*") {
		return;
	}
	
	const fen  = GameState["game"].fen();
	const time = fen.includes(" w ") ? "timeW" : "timeB";
	
	if (GameState[time] <= 0) {
		GameState[time] = 0;
		updateClocks();
	} else {
		setTimeout(function() {
			if (GameState["state"] == "running" && GameState[time] > 0) {
				if (GameState["moves"].length || true) {
					GameState[time] -= 1.0;
					updateClocks();
				}				
			}	
			startClocks();
		}, 1000);		
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
	$("#clockW").text(formatTime(GameState["timeW"]));
	$("#clockB").text(formatTime(GameState["timeB"]));
}
