var GameState = { "stockfish":new Worker("js/stockfish.js"),
				  "board":null,
				  "game":new Chess(),
				  "moves":[],
				  "state":"paused",
				  "chat":[],
				  "player":null,
				  "mode":null,				
				  "result":null,
				  "status":null,
				  "inc":0,
  				  "index":0,
				  "orientation":"w",
				  "timeW":null,
				  "timeB":null }

function startGame() {	
	const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
	
	GameState["game"].fen(fen);
	console.log(GameState["game"]);
	
	console.log("---------")
	GameState["board"].position(fen)
	
}

$(document).ready(function() {
	startGame();
});
