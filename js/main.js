var GameState = { "stockfish":new Worker("js/stockfish.js"),
				  "board":null,
				  "game":new Chess(),
				  "moves":[],
				  "state":"paused",
				  "chat":[],
				  "player":"w",
				  "computer":"b",
				  "result":"*",
				  "status":null,
				  "inc":0,
  				  "index":0,
				  "orientation":"w",
				  "timeW":null,
				  "timeB":null }

function startGame() {	
	const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
	
	GameState["game"].fen(fen);
	GameState["board"].position(fen);
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes
}

function myResize() {
    //document.getElementById('stat').style.height = (document.getElementById('myBoard').offsetHeight - 120) + 'px';
}

$(document).ready(function() {
	startGame();
});
