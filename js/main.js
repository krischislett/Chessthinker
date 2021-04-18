var GameState = { "stockfish":new Worker("js/stockfish.js"),
				  "board":null,
				  "game":new Chess(),
				  "moves":[],
				  "state":"paused",
				  "player":"w",
				  "computer":"b",
				  "result":"*",
				  "status":null,
				  "inc":0,
  				  "index":0,
				  "orientation":"w",
				  "timeW":null,
				  "timeB":null }

function myResize() {
    //document.getElementById('stat').style.height = (document.getElementById('myBoard').offsetHeight - 120) + 'px';
}

$(document).ready(function() {
	GameState["state"] = "running";
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes	

	$('#startNew').click(function() {
		startNew();
	});
	
	$('input[type=radio][name=course]').change(function() {
		$("#showCourse").text($('input[name="course"]:checked').val());
	});
	
	$('#level').change(function() {
		$("#showLevel").text($('#level').find(":selected").val());
	});
	

	$('input[type=radio][name=color]').change(function() {
		const color = $('input[name="color"]:checked').val();
		
		if (color === "Red") {
			$(".white-1e1d7").css("background-color", "#f3fcff");
			$(".black-3c85d").css("background-color", "red");			
		} else if (color === "Green") {
			$(".white-1e1d7").css("background-color", "#f3fcff");
			$(".black-3c85d").css("background-color", "green");			
		} else if (color === "Blue") {
			$(".white-1e1d7").css("background-color", "#f3fcff");
			$(".black-3c85d").css("background-color", "#2d6ea7");			
		}
	});
	
	$("#showCourse").text("Beginner");	
	$("#showLevel").text("Level 20");
	
	startNew();
	updateClocks();
	startClocks();	
});
