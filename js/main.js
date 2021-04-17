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
	GameState["state"] = "running";
	GameState["board"].position(fen);
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes
	
	$("#showCourse").text("Beginner");	
	$("#showLevel").text("Level 20");

	updateClocks();
	startClocks();
}

function myResize() {
    //document.getElementById('stat').style.height = (document.getElementById('myBoard').offsetHeight - 120) + 'px';
}

$(document).ready(function() {
	startGame();
	
	$('input[type=radio][name=course]').change(function() {
		$("#showCourse").text($('input[name="course"]:checked').val());
	});
	
	$('#level').change(function() {
		$("#showLevel").text($('#level').find(":selected").val());
	});	
});
