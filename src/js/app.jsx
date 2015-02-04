"use strict";

var React = require("react");


var App = React.createClass({
    displayName: "App",
    render: function() {
        return (
            <div id="simpleApp"></div>
            );
    }
});

React.render(
    <App />,
    document.getElementById("App")
);
