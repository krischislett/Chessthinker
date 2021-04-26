
function startClocks() {
	const fen  = GameState["game"].fen();
	const time = fen.includes(" w ") ? "timeW" : "timeB";
	
	if (GameState[time] <= 0) {
		GameState[time] = 0;
	}
	updateClocks();
	
	setTimeout(function() {
		if (GameState["state"] == "running" && GameState["result"] == "*" && GameState["moves"].length && GameState[time] > 0) {
			GameState[time] -= 1.0;
		}
		startClocks();
	}, 1000);
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
