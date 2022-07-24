class PlayBattleship {

    constructor(gameboard, ships) {
        this.userBoard = gameboard;
        this.userShips = ships;
        this.cpuBoard = [];
        this.createBoard();
    }

    /** Creates 10 by 10 2D array board filled with 0's */
    createBoard() {

        let board = [];

        // Fill 10x10 2D array with 0's
        for (let i = 0; i < 10; i++) {

            board.push([]);

            for (let j = 0; j < 10; j++) {
                board[i].push(0);
            }

        }

        this.cpuBoard = board;
        this.simulateCpuBoard();
    }

    /**
     * Simulates CPU's board of ships by calling other helper functions
     */
    simulateCpuBoard() {

        const shipArr = ["carrier", "battleship", "cruiser", "submarine", "destroyer"]

        // Iterates through ships
        for (let k = 0; k < shipArr.length; k++) {

            // Length of end of ship
            const len = this.userShips[shipArr[k]]['length'] - 1;

            // i,j: stern indices - two random integers (0-9)
            // dir: direction of bow - random integer (0, 1, 2, 3 == up, down, left, right)
            var i, j, dir;
            let placed = false;

            // Generate new indices and direction until ship is be placed
            while (!placed) {

                [i, j, dir] = this.getNewIJDir();

                if (this.shipWorks(i, j, len, dir)) {

                    this.placeShip(i, j, len, dir);
                    placed = true;

                }
            }
        }
    }

    /**
     * If ship fits on map, return true, else false.
     * @param {*} i row index of stern
     * @param {*} j column index of stern
     * @param {*} len length of ship
     * @param {*} dir direction of bow of ship from stern
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
     * @param {*} i row index of stern
     * @param {*} j column index of stern
     * @param {*} len length of ship
     * @param {*} dir direction of bow from stern
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
     * @param {*} i row index of stern
     * @param {*} j column index of stern
     * @param {*} len length of ship
     * @param {*} dir direction of bow of ship from stern
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
     * @param {*} i row index of stern
     * @param {*} j column index of stern
     * @param {*} len length of ship
     * @param {*} dir direction of bow of ship from stern
     */
    placeShip(i, j, len, dir) {
        // If dir == 0 == up
        if (dir == 0) {

            for (let k = i; k >= (i - len); k--) {
                this.cpuBoard[k][j] = 1;
            }

            // If dir == 1 == down
        } else if (dir == 1) {

            for (let k = i; k <= (i + len); k++) {
                this.cpuBoard[k][j] = 1;
            }

            // If dir == 2 == left
        } else if (dir == 2) {

            for (let k = j; k >= (j - len); k--) {
                this.cpuBoard[i][k] = 1;
            }

            // If dir == 3 == right
        } else if (dir == 3) {

            for (let k = j; k <= (j + len); k++) {
                this.cpuBoard[i][k] = 1;
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
}