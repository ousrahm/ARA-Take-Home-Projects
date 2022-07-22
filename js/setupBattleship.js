class SetupBattleship {

    constructor() {
        this.gameboard = [];
        this.setupGameboard();
        this.setupGameboardHTML();
        this.stage = this.Stages.NEWSHIP;
    }

    Stages = Object.freeze({
        NEWSHIP: 0,
        STERN: 1,
        BOW: 2
    });

    setupGameboard() {
        for (let i = 0; i < 10; i++) {
            this.gameboard.push([]);
            for (let j = 0; j < 10; j++) {
                this.gameboard[i].push(0);
            }
        }
    }

    /**
     * When a click is heard, depending on stage of setup, send to correct function.
     * @param {String} id 
     * @param {Number} i 
     * @param {Number} j 
     */
    handleSquareClick(id, i, j) {
        // If a newship is being selected, show select message.
        if (this.stage === 0) {
            $("#select-message").fadeIn("slow", function() {
                $("#select-message").fadeOut(1000);
            });
        }
    }
    
    placeStern(id, i, j) {
        this.gameboard[i][j] = 1;
        $("#" + id).css("background-color", "darkblue")
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
        $(document).on("click", "#" + id, { id: id, a: a, b: b, self:self }, function () {
            self.handleSquareClick(id, a, b)
        });
    }


}