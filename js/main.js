var GameState = { "stockfish":new Worker("js/stockfish.js"),
				  "board":null,
				  "game":new Chess(),
				  "moves":[],
				  "state":null,
				  "player":"w",
				  "computer":"b",
				  "result":"*",
				  "status":null,
				  "inc":0,
  				  "index":0,
				  "orientation":"w",
				  "TEMP_PROMOTE":null,
				  "timeW":null,
				  "timeB":null }

function getSelectedCourse() {
	return $(".selected-set-button").text().replace(" ", "");
}

function getSelectedFEN() {
	return Courses[getSelectedCourse()][getSelectedID()].fen;
}

function updateFENs() {
	const course = getSelectedCourse();
	if (course == null || course.length == 0) {
		return;
	}
	
	$("#fens").empty();	
	const fens = Courses[course];
	const selected = getSelectedID();

	if (selected != null) {
		$.each(fens, function (i, item) {
		    $("#fens").append($('<option>', {
		        value: item.id,
		        text : item.id,
				selected: item.id == (selected+1)
		    }));
		});
	}
}

function updateCredits() {	
	const key = getSelectedCourse();
	if (Courses[key] == null) {
		return;
	}
	$(".creditTitle").text(key);	
	for (var i = 0; i < Courses[key].length; i++) {
		const next = $(".cell-" + i).next();
		next.empty();
		if (Courses[key][i].status) {
			next.prepend($('<img>',{width:'20', height:'20', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Checkmark_green.svg/1200px-Checkmark_green.svg.png'}));
		}
	}
}

function updateBoardColor() {
	const color = $('input[name="color"]:checked').val();		
	if (color === "Red") {
		$(".white-1e1d7").css("background-color", "#f3fcff");
		$(".black-3c85d").css("background-color", "red");			
	} else if (color === "Green") {
		$(".white-1e1d7").css("background-color", "#eeeed5");
		$(".black-3c85d").css("background-color", "#769655");			
	} else if (color === "Blue") {
		$(".white-1e1d7").css("background-color", "#f3fcff");
		$(".black-3c85d").css("background-color", "#2d6ea7");			
	} else if (color === "Brown") {
		$(".white-1e1d7").css("background-color", "#f3fcff");
		$(".black-3c85d").css("background-color", "#CD853F");			
	}
}

function isCurrentCourseCompleted() {
	const tmp = Courses[getSelectedCourse()];
	for (var i = 0; i < tmp.length; i++) {
		if (tmp[i].status == 0) {
			return false;
		}
	}
	
	return true;
}

function getSelectedID() {
	return parseInt($(".selected-cell").attr("id"));
}

function toggleComplete() {
	$('#modalComplete').modal('toggle');
}

function toggleCheckmark() {
	$('#modalCheckmark').modal('toggle');
}

function startGame() {
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes	
	
	if (GameState["state"] == null) {
		updateClocks();
		startClocks();			
	}

	GameState["state"] = "running";		
	startNew();	
}

function showReset() {
	$('#reset').show();
}

$(document).ready(function() {
	/*
	for (var key in Courses) {
		for (var i = 0; i < Courses[key].length; i++) {
			if (i != 2) {
				Courses[key][i].status = 1;				
			} else {
				Courses[key][i].status = 0;								
			}
		}
	}
	*/
	
	$(".cell1").each(function() {
		$(this).attr("id", $(this).text()-1);
		$(this).addClass("cell-" + ($(this).text()-1));
	});

	$(".cell1").click(function() {
		const course = getSelectedCourse();
		if (course == null || course.length == 0) {
			alert("Please select a course!");
			return;
		}
		
		$(".selected-cell").removeClass("selected-cell");
		$(this).addClass("selected-cell");
		startGame();
		updateFENs();
	});

	/*
	 * Add credits information to the courses
	 */
	
	for (var key in Courses) {
		for (var i = 0; i < Courses[key].length; i++) {			
			Courses[key][i].status = 0;
		}
		$("#credits").append($('<option>', { 
	        value: key,
	        text : key 
	    }));
	}
	
	$('#fens').change(function() {
		$(".selected-cell").removeClass("selected-cell");
		const val = $('#fens').find(":selected").val()-1;
		$(".cell-" + parseInt(val)).addClass("selected-cell");
		startGame();
	});

	$('#credits').change(function() {
		updateCredits();
	});

	$('input[type=radio][name=color]').change(function() {
		updateBoardColor();
	});
	
	$(".set-button").click(function() {
		$(".selected-set-button").removeClass("selected-set-button");
		$(this).addClass("selected-set-button");
		updateCredits();
		updateFENs();
	});
	
	$(".promoteQ").click(function() {
		console.log("Promoting to queen");
		$('#myModal').modal('hide');
		GameState["TEMP_PROMOTE"] = "q";
		onDrop(GameState["PROMOTE_SOURCE"], GameState["PROMOTE_TARGET"]);
		GameState["TEMP_PROMOTE"] = null;
		GameState["board"].position(GameState["game"].fen());
	});

	$(".promoteR").click(function() {
		console.log("Promoting to rook");
		$('#myModal').modal('hide');
		GameState["TEMP_PROMOTE"] = "r";
		onDrop(GameState["PROMOTE_SOURCE"], GameState["PROMOTE_TARGET"]);
		GameState["TEMP_PROMOTE"] = null;
		GameState["board"].position(GameState["game"].fen());
	});

	$(".promoteB").click(function() {
		console.log("Promoting to knight");
		$('#myModal').modal('hide');
		GameState["TEMP_PROMOTE"] = "b";
		onDrop(GameState["PROMOTE_SOURCE"], GameState["PROMOTE_TARGET"]);
		GameState["TEMP_PROMOTE"] = null;
		GameState["board"].position(GameState["game"].fen());
	});

	$(".promoteN").click(function() {
		console.log("Promoting to pawn");
		$('#myModal').modal('hide');
		GameState["TEMP_PROMOTE"] = "n";
		onDrop(GameState["PROMOTE_SOURCE"], GameState["PROMOTE_TARGET"]);
		GameState["TEMP_PROMOTE"] = null;
		GameState["board"].position(GameState["game"].fen());
	});
	
	$("#resign").click(function() {
		alert("You have resigned for the position. Please try again.");
		GameState["result"] = "0-1"; // Always player play White
		$("#resign").hide();
	});
	
	$("#modalCompleteClose").click(function() {
		$('#modalComplete').modal('toggle');
	});

	$("#modalCheckmarkClose").click(function() {
		$('#modalCheckmark').modal('toggle');
	});
	
	$("#reset").click(function() {		
		$("#reset").hide();
		
		const key = getSelectedCourse();
		for (var i = 0; i < Courses[key].length; i++) {
			Courses[key][i].status = 0;								
		}

		updateCredits();
	});
	
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes	
	
	updateClocks();
	updateBoardColor();
});
