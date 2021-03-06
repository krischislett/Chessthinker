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

        if (GameState["orientation"] === "b") {
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
	if (GameState["result"] != "*") {
		return false;
	} else if (GameState["game"].game_over()) {
		return false;
	} else if ((GameState["game"].turn() === 'w' && piece[0] !== "w") ||
               (GameState["game"].turn() === 'b' && piece[0] !== "b")) {
        return false;
    }
	
	return true;
}

function onDrop(source, target) {
	const oldFEN  = GameState["game"].fen();
	const promote = GameState["TEMP_PROMOTE"];
	
    const move = GameState["game"].move({
        from: source,
        to: target,
        promotion: (promote ? promote : 'q')
    });
	
    // Illegal move
    if (move == null) { return 'snapback'; }

	// Need promotion?
	if (move.promotion != null && promote == null) {
		GameState["game"].load(oldFEN);
		console.assert(GameState["game"].fen() == oldFEN);
		GameState["PROMOTE_SOURCE"] = source;
		GameState["PROMOTE_TARGET"] = target;		
		$('#modalPromote').modal('toggle');
		return;
	}
	
	// Only user's moves
	GameState["moves"].push(move);
	
	// Always clear
	GameState["TEMP_PROMOTE"] = null;

	// Immediately increment the index
	GameState["index"]++;
		
	if (!GameState["game"].game_over()) {
		addTime();
		startThink();
	} else {
		const p = GameState["player"];
		const c = GameState["computer"];
		
		const game   = GameState["game"];
		const isDraw = game.in_draw();
		const isWWon = p === "w" && !isDraw;

		if (isWWon) {
			// Assume the player always play White
			GameState["result"] = "1-0";
			
			const oldStatus = isCurrentCourseCompleted();
			
			// The positon being played
			const fen = getSelectedFEN();
			
			// Assume it's always matched and FEN unique
			const x = Courses[getSelectedCourse()].find((x) => x.fen === fen);
			
			x.status = 1;    // Completed
			updateCredits(); // Update the credits

			const newStatus = isCurrentCourseCompleted();

			// Just completed the course?
			if (!oldStatus && newStatus) {
				toggleComplete();
				showReset();
			}
			
			addMessage("White wins by checkmate.");
			toggleCheckmark();
		} else {
			GameState["result"] = "1/2-1/2";
			
			if (game.in_stalemate()) {
				addMessage("Game over. Draw by stalemate");
			} else if (game.in_threefold_repetition()) {
				addMessage("Game over. Draw by three fold repetitions");
			} else if (game.insufficient_material()) {
				addMessage("Game over. Draw by insufficient material");
			}
		}

		hideResign();
	}
	
	reloadUI();
    return move;
}

function startNew() {
	addMessage("");
	GameState["timeW"]  = 30 * 60; // 30 minutes
	GameState["timeB"]  = 10 * 60; // 10 minutes		
	GameState["moves"]  = [];
	GameState["result"] = "*";
	GameState["game"].load(getSelectedFEN());
	//GameState["game"].load("7k/8/8/8/8/8/6R1/5KR1 w - - 0 1");
	//GameState["game"].load("7k/8/5K2/6Q1/8/8/8/8 w - - 0 1");	
	GameState["board"].position(GameState["game"].fen());
	$("#resign").show();
}

function updateGameUI() {
    updateDraws();
    updateChart();
}

function onSnapEnd() {
    GameState["board"].position(GameState["game"].fen())
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
    var moveColor = 'White'
    if (GameState["game"].turn() === 'b') {
        moveColor = 'Black'
    }
	
	const isWTimeOut = GameState["timeW"] != null && GameState["timeW"] <= 0;
	const isBTimeOut = GameState["timeB"] != null && GameState["timeB"] <= 0;

    // Out of time?
    if (isWTimeOut) {
		GameState["result"] = "0-1";
    } else if (isBTimeOut) {
		GameState["result"] = "1-0";
    } else if (GameState["game"].in_checkmate()) {
		if (GameState["game"].fen().includes(" w ")) {
			GameState["result"] = "0-1";
		} else {
			GameState["result"] = "1-0";			
		}
    } else if (GameState["game"].in_draw()) {
		GameState["result"] = "1/2-1/2";
    }

	updateResult();
	updateStatus();
	reloadNavigationButtons();
}

function updateResult() {
	let lines = GameState["game"].pgn().split("\n");
	
	let pgn = "";
	for (var i = 0;i < lines.length; i++){
		if (lines[i].includes("[")) {
			continue;
		}		
		pgn += (lines[i] + "\n");
	}
		
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

GameState["board"] = Chessboard('myBoard', {
    draggable:GameState["player"] == null || GameState["player"][0] != "v",
    onDrop:onDrop,
    onSnapEnd:onSnapEnd,
    onDragStart:onDragStart
});
