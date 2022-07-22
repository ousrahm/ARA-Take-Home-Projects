$(document).ready(function () {
    // Load homepage HTML initially
    $(function () { loadHome(); })

    // When homepage button in navbar is pressed, load homepage HTML
    $(document).on("click", "#home-button", function () { loadHome(); })

    // When an item button or item navbar button is clicked, load that item.
    $(document).on("click", "#item1, #navbar-item1", function () { loadItem("1"); });
    $(document).on("click", "#item2, #navbar-item2", function () { loadItem("2"); });
    $(document).on("click", "#item3, #navbar-item3", function () { loadItem("3"); });

    // For homepage, hide navbar, empty the main container, and replace w/ homepage HTML.
    function loadHome() {
        $("nav").hide();
        $("#main-container").empty();
        $("#main-container").load("pages/home.html");
    }

    // For item page, empty main container, show the navbar, and display specified item HTML.
    function loadItem(num) {
        $("#main-container").empty();
        $("#main-navbar").show().load("elements/navbar.html");
        $("#main-container").load("pages/item" + num + ".html");
    }


});