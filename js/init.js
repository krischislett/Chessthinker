/*
 * Copyright 2020 RJ
 * Released under the American Intercultural Education (AIE) license
 * All rights reserved. Code to be used excluively for AIE products and services.
 */

/*
 * State: "paused" or "running"
 */

var GameState = { "moves":[],
				  "state":"paused",
				  "chat":[],
				  "player":null,
				  "mode":null,
				  "result":null,
				  "status":null,
				  "inc":0,
				  "incType":null,
  				  "index":0,
				  "times":[null, null] } // "paused", "running"

var ENGINE_evals = {} // Engine score evaluations
var ENGINE_lines = {} // Engine move evaluations

var wID = "Player";
var bID = "Player";
var orientationofPlayer = 'w';  // swap board
var orientationOther = 'b';

var gEvent = "Ted Test (Hard coded)";
var gSection = "U1400";
var gRound = "001";
var gBoard = "123";

var dDate = new Date();
var nDate = dDate.toLocaleDateString();

var stockfish = new Worker("js/stockfish.js");

// Iniatialize Game
const queryString = window.location.search;

var Name = 'Any name you want';

$(document).ready(function() {
    const width = $("#myBoard").width();
    $("#annotation").width(width).height(width);
});

function linkToGame() {
    if (window.location.protocol.toUpperCase() == "HTTP:" || window.location.protocol.toUpperCase() == "HTTPS:") {
        var currentURL = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
    } else {
        var currentURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search;      
    }

	const urlParams = new URLSearchParams(window.location.search);
	gRoom  = urlParams.get('room');
	player = urlParams.get('player');
	GameState["player"] = player;

	const roomID = "g2Rooms/" + gRoom

    // Initialize board settings
    var docRef = db.doc(roomID);

    docRef.get().then(function(doc) { 
        if (doc.exists) {
            const boardData = doc.data();
            
            wID = boardData.wID; 
            bID = boardData.bID;
            GameState["result"] = boardData.result;
            GameState["status"] = boardData.status;			

            // Perform analysis but never show it while playing
            if (GameState["result"] != "*") {
                $("#observe").css("visibility", "visible");
                $("#annotation").css("visibility", "visible");
                $("#arena").css("pointer-events","none");
            } else {
                $("#observe").css("visibility", "hidden");                
            }

            const initEngineEvals = function() {
                const evals = orientationofPlayer == "w" ? boardData.wEvals : boardData.bEvals;
                if (!!evals) {
                    Object.keys(evals).forEach(function(key) {
                        ENGINE_evals[key] = evals[key];
                    });
                }
            };

            initEngineEvals();
			
			if (player[0] == "b") {
                orientationofPlayer = 'b'; 
                orientationOther = 'w';
			}

            game = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
			
            if (!!(GameState["moves"] = boardData.moves)) {
                GameState["moves"].forEach(x => {
                    const toks = x.split("-") // Eg: d2-d4
                    console.assert(game.move({
                        from:toks[0],
                        to:toks[1],
                        promotion: 'q' // TODO: always promote to a queen for example simplicity
                    }) != null)
                })
            }

            // Always set the index ASAP
            GameState["index"] = game.history().length;

            // Start the board from database position (or initial position)
            board.position(game.fen(), false)

			GameState["inc"]     = parseInt(boardData.inc);
			GameState["incType"] = parseInt(boardData.incType);

            document.getElementById("gtour").innerHTML    = gEvent
            document.getElementById("ground").innerHTML   = gRound
            document.getElementById("gboard").innerHTML   = gBoard
            document.getElementById("gsection").innerHTML = gSection

            startGame(roomID);
            updateResult();
			updateStatus();
			
			GameState["state"] = "running";
			GameState["times"][0] = boardData.timesW;
			GameState["times"][1] = boardData.timesB;
			
            updateClocks();
			startClocks();				
			
			if (!!boardData.chat) {
				GameState["chat"] = boardData.chat
				let textarea = document.getElementById("RComm")
				textarea.value = GameState["chat"].join("\n");
				textarea.scrollTop = textarea.scrollHeight;		
			}
			
            updateNavigationButtons();			
			GameState["state"] = "running";			
      } else {
          console.log("Room Get Error: Doc Is NULL");
      }
      }).catch(function(e) {
          console.log("Room Not Found: " + e.code + ":" + e.message);
      })
}

function createPairing() {
    if (document.getElementById("playerW_name").value.length == 0 ||
    	document.getElementById("playerB_name").value.length == 0 ) {
        alert("Error: Missing Player(s) name or UID");
        return;
    }

    // Format clock settings
    if (document.getElementById("event_clock_MM").value > 0) {
        HH = Math.floor(document.getElementById("event_clock_MM").value/60); 
        MM = document.getElementById("event_clock_MM").value % 60;
        SS = 0;
    } else {
        HH = 0;
        MM = 0;
        SS = 30;
    }

    // 0=Fischer 1=Bronstein 2=Simple
    incrementType = document.getElementById("event_clock").value;

    if (document.getElementById("event_clock_incr").value.length == 0) { inc = 0 }
    else { inc = document.getElementById("event_clock_incr").value; }

    // show game url links : normally user just click on pairing to be sent to correct room/game board
    var newURL = window.location.protocol + "//" + window.location.host;

    const urlPATH = window.location.pathname.split('/');
    for (var i = 0; i < urlPATH.length - 1; i++) { 
        if (urlPATH.length > 0 ) {
            newURL += "/" + urlPATH[i];     
        } 
    }
	
	const gRoom = Math.random().toString(36).substring(7);	
	const wURL = (newURL + "/g2Chess.html?room=" + gRoom + "&player=white");
	const bURL = (newURL + "/g2Chess.html?room=" + gRoom + "&player=black");
	const vURL = (newURL + "/g2Chess.html?room=" + gRoom + "&player=viewer");

    document.getElementById("wURL").innerHTML = "White: "  + wURL;
    document.getElementById("bURL").innerHTML = "Black: "  + bURL;
    document.getElementById("vURL").innerHTML = "Viewer: " + vURL;

    // Update firstore with paring data (again normally handled outside this program .. for testing only)
    // SET typically is not need in production because only existing room can be entered; as this is test just confirms room exists first before update
    const newDate = nDate.split('/');

    db.doc("g2Rooms/" + gRoom).set({
      msince:firebase.firestore.FieldValue.serverTimestamp() }).catch(function(error) {
        console.log("Create Game Error: " + error.code + ":" + error.message);
    })
	
	// Always keep in seconds
	let time = (3600 * HH) + (60 * MM) + SS;
	
	if (time >= 3600) {
		time = 3599
	}
	
    db.doc("g2Rooms/" + gRoom).update({
		timesW:time,
		timesB:time,
        inc: inc,
		moves: [],
		result: "*",
		status: "",
        incType: incrementType,
        wID: document.getElementById("playerW_name").value,
        bID: document.getElementById("playerB_name").value,
        date: firebase.firestore.FieldValue.serverTimestamp() }).catch(function(e) {
            console.log("Update Game Error: " + e.code + ":" + e.message);
    })
}