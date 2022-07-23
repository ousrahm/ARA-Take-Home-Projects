// Handles Battleship gameplay and CPU simulation
class Battleship {
    constructor(gameboard, ships) {
        this.userBoard = gameboard;
        this.userShips = ships;
        this.cpuBoard = this.simulateCpuBoard();
    }

    simulateCPUBoard() {
        let board = [];
        // Fill 10x10 2D array with 0's
        for (let i = 0; i < 10; i++) {
            board.push([]);
            for (let j = 0; j < 10; j++) {
                board.push(0);
            }
        }

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        const shipArr = ["carrier", "battleship", "cruiser", "submarine", "destroyer"]

        // Fill board with ships
        for (let k = 0; k < shipArr.length; k++) {
            // Length of end of ship
            const len = ships[shipArr[k]]['length'] - 1;

            // Indices of Stern: two random numbers (0-9)
            let i = getRandomInt(10);
            let j = getRandomInt(10);

            // Direction of Bow: Randomly choose a number (0, 1, 2, 3) (up, down, left, right)
            const dir = getRandomInt(4);

            // Check if direction and length keeps ship in bounds. 
            // If not, switch to opposite direction (+/- 1) (up<->down, left<->right)
            if (dir == 0 && (i - (len - 1)) < 0) {
                dir += 1;
            } else if (dir == 1 && (i + (len - 1)) > 9) {
                dir -= 1;
            } else if (dir == 2 && (j - (len - 1)) < 0) {
                dir += 1;
            } else if (dir == 3 && (j + (len - 1)) > 9) {
                dir -= 1;
            }

            for (let l = 0; l < len; l++) {
                board[i][j] = 1;
                if (dir == 0) {
                    i-=1;
                } else if (dir == 1) {
                    i+=1;
                } else if (dir == 2) {
                    j-=1;
                } else if (dir == 3) {
                    j+=1;
                }
            }

        }
        return board;
    }
}