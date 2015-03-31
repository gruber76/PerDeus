"use strict";

var React = require("react");
var RatesStore = require("./stores/RatesStore");

var App = React.createClass({

    getInitialState: function() {
        return {currentRate: RatesStore.getRateByZip("90027")};
    },

    displayName: "App",
    render: function() {
        return (
            <div id="simpleApp">{this.state.currentRate.Meals}</div>
            );
    }
});

React.render(
    <App />,
    document.getElementById("App")
);
