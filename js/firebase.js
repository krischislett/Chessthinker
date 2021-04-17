
function sendChat(actionTYPE) {
   const msg = document.getElementById("txtMessage").value;
   document.getElementById("txtMessage").value = "";
   db.doc("g2Rooms/" + gRoom).update({
   		chat:firebase.firestore.FieldValue.arrayUnion(msg),
   });
}

function sendMove(src, dst) {
    db.doc("g2Rooms/" + gRoom).update({
        moves:firebase.firestore.FieldValue.arrayUnion(src + "-" + dst)
    });	
}

function sendStatus() {
	if (GameState["player"][0] == "v") {
		return;
	}
	
    db.doc("g2Rooms/" + gRoom).update({ status:GameState["status"]});
}

function sendResult(x) {
	if (GameState["player"][0] == "v") {
		return;
	}
	
    db.doc("g2Rooms/" + gRoom).update({ result:GameState["result"] });
}

function sendClocks() {
	if (GameState["player"][0] != "w") { // Only white players send clock times...
		return;
	}
	
    db.doc("g2Rooms/" + gRoom).update({
    	timesW:GameState["times"][0],
        timesB:GameState["times"][1],
    });
}

function firebaseUpdated(data) {
	const moves = data.moves;
	
	// Has the game updated?
	if (moves != null && !compare(moves, GameState["moves"])) {
		var oldMoves = GameState["moves"] || [];
		var newMoves = moves;
		
		// A single move played?
		if ((newMoves.length - oldMoves.length) == 1) {
			const tmp = newMoves.slice(0, -1);
			if (compare(tmp, oldMoves)) {
				const move = newMoves[newMoves.length - 1];
				const src  = move.split("-")[0];
				const dst  = move.split("-")[1];
				
				// Move played on the board
                if (onDrop(src, dst, false)) {
                    board.position(game.fen())
                }
			}
		}
	}
	
	GameState["moves"]    = data.moves   // Always sychronized
	GameState["result"]   = data.result; // Always sychronized
	GameState["status"]   = data.status; // Always sychronized	
	GameState["times"][0] = data.timesW; // Always sychronized
	GameState["times"][1] = data.timesB; // Always sychronized
	
	if (!!data.chat && data.chat !== GameState["chat"]) {
		GameState["chat"] = data.chat;
		let textarea = document.getElementById("RComm")
		textarea.value = GameState["chat"].join("\n");		
		textarea.scrollTop = textarea.scrollHeight;		
	}
	
	if ((GameState["result"] != data.result) || (GameState["status"] != data.status)) {
		updateResult();
		updateStatus();		
	}	
}
