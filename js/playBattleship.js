class PlayBattleship {

    // Takes user's created gameboard and ships object from SetupBattleship object
    constructor(gameboard, ships) {

        // User's ship data
        this.ships = ships;

        // Names of ships for ease of iterating cpuShipLocations and userShipLocations
        this.shipNames = ["carrier", "battleship", "cruiser", "submarine", "destroyer"]

        // Locations of squares of ships
        //   Format - "{Number(0-9)}{Number(0-9)}: {Name of Ship}"
        this.cpuShipLocations = {};
        this.userShipLocations = this.initUserShipLocations();

        // Number of squares a ship has left
        this.cpuShipLeft = {
            carrier: 5,
            battleship: 4,
            cruiser: 3,
            submarine: 3,
            destroyer: 2
        }
        this.userShipLeft = {
            carrier: 5,
            battleship: 4,
            cruiser: 3,
            submarine: 3,
            destroyer: 2
        }

        // Represents stage of game
        this.turn;

        // Used for this.turn
        this.Turns = {
            CPU: "CPU",
            USER: "USER"
        }

        /**
         * User's and CPU's gameboards 
         *      -1  - sunk ship
         *      0   - empty
         *      1   - afloat ship
         */
        this.userGameboard = gameboard;
        this.cpuGameboard = [];
        this.simulateCpuGameboard();

        /**
         * User's and CPU's hitboards
         *      -1  - missed ship
         *      0   - empty
         *      1   - hit ship
         */
        this.userHitboard = this.createBoard();
        this.cpuHitboard = this.createBoard();

        // Randomly pick a player to start (0 - User, 1 - CPU)
        this.startGame(this.getRandomInt(2));
    }


    /**
     * Converts locations from ships object to correct format for userShipLocations
     * @returns object to be placed as this.userShipLocations
     */
    initUserShipLocations() {
        var locations = {};
        for (let k = 0; k < 5; k++) {

            this.ships[this.shipNames[k]].location.forEach( (arr) => {
                locations[arr[0]+""+arr[1]] = this.shipNames[k];
            })

        }
        console.log(locations)
        return locations;
    }

    /**
     * Displays start message w/ correct starter and listens for start button press
     * @param {Number} rand 0 or 1 
     */
    startGame(rand) {
        // If random number is 0, user will start, else CPU will start.
        const starter = (rand === 0 ? `<strong>You</strong>` : `The <strong>enemy</strong>`);
        // this.turn = (rand === 0 ? this.Turns.USER : this.Turns.CPU);
        this.turn = this.Turns.USER;

        // Add starter to start message
        $("#starter").append(starter);

        var self = this;

        // Add click listener to start button
        $("#start-button").one("click", { self: self }, function () {
            self.handleGameFlow();
            // Hide the start
            $("#start").hide();
        })
    }

    /**
     * Depending on stage, display appropriate HTML and display correct board
     */
    handleGameFlow() {

        // SHOULD CHECK GAME CONDITIONS FOR WIN
        //this.checkForWin()

        // If its the User's turn to shoot, display the user's hitboard.
        if (this.turn === this.Turns.USER) {

            $("#cpu-aim").hide();
            $("#user-aim").show();
            this.displayBoard("#user-hitboard");

            // If its the CPU's turn to shoot, display the user's gameboard.
        } else if (this.turn === this.Turns.CPU) {

            $("#user-aim").hide();
            $("#cpu-aim").show();
            this.displayBoard("#user-gameboard");
        }
    }

    /**
     * Renders board
     * @param {String} boardID id of board DOM element
     */
    displayBoard(boardID) {
        let row;
        if (boardID === "#user-hitboard") {
            row = "hitrow";
        } else if (boardID === "#user-gameboard") {
            row = "gamerow";
        }

        for (let i = 0; i < 10; i++) {
            // Add row div with num-specific id
            $(boardID).append(`<div id="${row + i}"class="row">`);
            // Append each square individually
            for (let j = 0; j < 10; j++) {
                this.displayBoardSquare(i, j, boardID, row + i);
            }
            // Close row
            $(boardID).append('</div>');

        }

        // Add listeners to squares if user's turn to hit
        if (boardID === "#user-hitboard") {
            this.addHitListeners();

            // Add listener to "Let enemy shoot!" button if CPU's turn to hit
        } else if (boardID === "#user-gameboard") {
            $(document).one("click", "#enemy-aim-shoot-button", { self: self }, function () {
                self.simulateCpuHit();
            })
        }
    }

    /**
     * Based on step and board[][] number (-1, 0, 1), assign style and ID to square
     * and append square HTML
     * @param {Number} i row index of square
     * @param {Number} j column index of square
     * @param {String} boardID id of board (Wuser-hitboard or #user-gameboard)
     */
    displayBoardSquare(i, j, boardID, row) {
        let squareID;
        let color;
        let className;

        // Give specific id and class names based on board
        if (boardID === "#user-hitboard") {

            var status = this.userHitboard[i][j];
            className = "user-hitboard-square";
            squareID = "hitsq" + i + "" + j;

            // Give specific style based on individual square
            if (status == 0) {
                color = "white";
            } else if (status == 1) {
                color = "red";
            } else if (status == -1) {
                color = "grey";
            }

        } else if (boardID === "#user-gameboard") {

            var status = this.userGameboard[i][j];
            className = "user-gameboard-square";
            squareID = "gamesq" + i + "" + j;

            if (status == 0) {
                color = "white";
            } else if (status == 1) {
                color = "darkblue";
            } else if (status == -1) {
                color = "red";
            }
        }

        // Append gamesquare to appropriate row w/ index specific id
        $(boardID).children("#" + row).append(`<div id=${squareID} class="${className} col"></div>`);
        $("#" + squareID).css("background-color", color);
    }

    /**
     *       
     */
    handleUserHit(id) {
        // idArr = ['h', 'i', 't', 's', 'q', *i, *j]
        var idArr = id.split("");
        const i = parseInt(idArr[5]);
        const j = parseInt(idArr[6]);

        // Check if square has been hit by user before
        if (this.userHitboard[i][j] !== 0) {

            // Display message that that spot has been hit before
            $("#user-hit-before").fadeIn("slow", function () {
                $("#user-hit-before").fadeOut(1000);
            });

            // Add listeners back to user's hitboard squares
            this.addHitListeners();
            return;
        }

        let message;

        // Check if CPU's gameboard has no ship there
        if (this.cpuGameboard[i][j] == 0) {

            // Change user's hitboard to reflect a miss
            this.userHitboard[i][j] = -1;

            // Change square's color to grey
            $("#"+id).css("background-color", "grey");

            message = "Sorry, you missed! Better luck next time.";

            // Check if CPU's gameboard has a ship there
        } else if (this.cpuGameboard[i][j] == 1) {

            // Change square's color to red
            $("#"+id).css("background-color", "red");

            // Change user's hitboard to reflect a hit
            this.userHitboard[i][j] = 1;

            // Mark the CPU's gameboard with a hit ship
            this.cpuGameboard[i][j] = -1;

            // Grab name of ship
            const ship = this.cpuShipLocations[i + "" + j];

            // Subtract a square from ship that was hit
            this.cpuShipLeft[ship] -= 1;

            // If the ship that was hit has no squares left, display sunk message.
            if (this.cpuShipLeft[ship] === 0) {
                message = `Wow! You sunk the enemy's ${ship}! Way to go!`;
            } else {

                // If it has more squares left, display hit message.
                message = `Boom! You hit the enemy's ${ship}!`;
            }

            // Remove that square from the cpu's ship locations
            delete this.cpuShipLocations[i + "" + j]

        }

        // Display message
        $("#user-aim-main-message").empty().append(message);

        // Change game's turn
        this.turn = this.Turns.CPU;

        // Add listener to continue button
        var self = this;
        $(document).one("click", "#user-aim-continue-button", { self: self }, function () {
            self.handleGameFlow();
        })

    }

    /**
     * Adds listeners to hitboard squares
     */
    addHitListeners() {

        var self = this;
        $(document).one("click", ".user-hitboard-square", { self: self }, function () {
            self.handleUserHit(this.id);
        });

    }

    /** 
     * @returns 10x10 2D Number Array filled with 0's
    */
    createBoard() {

        let board = [];

        // Fill 10x10 2D array with 0's
        for (let i = 0; i < 10; i++) {

            board.push([]);

            for (let j = 0; j < 10; j++) {
                board[i].push(0);
            }

        }

        return board;
    }

    /**
     * Simulates CPU's board of ships by calling other helper functions
     */
    simulateCpuGameboard() {

        // Create CPU board
        this.cpuGameboard = this.createBoard();

        // Iterates through ships
        for (let k = 0; k < this.shipNames.length; k++) {

            // Length of end of ship
            const len = this.ships[this.shipNames[k]]['length'] - 1;

            // i,j: stern indices - two random integers (0-9)
            // dir: direction of bow - random integer (0, 1, 2, 3 == up, down, left, right)
            var i, j, dir;
            let placed = false;

            // Generate new indices and direction until ship is be placed
            while (!placed) {

                [i, j, dir] = this.getNewIJDir();

                if (this.shipWorks(i, j, len, dir)) {

                    this.placeShip(this.shipNames[k], i, j, len, dir);
                    placed = true;

                }
            }
        }
        console.log(this.cpuGameboard);
    }

    /**
     * If ship fits on map, return true, else false.
     * @param {Number} i row index of stern
     * @param {Number} j column index of stern
     * @param {Number} len length of ship
     * @param {Number} dir direction of bow of ship from stern
     * @returns 
     */
    shipWorks(i, j, len, dir) {

        // 1. Check if indices are on a ship
        if (this.cpuGameboard[i][j] !== 0) {
            return false;
        }

        // 2. Check if dir/len allow ship to fit w/in bounds of map
        if (!this.shipFitsOnMap(i, j, len, dir)) {
            return false;
        }

        // 3. Check if another ship is in the way
        if (!this.shipCanBePlaced(i, j, len, dir)) {
            return false;
        }

        return true;
    }

    /**
     * If ship's length and direction allow it to fit on the map,
     * from the location of the stern, return true; else false.
     * @param {Number} i row index of stern
     * @param {Number} j column index of stern
     * @param {Number} len length of ship
     * @param {Number} dir direction of bow from stern
     * @returns bool
     */
    shipFitsOnMap(i, j, len, dir) {
        // If dir == 0 == up AND bow would be out of bounds
        if (dir == 0 && (i - len) < 0) {
            return false;
            // If dir == 1 == down AND bow would be out of bounds
        } else if (dir == 1 && (i + len) > 9) {
            return false;
            // If dir == 2 == left AND bow would be out of bounds
        } else if (dir == 2 && (j - len) < 0) {
            return false;
        } else if (dir == 3 && (j + len) > 9) {
            return false;
        } else {
            return true;
        }

    }

    /**
     * Checks if there are any other ships in ship-to-be-placed's way
     * @param {Number} i row index of stern
     * @param {Number} j column index of stern
     * @param {Number} len length of ship
     * @param {Number} dir direction of bow of ship from stern
     * @returns true if ship can be placed, false otherwise
     */
    shipCanBePlaced(i, j, len, dir) {
        // If dir == 0 == up
        if (dir == 0) {
            for (let k = i; k > (i - len); k--) {

                if (this.cpuGameboard[k][j] !== 0) {
                    return false;
                }

            }
            // If dir == 1 == down
        } else if (dir == 1) {
            for (let k = i; k < (i + len); k++) {

                if (this.cpuGameboard[k][j] !== 0) {
                    return false;
                }

            }
            // If dir == 2 == left
        } else if (dir == 2) {
            for (let k = j; k > (j - len); k--) {

                if (this.cpuGameboard[i][k] !== 0) {
                    return false;
                };

            }
            // If dir == 3 == right
        } else if (dir == 3) {
            for (let k = j; k < (j + len); k++) {

                if (this.cpuGameboard[i][k] !== 0) {
                    return false;
                };

            }
        }

        return true;
    }

    /**
     * Places 1s to represent ship on this.cpuGameboard
     * @param {String}
     * @param {Number} i row index of stern
     * @param {Number} j column index of stern
     * @param {Number} len length of ship
     * @param {Number} dir direction of bow of ship from stern
     */
    placeShip(ship, i, j, len, dir) {
        // If dir == 0 == up
        if (dir == 0) {

            for (let k = i; k >= (i - len); k--) {
                this.cpuGameboard[k][j] = 1;
                this.cpuShipLocations[k + "" + j] = ship;
                // this.cpuShipLocations[ship].push([k, j]);
            }

            // If dir == 1 == down
        } else if (dir == 1) {

            for (let k = i; k <= (i + len); k++) {
                this.cpuGameboard[k][j] = 1;
                this.cpuShipLocations[k + "" + j] = ship;
                // this.cpuShipLocations[ship].push([k, j]);
            }

            // If dir == 2 == left
        } else if (dir == 2) {

            for (let k = j; k >= (j - len); k--) {
                this.cpuGameboard[i][k] = 1;
                this.cpuShipLocations[i + "" + k] = ship;
                // this.cpuShipLocations[ship].push([i, k]);
            }

            // If dir == 3 == right
        } else if (dir == 3) {

            for (let k = j; k <= (j + len); k++) {
                this.cpuGameboard[i][k] = 1;
                this.cpuShipLocations[i + "" + k] = ship;
                // this.cpuShipLocations[ship].push([i, k]);
            }

        }
        return;

    }

    /**
     * Generates indices and direction for placing stern of ship
     * @returns i, j, dir for placing stern of ship
     */
    getNewIJDir() {
        return [this.getRandomInt(10), this.getRandomInt(10), this.getRandomInt(4)];
    }

    /**
     * @param {Number} max 
     * @returns random integer < max and > 0
     */
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    /**
     * Generates random i, j.
     * Checks if spot has been already targeted at on own hitboard:
     *      Not hit: continue
     *      Hit: generate new random i, j
     * Check user board for ship (on userboard: 1 if ship, 0 if missed)
     *      Hit: display message that enemy has hit one ship
     *          change userboard at spot to -1
     *          change cpu hitboard at spot to 1
     *          check if whole ship has been sunk
     *              Sunk: display message, enemy has sunk your ship
     *              Not sunk: do nothing
     *      Missed: display message that enemy has missed your ship
     *            change cpu hitboard at spot to -1
     * Continue with game
     */
    simulateCpuHit() {

    }
}