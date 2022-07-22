class SetupBattleship {

    constructor() {
        this.gameboard = [];
        this.setupGameboard();
        this.setupGameboardHTML();
        this.addShipListeners();
        this.stage = this.Stages.NEWSHIP;
        this.ships = {
            carrier: { length: 5, highlight: "none", placed: false, location: [] },
            battleship: { length: 4, highlight: "none", placed: false, location: [] },
            cruiser: { length: 3, highlight: "none", placed: false, location: [] },
            submarine: { length: 3, highlight: "none", placed: false, location: [] },
            destroyer: { length: 2, highlight: "none", placed: false, location: [] }
        }
        this.currentShip = "";
        this.possibileSquares = [];
    }


    // Enumerations to represent current stage of setup
    Stages = Object.freeze({
        NEWSHIP: 0,
        STERN: 1,
        BOW: 2
    });

    /**
     * Creates gameboard array has matching indices w/ html gameboard
     */
    setupGameboard() {
        for (let i = 0; i < 10; i++) {
            this.gameboard.push([]);
            for (let j = 0; j < 10; j++) {
                this.gameboard[i].push(0);
            }
        }
    }

    /**
     * Appends HTML rows to setup gameboard
     */
    setupGameboardHTML() {
        for (let i = 0; i < 10; i++) {
            // Add row div with num-specific id
            $("#setup-gameboard").append(`<div id="${"row" + i}"class="row">`);
            // Append each square individually
            for (let j = 0; j <= 9; j++) {
                this.setupGameboardHTMLSquare(i, j);
            }
            // Close row
            $("#setup-gameboard").append('</div>');
        }

    }


    /**
     * Appends square to row of setup gameboard
     * Adds click listener to squares
     * @param {Number} a 
     * @param {Number} b 
     */
    setupGameboardHTMLSquare(a, b) {
        const row = "#row" + a;
        const id = "sq" + a + "" + b;
        var self = this;

        // Append gamesquare to appropriate row w/ index specific id
        $("#setup-gameboard").children(row).append(`<div id=${id} class="setup-gameboard-square col">${a + "" + b}</div>`);

        // On click of game square, call handleClick
        $(document).on("click", "#" + id, { id: id, a: a, b: b, self: self }, function () {
            self.handleSquareClick(id, a, b)
        });

        // On click of reset button, reset board.
        $(document).on("click", "#reset-board", {self:self}, function() {
            self.resetBoard();
        });

        // On click of ready button, ready board.
        $(document).on("click", "#ready-board", {self:self}, function() {
            self.readyBoard();
        });
    }

    /**
     * Add click listeners to all battleships
     */
    addShipListeners() {
        var self = this;

        $(document).on("click", ".ship-container", { self: self }, function () {
            self.selectedShip(this.getAttribute("id"));
        })
    }

    /**
     * Highlights selected ship, changes selected value to true, changes current ship,
     * and changes the stage of the game.
     * @param {String} ship Name of selected ship 
     */
    selectedShip(ship) {

        // If the ship selected has already been placed, do nothing.
        if (this.ships[ship].placed === true) {
            return;

        // If the ship selected was already selected, unselect it.
        } else if (this.currentShip === ship) {
            this.removeHighlightShip(ship);
            this.currentShip = "";
            return;

        // If the currentShip is not selected one and not empty
        } else if (this.currentShip !== "" && this.currentShip !== ship) {
            this.removeHighlightShip(this.currentShip);
        }

        this.currentShip = ship;

        if (this.ships[ship]['highlight'] == "none") {
            this.highlightShip(ship, "darkblue");
        }
        

        this.stage = this.Stages.STERN;
    }

    /**
     * When a square is clicked, depending on stage of setup, send to correct function.
     * @param {String} id id of square
     * @param {Number} i up-down index of square
     * @param {Number} j left-right index of square
     */
    handleSquareClick(id, i, j) {

        // If no ship is selected, show select message.
        if (this.currentShip == "" ) {
            $("#select-message").fadeIn("slow", function () {
                $("#select-message").fadeOut(1000);
            });
            return;
        }

        // If a newship is being selected, show select message.
        switch (this.stage) {
            // Need to select a new ship
            case 0:
                $("#select-message").fadeIn("slow", function () {
                    $("#select-message").fadeOut(1000);
                });
                return;

            // If square is available, place stern of ship
            case 1:
                if (this.gameboard[i][j] === 0) {
                    this.placeStern(this.currentShip, id, i, j);
                } else {
                    return;
                }

            // If square is a possible square, place bow of ship
            case 2:
                const square = [i, j];
                // Compares two arrays for equality
                function isEqual(a, b) {
                    return a.join() == b.join();
                }
                // If the selected square is a possible square, place the bow
                // and empty possible squares.
                this.possibileSquares.forEach((arr) => {
                    if (isEqual(arr, square)) {
                        this.placeBow(this.currentShip, i, j);
                        this.emptyPossibleSquares();
                    }
                })
                break;
        }
    }

    /**
     * Changes gameboard array, changes color of selected square,
     * highlights possible squares for bow of ship.
     * @param {Number} id 
     * @param {Number} i 
     * @param {Number} j 
     */
    placeStern(currentShip, id, i, j) {
        // Change stage to place bow
        this.stage = this.Stages.BOW;

        // Change gameboard array to represent ship stern in slot selected
        this.gameboard[i][j] = 1;

        // Change color of selected square
        this.colorSquare("#"+id, "darkblue");
        this.highlightSquare("#"+id, "white");

        const len = this.ships[currentShip]["length"];

        // Find possible squares for bow of ship based on length
        let possibilities = this.findPossibleSquares(len, id, i, j);

        // If there are no possible squares:
        if (possibilities.length === 0) {
            // display message
            $("#somewhere-else-message").fadeIn("slow", function () {
                $("#somewhere-else-message").fadeOut(1000);
            });

            // return square color to white
            this.colorSquare("#"+id, "white")

            // return number in gameboard array to 0
            this.gameboard[i][j] = 0;

            // change stage back to stern
            this.stage = this.Stages.STERN;

            return;

            // If squares are available:
        } else {
            // change all possible bow locations to light blue
            for (let k = 0; k < possibilities.length; k++) {
                const a = possibilities[k][0];
                const b = possibilities[k][1];
                $("#sq" + a + "" + b).css("background-color", "lightskyblue")
            }

            // Add location of stern to ships object
            this.ships[currentShip].location.push([i, j]);

            // change stage to bow
            this.stage = this.Stages.BOW;
        }

    }

    /**
     * Fills in ship's squares in gameboard array and changes
     * colors to darkblue on gameboard 
     * @param {String} currentShip name of current ship
     * @param {String} id id of selected square
     * @param {Number} i up-down index of square
     * @param {Number} j left-right index of square
     */
    placeBow(currentShip, i, j) {
        const stern = this.ships[currentShip].location[0];
        const a = stern[0];
        const b = stern[1];
        var self= this;

        // Helper function to change gameboard array, add location of square to ship
        // object, and changes square color
        function addSquare(x, y, self) {
            self.gameboard[x][y] = 1;
            self.ships[currentShip].location.push([x,y]);
            $("#sq" + x + "" + y).css("background-color", "darkblue").css("border-color", "white");
        }

        // Bow is lower than stern
        if (i > a) {
            for (let k = i; k > a; k--) {
                addSquare(k, b, self);
            }
            // Bow is higher than stern
        } else if (i < a) {
            for (let k = i; k < a; k++) {
                addSquare(k, b, self);
            }
            // Bow is more right than stern
        } if (j > b) {
            for (let k = j; k > b; k--) {
                addSquare(a, k, self);
            }
            // Bow is more left than stern
        } else if (j < b) {
            for (let k = j; k < b; k++) {
                addSquare(a,k, self);
            }
        }

        // Assert that current ship has been placed
        this.ships[currentShip].placed = true;

        // Change side of screen ship to limegreen
        this.highlightShip(currentShip, "limegreen");

        // Change the currentShip back to nothing
        this.currentShip = "";

        // Change stage of game back to newship
        this.stage = this.Stages.NEWSHIP;

    }

    /**
     * Helper function that checks all directions around a ship's stern
     * for unavailable squares
     * @param {Number} len 
     * @param {String} ship 
     * @param {Number} i 
     * @param {Number} j 
     * @returns possible indices of squares to place ship's bow
     */
    findPossibleSquares(len, ship, i, j) {
        let possibilities = [];

        let up = i - (len - 1);
        let down = i + (len - 1);
        let left = j - (len - 1);
        let right = j + (len - 1);

        // Check if up is within bounds of board
        if (up >= 0) {
            let possible = true;
            // Make sure all spots between up and i are available
            for (let k = i - 1; k >= up; k--) {
                // If a spot is occupied, break. 
                if (this.gameboard[k][j] !== 0) {
                    possible = false;
                    break;
                }
            }
            // If all spots are available, add indices as possibility
            if (possible) {
                possibilities.push([up, j]);
            }
        }

        // Check if down is within bounds of board
        if (down <= 9) {
            let possible = true;
            // Make sure all spots between down and i are available
            for (let k = i + 1; k <= down; k++) {
                // If spot is occupied, break and continue. 
                if (this.gameboard[k][j] !== 0) {
                    possible = false;
                    break;
                }
            }
            // If all spots are available, add indices as possibility
            if (possible) {
                possibilities.push([down, j]);
            }
        }

        // Check if left is within bounds of board
        if (left >= 0) {
            let possible = true;
            // Make sure all spots between left and j are available
            for (let k = j - 1; k >= left; k--) {
                // If spot is occupied, break and continue. 
                if (this.gameboard[i][k] !== 0) {
                    possible = false;
                    break;
                }
            }
            // If all spots are available, add indices as possibility
            if (possible) {
                possibilities.push([i, left]);
            }
        }

        // Check if right is within bounds of board
        if (right <= 9) {
            let possible = true;
            // Make sure all spots between right and j are available
            for (let k = j + 1; k <= right; k++) {
                // If spot is occupied, break and continue. 
                if (this.gameboard[i][k] !== 0) {
                    possible = false;
                    break;
                }
            }
            // If all spots are available, add indices as possibility
            if (possible) {
                possibilities.push([i, right]);
            }
        }

        this.possibileSquares = possibilities;

        return possibilities;
    }

    /**
     * Return all highlighted squares to white and empty possibleSquares array
     */
    emptyPossibleSquares() {
        for (let k = 0; k < this.possibileSquares.length; k++) {
            const i = this.possibileSquares[k][0];
            const j = this.possibileSquares[k][1];
            const id = "#sq" + i + "" + j;

            if ($(id).css("background-color") === "rgb(135, 206, 250)") {
                this.colorSquare(id, "white");
            }
        }

        this.possibileSquares = [];
    }

    resetBoard() {

        // Change all squares back to white with black border
        for ( let k = 0; k < this.gameboard.length; k++) {
            for (let l = 0; l < this.gameboard[0].length; l++) {
                this.colorSquare("#sq"+k+""+l, "white");
                this.highlightSquare("#sq"+k+""+l, "black");
            }
        }

        // Reset gameboard
        this.gameboard = [];
        this.setupGameboard();

        // Change all ships back to default
        this.ships = {
            carrier: { length: 5, placed: false, location: [] },
            battleship: { length: 4, placed: false, location: [] },
            cruiser: { length: 3, placed: false, location: [] },
            submarine: { length: 3, placed: false, location: [] },
            destroyer: { length: 2, placed: false, location: [] }
        }
        this.currentShip = "";
        this.possibileSquares = [];
        this.stage = this.Stages.NEWSHIP;

        this.removeHighlightAllShips();
    }

    /**
     * Adds blue highlight around ship when selected
     * @param {String} ship 
     */
    highlightShip(ship, color) {
        $("#" + ship).css("border", "solid "+color+" 2px").css("border-radius", "3%");
        this.ships[ship]['highlight'] = color;
    }

    removeHighlightShip(ship) {
        $("#" + ship).css("border", "none");
        this.ships[ship]['highlight'] = "none";
    }


    removeHighlightAllShips() {
        this.removeHighlightShip("carrier");
        this.ships["carrier"]['highlight'] = "none";

        this.removeHighlightShip("battleship");
        this.ships["battleship"]['highlight'] = "none";

        this.removeHighlightShip("cruiser");
        this.ships["cruiser"]['highlight'] = "none";

        this.removeHighlightShip("submarine");
        this.ships["submarine"]['highlight'] = "none";

        this.removeHighlightShip("destroyer");
        this.ships["destroyer"]['highlight'] = "none";
    }

    colorSquare(id, color) {
        $(id).css("background-color", color);
    }

    highlightSquare(id, color) {
        $(id).css("border-color", color);
    }

    readyBoard() {
        if (this.ships["carrier"].placed && this.ships["battleship"].placed &&
            this.ships["cruiser"].placed && this.ships["submarine"].placed &&
            this.ships["destroyer"].placed) {
                console.log("READY TO PLAY!")
        } else {
            $("#not-ready-message").fadeIn(1000, function () {
                $("#not-ready-message").fadeOut(1000);
            });
        }
    }




}