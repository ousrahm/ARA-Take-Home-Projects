// Handles the setup of the game i.e. placing ships.
class SetupBattleship {

    constructor() {
        // Array representation of the player's gameboard
        this.gameboard = [];

        // Initializes gameboard array
        this.setupGameboard();

        // Creates gameboard HTML
        this.setupGameboardHTML();

        // Holds information about all ships
        this.ships = {
            carrier: { length: 5, highlight: "none", placed: false, location: [] },
            battleship: { length: 4, highlight: "none", placed: false, location: [] },
            cruiser: { length: 3, highlight: "none", placed: false, location: [] },
            submarine: { length: 3, highlight: "none", placed: false, location: [] },
            destroyer: { length: 2, highlight: "none", placed: false, location: [] }
        }

        // Adds listeners to all ships on left-side of page
        this.addShipListeners();

        // Tracks current stage of game
        this.stage = this.Stages.NEWSHIP;

        // Tracks current ship being placed
        this.currentShip = "";

        // Tracks possible squares to place bow of ship
        this.possibleSquares = [];

        var self = this;
        // On click of reset button, reset board.
        $(document).one("click", "#reset-board", { self: self }, function () {
            self.resetBoard();
        });

        // On click of ready button, ready board.
        $(document).one("click", "#ready-board", { self: self }, function () {
            self.readyBoard();
        });
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
     * @param {Number} a row index of square
     * @param {Number} b column index of square
     */
    setupGameboardHTMLSquare(a, b) {
        const row = "#row" + a;
        const id = "sq" + a + "" + b;
        var self = this;

        // Append gamesquare to appropriate row w/ index specific id
        $("#setup-gameboard").children(row).append(`<div id=${id} class="setup-gameboard-square col">${a + "" + b}</div>`);
    }

    /**
     * Adds click listeners to all battleships that have not been placed yet
     */
    addShipListeners() {
        var self = this;
        if (!this.ships.carrier.placed) {
            $(document).off("click", "#carrier", false).one("click", "#carrier", { self: self }, function () {
                self.selectedShip("carrier");
            })
        } else if (!this.ships.battleship.placed) {
            $(document).off("click", "#battleship", false).one("click", "#battleship", { self: self }, function () {
                self.selectedShip("battleship");
            })
        } else if (!this.ships.cruiser.placed) {
            $(document).off("click", "#cruiser", false).one("click", "#cruiser", { self: self }, function () {
                self.selectedShip("cruiser");
            })
        } else if (!this.ships.submarine.placed) {
            $(document).off("click", "#submarine", false).one("click", "#submarine", { self: self }, function () {
                self.selectedShip("submarine");
            })
        } else if (!this.ships.destroyer.placed) {
            $(document).off("click", "#destroyer", false).one("click", "#destroyer", { self: self }, function () {
                self.selectedShip("destroyer");
            })
        }
    }

    /**
     * Adds listeners to all squares w/ setup-gameboard-square class
     */
    addSquareListeners() {
        var self = this;
        $(document).one("click", ".setup-gameboard-square", { self: self }, function () {
            console.log("addSquareListeners")
            const id = this.id;
            const arr = id.split("");
            const i = parseInt(arr[2]);
            const j = parseInt(arr[3]);
            self.handleSquareClick(id, i, j)
        });
    }

    /**
     * Turns on square listeners, changes currentShip, 
     * highlights selected ship, and changes the stage of the game.
     * @param {String} ship Name of selected ship 
     */
    selectedShip(ship) {

        // Turn on all square's listeners
        this.addSquareListeners();

        this.currentShip = ship;

        if (this.ships[ship]['highlight'] == "none") {
            this.highlightShip(ship, "darkblue");
        }

        this.stage = this.Stages.STERN;
    }

    /**
     * When a square is clicked, depending on stage of setup, send to correct method.
     * @param {String} id id of square DOM element
     * @param {Number} i row index of square
     * @param {Number} j column index of square
     */
    handleSquareClick(id, i, j) {

        // If no ship is selected, show select message.
        if (this.currentShip == "") {
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
                break;

            // If a square is available, place stern of ship
            case 1:
                console.log("case1")
                if (this.gameboard[i][j] === 0 && this.possibleSquares.length == 0) {
                    this.placeStern(this.currentShip, id, i, j);
                }
                break;

            // If square is a possible square, place bow of ship
            case 2:
                const square = [i, j];
                // Compares two arrays for equality
                function isEqual(a, b) {
                    return a.join() == b.join();
                }
                // If the selected square is a possible square, place the bow
                // and empty possible squares.
                this.possibleSquares.forEach((arr) => {
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
     * @param {String} currentShip name of ship currently being placed
     * @param {Number} id id of square dom element
     * @param {Number} i row index of square
     * @param {Number} j column index of square
     */
    placeStern(currentShip, id, i, j) {

        // Change stage to place bow
        this.stage = this.Stages.BOW;

        // Change gameboard array to represent ship stern in slot selected
        this.gameboard[i][j] = 1;

        // Change color of selected square
        this.colorSquare("#" + id, "darkblue");
        this.highlightSquare("#" + id, "white");

        const len = this.ships[currentShip]["length"];

        // Find possible squares for bow of ship based on length
        let possibilities = this.findPossibleSquares(len, i, j);

        // If there are no possible squares:
        if (possibilities.length === 0) {
            // display message
            $("#somewhere-else-message").fadeIn("slow", function () {
                $("#somewhere-else-message").fadeOut(1000);
            });

            // Add listeners back
            this.addSquareListeners();

            // return square color to white
            this.colorSquare("#" + id, "white")

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

        // Add square listeners back to only possible squares
        var self = this;
        possibilities.forEach((arr) => {
            const a = arr[0];
            const b = arr[1]
            const idStr = "#sq" + a + "" + b;
            $(document).one("click", idStr, { self: self, id: idStr, a: a, b: b }, function () {
                self.handleSquareClick(id, a, b);
            });
        })

    }

    /**
     * Fills in ship's squares in gameboard array and changes
     * colors to darkblue on gameboard 
     * @param {String} currentShip name of current ship
     * @param {Number} i up-down index of square
     * @param {Number} j left-right index of square
     */
    placeBow(currentShip, i, j) {

        // Grabs location of stern of ship
        const stern = this.ships[currentShip].location[0];
        const a = stern[0];
        const b = stern[1];
        var self = this;

        // Helper function to change gameboard array, add location of square to ship
        // object, and changes square color
        function addSquare(x, y, self) {
            self.gameboard[x][y] = 1;
            self.ships[currentShip].location.push([x, y]);
            $("#sq" + x + "" + y).removeClass("setup-gameboard-square").css("background-color", "darkblue").css("border", "1px white solid").css("aspect-ratio", 1);
        }

        // Bow is lower than stern
        if (i > a) {
            for (let k = i; k >= a; k--) {
                addSquare(k, b, self);
            }
            // Bow is higher than stern
        } else if (i < a) {
            for (let k = i; k <= a; k++) {
                addSquare(k, b, self);
            }
            // Bow is more right than stern
        } if (j > b) {
            for (let k = j; k >= b; k--) {
                addSquare(a, k, self);
            }
            // Bow is more left than stern
        } else if (j < b) {
            for (let k = j; k <= b; k++) {
                addSquare(a, k, self);
            }
        }

        // Assert that current ship has been placed
        this.ships[currentShip].placed = true;

        // Change side of screen ship border to limegreen
        this.highlightShip(currentShip, "limegreen");

        // Change the currentShip back to nothing
        this.currentShip = "";

        // Change stage of game back to newship
        this.stage = this.Stages.NEWSHIP;

        // Add listener to next ship
        this.addShipListeners();

    }

    /**
     * Helper function that checks all directions around a ship's stern
     * for unavailable squares
     * @param {Number} len 
     * @param {Number} i 
     * @param {Number} j 
     * @returns possible indices of squares to place ship's bow
     */
    findPossibleSquares(len, i, j) {
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

        this.possibleSquares = possibilities;

        return possibilities;
    }

    /**
     * Return all highlighted squares to white and empty possibleSquares array
     */
    emptyPossibleSquares() {
        for (let k = 0; k < this.possibleSquares.length; k++) {
            const i = this.possibleSquares[k][0];
            const j = this.possibleSquares[k][1];
            const id = "#sq" + i + "" + j;

            // If square color matches lightskyblue, change to white
            if ($(id).css("background-color") === "rgb(135, 206, 250)") {
                this.colorSquare(id, "white");
            }
        }

        this.possibleSquares = [];
    }

    /**
     * Resets gameboard and all setupBattleship properties
     */
    resetBoard() {

        // Change all squares back to white with black border
        for (let k = 0; k < this.gameboard.length; k++) {
            for (let l = 0; l < this.gameboard[0].length; l++) {
                const id = "#sq" + k + "" + l;
                this.colorSquare(id, "white");
                this.highlightSquare(id, "black");

                // If square is missing the setup-gameboard class, add it again.
                if (!$(id).attr("class").includes("setup-gameboard-square")) {
                    $(id).addClass("setup-gameboard-square");
                }
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

        // Reset properties
        this.currentShip = "";
        this.possibleSquares = [];
        this.stage = this.Stages.NEWSHIP;

        // Remove borders from all ships
        this.removeHighlightAllShips();

        // Add listeners back to ships
        this.addShipListeners();

        // Add listener back to reset board button
        var self = this;
        $(document).one("click", "#reset-board", { self: self }, function () {
            self.resetBoard();
        });

    }

    /**
     * Adds blue highlight around ship when selected
     * @param {String} ship 
     */
    highlightShip(ship, color) {
        $("#" + ship).css("border", "solid " + color + " 2px").css("border-radius", "3%");
        this.ships[ship]['highlight'] = color;
    }

    /**
     * Removes border from ship and changes highlight property to none
     * @param {String} ship 
     */
    removeHighlightShip(ship) {
        $("#" + ship).css("border", "none");
        this.ships[ship]['highlight'] = "none";
    }

    /**
     * Removes borders from all ships and changes the
     * highlight property of their object in ships to none
     */
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

    /**
     * Gives square background-color based on id and color
     * @param {String} id 
     * @param {String} color 
     */
    colorSquare(id, color) {
        $(id).css("background-color", color);
    }

    /**
     * Gives square border-color based on id and color
     * @param {String} id 
     * @param {String} color 
     */
    highlightSquare(id, color) {
        $(id).css("border-color", color);
    }



    /**
     * Checks that all ships have been placed.
     * If so, empty main-game-container div and load play.html
     * If not, display not-ready-message
     */
    readyBoard() {
        if (this.ships["carrier"].placed && this.ships["battleship"].placed &&
            this.ships["cruiser"].placed && this.ships["submarine"].placed &&
            this.ships["destroyer"].placed) {

            $("#main-game-container").empty().load("pages/game/play.html");

        } else {

            $("#not-ready-message").fadeIn(1000, function () {
                $("#not-ready-message").fadeOut(1000);
            });

            var self = this;
            $(document).one("click", "#ready-board", { self: self }, function () {
                self.readyBoard();
            });
        }
    }




}