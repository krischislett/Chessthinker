## Note:

To run Stockfish locally, please run:

    python -m SimpleHTTPServer 8000
    
For more details, check https://stackoverflow.com/questions/21408510/chrome-cant-load-web-worker

Then access it with http://localhost:8000/g2Chess.html. Web worker isn't necessary on production:

* http://smallchess.com/Johnson/g2Chess.html

## Notes:

* In observe mode, use the keyboard backward and forward arrows to move backward and forward in the game.
* Game logics are in `chessgames.js`.
* https://console.firebase.google.com/u/3/project/fir-rtc-69add/firestore/data~2Fg2Rooms~2F796c8391-c88f-473a-9409-2949026eb5af
