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
         *      -2  - enemy's missed shot
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

        // Holds [i,j] array of cpu's last hit
        this.cpuLastHit = [];
    }

    resetGame(gameboard, ships) {

         this.ships = ships;
         this.cpuShipLocations = {};
         this.userShipLocations = this.initUserShipLocations();
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
         this.turn;
         this.Turns = {
             CPU: "CPU",
             USER: "USER"
         }
         this.userGameboard = gameboard;
         this.cpuGameboard = [];
         this.simulateCpuGameboard();
         this.userHitboard = this.createBoard();
         this.cpuHitboard = this.createBoard();
         this.startGame(this.getRandomInt(2));
         this.cpuLastHit = [];
    }


    /**
     * Converts locations from ships object to correct format for userShipLocations
     * @returns object to be placed as this.userShipLocations
     */
    initUserShipLocations() {
        let locations = {};
        for (let k = 0; k < 5; k++) {

            this.ships[this.shipNames[k]].location.forEach((arr) => {
                locations[arr[0] + "" + arr[1]] = this.shipNames[k];
            })

        }
        return locations;
    }

    /**
     * Displays start message w/ correct starter and listens for start button press
     * @param {Number} rand 0 or 1 
     */
    startGame(rand) {
        // If random number is 0, user will start, else CPU will start.
        const starterMessage = (rand === 0 ? `<strong>You</strong>` : `The <strong>enemy</strong>`);
        this.turn = (rand === 0 ? this.Turns.USER : this.Turns.CPU);
        this.starter = this.turn;

        // Add starter to start message
        $("#starter").append(starterMessage);

        let self = this;

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

        // If the non-starter just finished their turn
        if (this.turn == this.starter) {
            if (this.checkForWin()) {
                return;
            }
        }

        // If its the User's turn to shoot, display the user's hitboard.
        if (this.turn === this.Turns.USER) {

            $("#cpu-aim").hide();
            $("#user-aim").show();

            // Change message back to original
            $("#user-aim-main-message").empty().append("Your turn to shoot at the enemy's ships!")

            // Hide continue button
            $("#user-aim-continue").hide();

            this.displayBoard("#user-hitboard");

            // If its the CPU's turn to shoot, display the user's gameboard.
        } else if (this.turn === this.Turns.CPU) {

            $("#user-aim").hide();
            $("#cpu-aim").show();

            // Change message back to original
            $("#enemy-aim-main-message").empty().append("The enemy's turn to shoot at your ships!")

            // Replace continue button with "Let the enemy shoot!" button
            $("#enemy-aim-continue").hide();
            $("#enemy-aim-shoot").show();

            this.displayBoard("#user-gameboard");
        }
    }

    /**
     * Checks for win/draw conditions after non-starter's turn
     */
    checkForWin() {

        const cpuFleetSunk = Object.keys(this.cpuShipLocations).length == 0;
        const userFleetSunk = Object.keys(this.userShipLocations).length == 0;

        // Game is not finished
        if (!cpuFleetSunk && !userFleetSunk) {
            return false;
        }

        // Hide both displays
        $("#user-aim").hide();
        $("#cpu-aim").hide();

        let message;
        let color;

        // User WIN- only CPU's fleet is sunk
        if (cpuFleetSunk && !userFleetSunk) {
            message = "Congratulations!<br><br> You have sunk the enemy's fleet and <strong>won the game!</strong>";
            color = "green";

            // CPU WIN - only User's fleet is sunk
        } else if (!cpuFleetSunk && userFleetSunk) {
            message = "Aw man! The enemy has sunk your whole fleet.<br><br><strong>They have won the game.</strong>";
            color = "red";

            // DRAW - both fleets are sunk
        } else {
            message = "What a game!<br>You and the enemy have sunk each other's fleets.<br><br><strong>It's a draw!</strong>"
            color = "darkblue";
            
        }

        $("#end-of-game").show();
        $("#end-of-game-message").empty().append(message).css("color", color);
        $(document).one("click", "#end-of-game-reload", function() {
            location.reload(true);
        })
        return true;

    }

    /**
     * Renders board's rows
     * @param {String} boardID id of board DOM element
     */
    displayBoard(boardID) {
        // Empty the board's div
        $(boardID).empty();

        // Give appropriate row name based on id
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

        let self = this;

        // Add listeners to squares if user's turn to hit
        if (boardID === "#user-hitboard") {
            this.addHitListeners();

            // Add listener to "Let enemy shoot!" button if CPU's turn to hit
        } else if (boardID === "#user-gameboard") {
            $(document).one("click", "#enemy-aim-shoot-button", { self: self }, function () {
                self.simulateCpuShot();
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

            let status = this.userHitboard[i][j];
            className = "user-hitboard-square";
            squareID = "hitsq" + i + "" + j;

            // Give specific style based on individual square
            if (status == 0) {
                color = "lightskyblue";
            } else if (status == 1) {
                color = "red";
            } else if (status == -1) {
                color = "grey";
            }

        } else if (boardID === "#user-gameboard") {

            let status = this.userGameboard[i][j];
            className = "user-gameboard-square";
            squareID = "gamesq" + i + "" + j;

            if (status == 0) {
                color = "white";
            } else if (status == 1) {
                color = "darkblue";
            } else if (status == -1) {
                color = "red";
            } else if (status == -2) {
                color = "grey";
            }
        }

        // Append gamesquare to appropriate row w/ index specific id
        $(boardID).children("#" + row).append(`<div id=${squareID} class="${className} col"></div>`);
        $("#" + squareID).css("background-color", color);
    }

    /**
     *       
     */
    handleUserShot(id) {
        // idArr = ['h', 'i', 't', 's', 'q', *i, *j]
        let idArr = id.split("");
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
            $("#" + id).css("background-color", "grey");

            message = "Sorry, you missed! Better luck next time.";

            // Check if CPU's gameboard has a ship there
        } else if (this.cpuGameboard[i][j] == 1) {

            // Change square's color to red
            $("#" + id).css("background-color", "red");

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
        let self = this;
        $("#user-aim-continue").show();
        $(document).one("click", "#user-aim-continue-button", { self: self }, function () {
            self.handleGameFlow();
        })

    }

    /**
     * Adds listeners to hitboard squares
     */
    addHitListeners() {

        let self = this;
        $(document).one("click", ".user-hitboard-square", { self: self }, function () {
            self.handleUserShot(this.id);
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
            let i, j, dir;
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
            for (let k = i; k >= (i - len); k--) {

                if (this.cpuGameboard[k][j] !== 0) {
                    return false;
                }

            }
            // If dir == 1 == down
        } else if (dir == 1) {
            for (let k = i; k <= (i + len); k++) {

                if (this.cpuGameboard[k][j] !== 0) {
                    return false;
                }

            }
            // If dir == 2 == left
        } else if (dir == 2) {
            for (let k = j; k >= (j - len); k--) {

                if (this.cpuGameboard[i][k] !== 0) {
                    return false;
                };

            }
            // If dir == 3 == right
        } else if (dir == 3) {
            for (let k = j; k <= (j + len); k++) {

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
            }

            // If dir == 1 == down
        } else if (dir == 1) {

            for (let k = i; k <= (i + len); k++) {
                this.cpuGameboard[k][j] = 1;
                this.cpuShipLocations[k + "" + j] = ship;
            }

            // If dir == 2 == left
        } else if (dir == 2) {

            for (let k = j; k >= (j - len); k--) {
                this.cpuGameboard[i][k] = 1;
                this.cpuShipLocations[i + "" + k] = ship;
            }

            // If dir == 3 == right
        } else if (dir == 3) {

            for (let k = j; k <= (j + len); k++) {
                this.cpuGameboard[i][k] = 1;
                this.cpuShipLocations[i + "" + k] = ship;
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
     *  Simulate CPU Shot on User hit
     */
    simulateCpuShot() {

        let i, j;

        // If cpuLastHit has a value
        if (this.cpuLastHit.length !== 0) {

            // Grab the indices of the last hit
            [i, j] = this.cpuLastHit;

            // Directions array makes sure only 4 directions are tried before moving on
            let directions = [0, 1, 2, 3]
            while (directions.length !== 0) {

                // letiables to prevent multiple changes to i and j
                let iTemp = i;
                let jTemp = j;

                // Generate a new random direction from directions
                let rand = this.getRandomInt(directions.length);
                let dir = directions[rand];
                directions.splice(rand, 1);

                // Adjust iTemp or jTemp based on direction
                (dir === 0 ? iTemp -= 1 : (dir === 1 ? iTemp += 1 : (dir === 2 ? jTemp -= 1 : jTemp += 1)));

                // Check if spot is available to shoot at (board-bounds-wise and shot-at-before-wise)
                if (iTemp >= 0 && iTemp <= 9 && jTemp >= 0 && jTemp <= 9 &&
                    this.cpuHitboard[iTemp][jTemp] === 0) {

                    // Handle hit/miss
                    this.handleCpuShot(iTemp, jTemp)

                    // Exit while loop and function
                    return;
                }


            }
        }
        // If this.cpuLastHit has no value or all squares around were shot at, generate new i and j
        [i, j] = [this.getRandomInt(10), this.getRandomInt(10)];

        // Continue generating new indices until the spot i,j has not been shot at before
        while (this.cpuHitboard[i][j] !== 0) {

            [i, j] = [this.getRandomInt(10), this.getRandomInt(10)]

        }

        // Handle hit/miss
        this.handleCpuShot(i, j);

    }

    /**
     * Handles whether CPU hit or missed the user's ship
     * @param {Number} i row index of spot being shot at
     * @param {Number} j column index of spot being shot at
     */
    handleCpuShot(i, j) {

        // Hide the "Let the enemy shoot!" button and show the continue button
        $("#enemy-aim-shoot").hide();
        $("#enemy-aim-continue").show();

        let message;

        // If the shot missed
        if (this.userGameboard[i][j] === 0) {

            // Change square's color to grey
            $("#gamesq" + i + "" + j).css("background-color", "grey");

            // Miss message
            message = "The enemy missed. You got lucky this time!";

            // Mark cpuHitboard with a miss
            this.cpuHitboard[i][j] = -1;

            // Mark the userGameboard with an enemy's miss
            this.userGameboard[i][j] = -2;

            // If the shot hit
        } else if (this.userGameboard[i][j] === 1) {

            // Change square's color to red
            $("#gamesq" + i + "" + j).css("background-color", "red");

            // Change CPU's hitboard to reflect a hit
            this.cpuHitboard[i][j] = 1;

            // Mark the user's gameboard with a hit ship
            this.userGameboard[i][j] = -1;

            // Grab name of ship
            const ship = this.userShipLocations[i + "" + j];

            // Subtract a square from ship that was hit
            this.userShipLeft[ship] -= 1;

            // If the ship that was hit has no squares left, 
            // display sunk message and empty cpuLastHit.
            if (this.userShipLeft[ship] === 0) {
                message = `Oh no! The enemy sunk your ${ship}! Let's get revenge!`;
                this.cpuLastHit = [];
            } else {

                // If the ship has more squares left, 
                // display hit message and replace indices in cpuLastHit.
                message = `Uh oh! The enemy hit your ${ship}!`;
                this.cpuLastHit = [i, j];
            }

            // Remove that square from the user's ship locations
            delete this.userShipLocations[i + "" + j]
        }

        // Display message
        $("#enemy-aim-main-message").empty().append(message);

        // Change the turn to user
        this.turn = this.Turns.USER;

        let self = this;

        // Add listener to continue button
        $(document).one("click", "#enemy-aim-continue-button", { self: self }, function () {
            self.handleGameFlow();
        })
    }

}