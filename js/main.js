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

function initGame() {
	GameState["state"] = "running";
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes	
}

function myResize() {
    //document.getElementById('stat').style.height = (document.getElementById('myBoard').offsetHeight - 120) + 'px';
}

$(document).ready(function() {
	$('#startNew').click(function() {
		startNew();
	});
	
	$('input[type=radio][name=course]').change(function() {
		$("#showCourse").text($('input[name="course"]:checked').val());
	});
	
	$('#level').change(function() {
		$("#showLevel").text($('#level').find(":selected").val());
	});
	
	$("#showCourse").text("Beginner");	
	$("#showLevel").text("Level 20");
	
	startNew();
	updateClocks();
	startClocks();	
});

initGame();