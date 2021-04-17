var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

var config; // Engine chart data
var chart;  // Engine evaluation chart

// Dicate when to update the chart
var stockfishChartN = 0;

function reportEval(x) {
    $("#eval").text(x);
}

function updateEval(x) {
    ENGINE_evals[GameState["index"]] = x;
}

function reportMate(isWhiteMate) {
    if (isWhiteMate) {
        reportEval("Forced mate by White");
    } else {
        reportEval("Forced mate by Black");
    }

    updateEval(isWhiteMate ? 9999 : -9999);
}

GameState["stockfish"].onmessage = function(event) {
    let forceUpdate = false;
    const data = event.data ? event.data : "";

    if (data.includes("bestmove")) {
        if (orientationofPlayer == "w") {
            db.doc("g2Rooms/" + gRoom).update({ "wEvals":ENGINE_evals });
        } else if (orientationofPlayer == "b") {
            db.doc("g2Rooms/" + gRoom).update({ "bEvals":ENGINE_evals });
        }
    } else if (data.includes("info depth")) {
        let toks = data.split(" ");

        // Check for validity...
        for (var i = 0; i < toks.length; i++) {
            if (toks[i] === "pv") {
                const fen  = getFEN();
                const val  = toks[i+1];
                const move = (new Chess(fen)).move({ from:val.slice(0,2), to:val.slice(2,4), promotion:'q' });
                if (move == null) {
                    console.log("------------ SKIP ------------");
                    return;
                }
            }
        }

        for (var i = 0; i < toks.length; i++) {
            if (toks[i] === "mate") {
                const val = parseInt(toks[i+1]);
                const isWhiteTurn = getFEN().includes(" w ");
                const isWhiteWon = (isWhiteTurn && val > 0) || (!isWhiteTurn && val < 0);
                reportMate(isWhiteWon);
            } else if (toks[i] === "cp") {
                cp = parseInt(toks[i+1]) / 100
                if (getFEN().includes(" b ")) {
                    cp = -1 * cp
                }
                updateEval(cp);
                $("#eval").text(cp);
            } else if (toks[i] === "pv") {
                const fen  = getFEN();
                const val  = toks[i+1];
                const move = (new Chess(fen)).move({ from:val.slice(0,2), to:val.slice(2,4), promotion:'q' });
                const moveN = Math.floor((GameState["index"]) / 2)+1 + (fen.includes(" b ") ? "..." : ".");
                ENGINE_lines[GameState["index"]] = move; // Best move
                forceUpdate = true;
                $("#line").text(moveN + ENGINE_lines[GameState["index"]].san);
            }
        }

        if (forceUpdate || ((stockfishChartN++ % 10) == 0) ) {
            updateGameUI();
        }
    }
};

function jumpTo(to) {
    const fen = getFEN(to);
    GameState["index"] = to;
    GameState["board"].position(fen, false);
    removeDraws();
    startAnalysis(fen);
    reloadNavigationButtons();
}

function getFEN(i = GameState["index"]) {
    let tmp = new Chess();
    const hist = GameState["game"].history();

    if (i != 0) {
        for (var j = 0; j < i; j++) {
            tmp.move(hist[j]);
        }    
    }
    
    return tmp.fen();
}

function isGameOver(tmp = new Chess(getFEN())) {
    return tmp.in_checkmate() || tmp.in_draw();
}

function moveBegin() {
    if (!isBegin()) { jumpTo(0); return true; }
    return false;
}

function moveEnd() {
    if (!isEnd()) { jumpTo(GameState["game"].history().length); return true; }
    return false;
}

function stepNext() {
    if (!isEnd()) { jumpTo(GameState["index"] + 1); return true; }
    return false;
}

function stepBack() {
    if (!isBegin()) { jumpTo(GameState["index"] - 1); return true; }
    return false;
}

function createCircle(cx, cy) {
    const x = document.createElementNS('http://www.w3.org/2000/svg', "circle");
    x.setAttribute("cx", cx.toString());
    x.setAttribute("cy", cy.toString());
    x.setAttribute("r", "8");
    x.setAttribute("stroke", "blue");
    x.setAttribute("stroke-width", "3");
    x.setAttribute("fill", "blue");
    x.setAttribute("opacity", "0.8");
    return x;
}

function createLine(x1, y1, x2, y2) {
    const x = document.createElementNS('http://www.w3.org/2000/svg', "line");
    x.setAttribute("stroke", "blue");
    x.setAttribute("stroke-width", "4");
    x.setAttribute("stroke-linecap", "round");
    x.setAttribute("marker-end", "url(#arrowhead)");
    x.setAttribute("opacity", "1");
    x.setAttribute("x1", x1.toString());
    x.setAttribute("y1", y1.toString());
    x.setAttribute("x2", x2.toString());
    x.setAttribute("y2", y2.toString());
    x.setAttribute("opacity", "0.8");    
    x.setAttribute("cghash", "blue");
    return x;
}

function parseSquare(x) {
    return { x:x[0].charCodeAt(0) - 'a'.charCodeAt(0), y:parseInt(x[1])-1 };
}

