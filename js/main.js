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

function getSelectedCourse() {
	return $('input[name="course"]:checked').val();
}

function getSelectedCreditCourse() {
	return $('#credits').find(":selected").text();
}

function getSelectedFEN() {
	return $('#fens').find(":selected").text();
}

function getSelectedLevel() {
	return $('#level').find(":selected").val();
}

function updateFENs() {
	const fens = Courses[$('input[name="course"]:checked').val()];

	$("#fens").empty();
	$.each(fens, function (i, item) {
	    $("#fens").append($('<option>', { 
	        value: item.id,
	        text : item.fen 
	    }));
	});	
}

function updateCredits() {	
	const key = getSelectedCreditCourse();
	if (Courses[key] == null) {
		return;
	}	
	$("#creditContainer").show();
	$("#creditTitle").text(key);	
	for (var i = 0; i < Courses[key].length; i++) {
		if (Courses[key][i].status) {
			const next = $(".cell-" + i).next();
			next.empty();
			next.prepend($('<img>',{width:'20', height:'20', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Checkmark_green.svg/1200px-Checkmark_green.svg.png'}));
		}
	}	
}

$(document).ready(function() {	
	/*
	if (false) {
		Courses = {};
		Courses['Beginner'] = [     { 'id':1, 'fen':'1r6/1r5k/8/8/K7/6R1/6R1/8 w - - 0 1' } ];
		Courses['Intermediate'] = [ { 'id':1, 'fen':'1r6/1r5k/8/8/K7/6R1/6R1/8 w - - 0 1' } ];		
	}
	*/
	
	$(".cell1").each(function() {
		$(this).addClass("cell-" + ($(this).text()-1));
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
	
	GameState["state"] = "running";
	GameState["timeW"] = 30 * 60; // 30 minutes
	GameState["timeB"] = 10 * 60; // 10 minutes	

	$('#startNew').click(function() {
		startNew();
	});
	
	$('input[type=radio][name=course]').change(function() {
		$("#showCourse").text($('input[name="course"]:checked').val());
		updateFENs();
	});
	
	$('#level').change(function() {
		$("#showLevel").text(getSelectedLevel());
	});

	$('#credits').change(function() {
		updateCredits();
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
		} else if (color === "Brown") {
			$(".white-1e1d7").css("background-color", "#f3fcff");
			$(".black-3c85d").css("background-color", "#CD853F");			
		}
	});
	
	$("#showCourse").text("Beginner");	
	$("#showLevel").text("Level 20");
	
	updateFENs();	
	updateClocks();
	startClocks();
	startNew();
});
