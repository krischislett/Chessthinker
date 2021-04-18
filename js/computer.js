
GameState["stockfish"].onmessage = function(event) {
    const data = event.data ? event.data : "";
	
    if (data.includes("bestmove")) {
		const move = data.split(" ")[1];
		const src  = move.substring(0,2);
		const dst  = move.substring(2,4);
		console.log("<==== " + src + " " + dst);
		
		if (GameState["game"].move({ from:src, to:dst, promotion:'q' }) == null) {
			throw "FEN: " + GameState["game"].fen() + " " + src + " " + dst;
    	}
		
		GameState["board"].position(GameState["game"].fen());
    }
};

function startThink() {
	const level = parseInt($('#level').find(":selected").val().replace("Level ", ""));
    GameState["stockfish"].postMessage("stop");	
	GameState["stockfish"].postMessage("setoption name Skill Level value " + level);
    GameState["stockfish"].postMessage("position fen " + GameState["game"].fen());
    GameState["stockfish"].postMessage("go movetime 1000");
}