function removeDraws() {
    $("#drawings").empty();
}

function updateDraws() {
    if (GameState["result"] == "*") { return; }
    removeDraws();

    if (!!ENGINE_lines[GameState["index"]]) {
        const sqr = Math.floor($("#drawings").width() / 8);
        let src = parseSquare(ENGINE_lines[GameState["index"]].from);
        let dst = parseSquare(ENGINE_lines[GameState["index"]].to);

        if (orientationofPlayer === "b") {
            src.x = 7 - src.x;
            src.y = 7 - src.y;
            dst.x = 7 - dst.x;
            dst.y = 7 - dst.y;    
        }

        src = { x:(sqr * src.x) + (0.5 * sqr), y:(sqr * (7 - src.y)) + (0.5 * sqr) };
        dst = { x:(sqr * dst.x) + (0.5 * sqr), y:(sqr * (7 - dst.y)) + (0.5 * sqr) };
        
        const line = createLine(src.x, src.y, dst.x, dst.y);
        const circle = createCircle(dst.x, dst.y);

        document.getElementById('drawings').appendChild(line);
        document.getElementById('drawings').appendChild(circle);
    }
}

function initChart() {
    config = { type:'line',
		       data: { labels:[],
               datasets: [{                   
                   borderColor: "black",
                   backgroundColor: "black",
                   pointBorderColor: "black",
                   pointBackgroundColor: "black",
                   pointHoverBorderColor: "black",
                   pointHoverBackgroundColor: "black",
                   lineTension:0, backgroundColor:"red", data:[], fill:false }, { data:[], fill:false }]
             }, options: {
                    onClick: (e) => {
                        const x = chart.getElementsAtXAxis(e);
                        if (!!x) {
                            for (var i = 0; i < x.length; i++) {
                                if (x[i]._datasetIndex == 0) {    
                                    GameState["index"] = parseInt(chart.data.labels[x[i]._index]);
                                    jumpTo(GameState["index"]);
                                    updateChart();
                                }
                            }
                        }
                    },
                    responsive:true,
                    legend: { display:false },
                    elements: { point:{ radius:0 } },
                    scales: {
                        xAxes: [{ gridLines:{ zeroLineColor:"gray" } }],
                        yAxes: [{ gridLines:{ zeroLineColor:"gray"  },
                                  ticks:{ callback: function(value) {
                                              return value == 5 ? "White" : value == -5 ? "Black" : "";
                                          }, suggestedMin:-5, suggestedMax:+5
                                   }
                        }]
			        }
                }
    };
    
    const verticalLinePlugin = {
        getLinePosition: function (chart, pointIndex) {
            const data = chart.getDatasetMeta(0).data;
            return data[pointIndex] ? data[pointIndex]._model.x : null;
        },

        // https://stackoverflow.com/questions/30256695/chart-js-drawing-an-arbitrary-vertical-line
        renderVerticalLine: function (chartInstance, pointIndex, color) {
            const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
            if (lineLeftOffset == null) {
                return;
            }

            const scale = chartInstance.scales['y-axis-0'];
            const context = chartInstance.chart.ctx;
      
            context.beginPath();
            context.strokeStyle = "blue";
            context.lineWidth = 1;
            context.moveTo(lineLeftOffset, scale.top);
            context.lineTo(lineLeftOffset, scale.bottom);
            context.stroke();
      
            context.fillStyle = "green";
            context.textAlign = 'center';
        },

        afterDatasetsDraw: function(x) {
            if (!!x.config.vlines) {                
                x.config.vlines.forEach(i => this.renderVerticalLine(chart, i.key, i.color));
            }
        }
    };

    Chart.plugins.register(verticalLinePlugin);
    Chart.defaults.global.animation.duration = 100;
    chart = new Chart(document.getElementById('chart').getContext('2d'), config);
}

