$(document).ready(function () {
    // Validate input for item1 array
    $(document).on("click", "#item1-array-button", function () {

        // Get value
        let input = $("#item1-array-input").val().trim();

        // If empty input, show empty error message.
        if (input == "") {
            emptyErrorMessage();
            return;
        }

        // Match input against allowed characters (digits, periods, hyphens, and spaces)
        const regex = "^[.0-9 -]*$"
        const match = input.match(regex);

        // If match result is not null and does not match input, show char error message
        if (match == null || match[0] !== input) {
            charErrorMessage();
            return;
        }

        // Split input into array
        const inputArray = input.split(" ");

        /** Iterates through array and checks for the following in each number: 
         * standalone hyphen/period
         * consecutive spaces
         * hyphen in wrong places
         * more than one hyphen or period 
         */
        var invalid = !inputArray.every((cur) => {
            if (cur !== "-" && cur !== "." && !cur.endsWith("-")
                && cur !== "" && cur.indexOf('-', cur.indexOf('-') + 1) === -1
                && cur.indexOf('.', cur.indexOf('.') + 1) === -1) {
                if (cur.includes("-")) {
                    if (cur.indexOf('-') === 0) {
                        return true;
                    } else {
                        return false
                    }
                }
                return true;
            }
        })

        // If input is invalid, display invalid error message
        if (invalid) {
            invalidErrorMessage();
            return;
        }

        // Hide error messages and send array to be used in sum calculation
        hideErrorMessages();
        findSum(inputArray);
        return;
    });

    // Display the appropriate error message while hiding others
    function charErrorMessage() {
        hideErrorMessages();
        $("#item1-char-error-message").show();
    }
    function emptyErrorMessage() {
        hideErrorMessages();
        $("#item1-empty-error-message").show();
    }
    function invalidErrorMessage() {
        hideErrorMessages();
        $("#item1-invalid-error-message").show();
    }

    // Hides all error messages
    function hideErrorMessages() {
        $("#item1-empty-error-message").hide();
        $("#item1-char-error-message").hide();
        $("#item1-invalid-error-message").hide();
    }

    /**
     * Converts an array of strings to an array of numbers to the sum of those numbers
     * @param {String[]} arr 
     */
    function findSum(arr) {
        // Find length of longest number in array
        let longestNum = arr.reduce((prev, cur) => (cur.length > prev.length ? cur : prev)).length + 1;

        // Convert all string numbers to float numbers
        const arrToNum = arr.map((cur) => { return parseFloat(cur); })

        // Find unrounded sum of numbers in array
        const unrounded = arrToNum.reduce((prev, cur) => prev + cur);

        // Use toPrecision to round sum properly
        const rounded = unrounded.toPrecision(longestNum);

        // Remove ending 0's and .'s
        let sum = rounded;
        if (sum.includes(".")) {
            if (sum.endsWith("0")) {
                sum = removeZeroes(sum);
            }
            if (sum.endsWith(".")) {
                sum = sum.slice(0, -1);
            }
        }

        // Display sum
        $("#item1-sum-div").show();
        $("#item1-sum").empty().append(sum);
    }

    // Removes ending zeroes from strings
    function removeZeroes(num) {
        if (!num.endsWith("0") || num.length == 1) {
            return num;
        } else {
            return removeZeroes(num.slice(0, -1));
        }
    }
});