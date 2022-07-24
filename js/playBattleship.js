class PlayBattleship {

    // Takes user's created gameboard and ships object from SetupBattleship object
    constructor(gameboard, ships) {

        // Randomly pick a player to start (0 - User, 1 - CPU)
        this.startGame(this.getRandomInt(2));

        // User's gameboard
        this.userBoard = gameboard;

        // User's ship data
        this.ships = ships;

        // Names of ships for ease of iterating cpuShipLocations and userShipLocations
        this.shipNames = ["carrier", "battleship", "cruiser", "submarine", "destroyer"]

        // Holds i,j indices of all squares of CPU's ships
        this.cpuShipLocations = {
            carrier: [],
            battleship: [],
            cruiser: [],
            submarine: [],
            destroyer: []
        }

        // Copy location from userShips to easier-to-access object
        this.userShipLocations = {
            carrier: ships.carrier.location.map((x)=>x),
            battleship: ships.battleship.location.map((x)=>x),
            cruiser:ships.cruiser.location.map((x)=>x),
            submarine: ships.submarine.location.map((x)=>x),
            destroyer: ships.destroyer.location.map((x)=>x)
        }

        // CPU's gameboard
        this.cpuBoard = [];
        this.simulateCpuBoard();

        // User's hitboard
        this.userHitBoard = this.createBoard();

        // CPU's hitboard
        this.cpuHitBoard = this.createBoard();

        // Represents stage of game
        this.stage;

        // Used for this.stage
        this.Stages = {
            // CPU is preparing to hit
            CPU_AIM,
            // CPU has shot
            CPU_HIT,
            // User is preparing to hit
            USER_AIM,
            // User has shot
            USER_HIT
        }
    }

    /**
     * Displays start message w/ correct starter and listens for start button press
     * @param {Number} rand 0 or 1 
     */
    startGame(rand){
        // If random number is 0, user will start, else CPU will start.
        const starter = (rand === 0 ? `<strong>You</strong>` : `The <strong>enemy</strong>`);
        this.turn = (rand === 0 ? this.Stages.CPU_AIM : this.Stages.USER_AIM);

        // Add starter to start message
        $("#starter").append(starter);

        var self = this;

        // Add click listener to start button
        $("#start-button").one("click", {self: self}, function() {
            self.handleStartButton();
        })
    }

    /**
     * Depending on who starts, load appropriate HTML and display correct board
     */
    handleStartButton() {
        var self = this;
        if (this.stage === this.Stages.USER_AIM) {
            $("#main-container").empty().load("pages/game/userAim.html", {self:self}, function() {
                self.displayUserHitBoard();
            });

        } else if (this.stage === this.Stages.CPU_AIM) {
            $("#main-container").empty().load("pages/game/cpuAim.html", {self:self}, function() {
                self.displayCPUHitBoard();
            });
        }
    }

    /**
     * Renders userHitBoard on userAim.html
     * Adds click listeners to squares and continue button
     */
    displayUserHitBoard() {
        for (let i = 0; i < 10; i++) {
            // Add row div with num-specific id
            $("#user-hitboard").append(`<div id="${"row" + i}"class="row">`);
            // Append each square individually
            for (let j = 0; j < 10; j++) {
                this.setupGameboardHTMLSquare(i, j);
            }
            // Close row
            $("#setup-gameboard").append('</div>');
        }
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
    simulateCpuBoard() {
        
        // Create CPU board
        this.cpuBoard = this.createBoard();

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
        console.log(this.cpuBoard)
        console.log(this.cpuShipLocations);
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
        if (this.cpuBoard[i][j] !== 0) {
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

                if (this.cpuBoard[k][j] !== 0) {
                    return false;
                }

            }
            // If dir == 1 == down
        } else if (dir == 1) {
            for (let k = i; k < (i + len); k++) {

                if (this.cpuBoard[k][j] !== 0) {
                    return false;
                }

            }
            // If dir == 2 == left
        } else if (dir == 2) {
            for (let k = j; k > (j - len); k--) {

                if (this.cpuBoard[i][k] !== 0) {
                    return false;
                };

            }
            // If dir == 3 == right
        } else if (dir == 3) {
            for (let k = j; k < (j + len); k++) {

                if (this.cpuBoard[i][k] !== 0) {
                    return false;
                };

            }
        }

        return true;
    }

    /**
     * Places 1s to represent ship on this.cpuBoard
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
                this.cpuBoard[k][j] = 1;
                this.cpuShipLocations[ship].push([k, j]);
            }

            // If dir == 1 == down
        } else if (dir == 1) {

            for (let k = i; k <= (i + len); k++) {
                this.cpuBoard[k][j] = 1;
                this.cpuShipLocations[ship].push([k, j]);
            }

            // If dir == 2 == left
        } else if (dir == 2) {

            for (let k = j; k >= (j - len); k--) {
                this.cpuBoard[i][k] = 1;
                this.cpuShipLocations[ship].push([i, k]);
            }

            // If dir == 3 == right
        } else if (dir == 3) {

            for (let k = j; k <= (j + len); k++) {
                this.cpuBoard[i][k] = 1;
                this.cpuShipLocations[ship].push([i, k]);
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