function onDragStart(source, piece, position, orientation) {
    // Do not pick up pieces if the game is over
    if (GameState["game"].game_over()) return false;

    // Lock remote player
    if ((orientationofPlayer == "w" && piece.search(/^b/) !== -1) ) { return false; }
    if ((orientationofPlayer == "b" && piece.search(/^w/) !== -1) ) { return false; }
  
    // Only pick up pieces for the side to move
    if ((GameState["game"].turn() === 'w' && piece.search(/^b/) !== -1) ||
        (GameState["game"].turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target, shouldCmdSend=true) {
    const move = GameState["game"].move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // Illegal move
    if (move === null) { return 'snapback'; }
	
    GameState["index"]++; // Always increment immediately
	sendMove(source, target);
	addTime();
    sendClocks();

    userMovePlayed();
    return move;
}

// Called after a move played by a user
function userMovePlayed() {
    reloadUI();
    startAnalysis();
}

function updateGameUI() {
    updateDraws();
    updateChart();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
    board.position(GameState["game"].fen())
}

function isBegin() {
    return GameState["index"] == 0;
}

function isEnd() {
    return GameState["index"] == GameState["game"].history().length;
}

function reloadNavigationButtons() {
    $("#fa-fast-backward").css("color", isBegin() ? "gray" : "black");
    $("#fa-step-backward").css("color", isBegin() ? "gray" : "black");
    $("#fa-step-forward").css("color", isEnd() ? "gray" : "black");
    $("#fa-fast-forward").css("color", isEnd() ? "gray" : "black");
}

function reloadUI() {
    var status = ''

    var moveColor = 'White'
    if (GameState["game"].turn() === 'b') {
        moveColor = 'Black'
    }
	
	const isWTimeOut = GameState["times"][0] != null && GameState["times"][0] <= 0;
	const isBTimeOut = GameState["times"][0] != null && GameState["times"][1] <= 0;

    // Out of time?
    if (isWTimeOut) {
        status = 'Game over, White is out of Time.';
        sendClocks();
		GameState["result"] = "0-1";
        sendResult();
    } else if (isBTimeOut) {
        status = 'Game over, Black is out of Time.';
        sendClocks();
		GameState["result"] = "1-0";
        sendResult();
    } else if (GameState["game"].in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
		if (GameState["game"].fen().includes(" w ")) {
			GameState["result"] = "0-1";
		} else {
			GameState["result"] = "1-0";			
		}
        sendResult();
    } else if (GameState["game"].in_draw()) {
        status = 'Game over, drawn position';
		GameState["result"] = "1/2-1/2";
        sendResult();
    } else {
        status = (GameState["game"].fen().includes(" w ") ? "White" : "Black") + ' to move'
        if (GameState["game"].in_check()) {
            status += ', ' + moveColor + ' is in check';
			GameState["result"] = "*";
	        sendResult();
        }
    }

	GameState["status"] = status;
	sendResult();
	sendStatus();
	updateResult();
	updateStatus();
	reloadNavigationButtons();
}

function updateResult() {
	let pgn = GameState["game"].pgn();
	if (GameState["result"] != null && GameState["result"] != "*") {
		pgn += (" " + GameState["result"]);
	}
    $pgn.html(pgn);	
}

function updateStatus() {
	$status.html(GameState["status"]);
}

function resizing() {
    board.resize();
}

/*
 * Event handlers
 */

function compare(x, y) {
	return JSON.stringify(x) == JSON.stringify(y);
}

function startGame_(roomID) {
	/*
	db.doc(roomID).onSnapshot((doc) => {
		firebaseUpdated(doc.data());
    });
	
    if (orientationofPlayer == 'w') {
        board.orientation('white')
        document.getElementById('benchbottom').innerHTML = "<div id='left-bench1' class='left-bench1 benchPlayer'>(w) -player-</div><div id='right-bench1' class='right-bench1 benchClock'><section id='clockW'></section></div>";
        document.getElementById('benchtop').innerHTML = "<div id='left-bench2' class='left-bench2 benchPlayer'>(b) -player-</div><div id='right-bench2' class='right-bench2 benchClock'><section id='clockB'></section></div>";    
    } else {
        board.orientation('black')
        document.getElementById('benchtop').innerHTML = "<div id='left-bench1' class='left-bench1 benchPlayer'>(w) -player-</div><div id='right-bench1' class='right-bench1 benchClock'><section id='clockW'></section></div>";
        document.getElementById('benchbottom').innerHTML = "<div id='left-bench2' class='left-bench2 benchPlayer'>(b) -player-</div><div id='right-bench2' class='right-bench2 benchClock'><section id='clockB'></section></div>";    
    }

    document.getElementById('left-bench1').innerHTML = "(w) " + wID;
    document.getElementById('left-bench2').innerHTML = "(b) " + bID;

    initChart();
    updateChart();

    const animateClick = function(x, revert=true) {
        $(x).animate({ color:"gray" }, 100, callback=function() {
            if (revert) {
                $(x).animate({ color:"black" }, 100);
            }
        });
    }

    $("#fa-fast-backward").click(function() {
        if (moveBegin()) {
            //animateClick("#fa-fast-backward", false);
        }
    });

    $("#fa-step-backward").click(function() {
        if (stepBack()) {
            //animateClick("#fa-step-backward");            
        }
    });

    $("#fa-step-forward").click(function() {
        if (stepNext()) {
            //animateClick("#fa-step-forward");
        }
    });

    $("#fa-fast-forward").click(function() {
        if (moveEnd()) {
            //animateClick("#fa-fast-forward", false);
        }
    });

    $("body").keydown(function(e) {
        const code = (e.keyCode || e.which);
        if (code == 37) { stepBack(); }
        if (code == 39) { stepNext(); }
    });
	*/
}

//$(window).resize(board.resize);
//myResize();

//function myResize() {
//    document.getElementById('stat').style.height = (document.getElementById('myBoard').offsetHeight - 120) + 'px';
//}

GameState["board"] = Chessboard('myBoard', {
    draggable:GameState["player"] == null || GameState["player"][0] != "v",
    onDrop:onDrop,
    onSnapEnd:onSnapEnd,
    onDragStart:onDragStart
});