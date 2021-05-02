import * as d3 from 'd3';
import * as dimple from 'dimple';
import React, { useEffect } from 'react';
import "./NowMoneyGraph.css"

var chart_params = {
    x: 0,
    y: 40,
    length: 400,
    height: 400
};

const MIN_BAR_HEIGHT = 14;

function NowMoneyGraph({ data }) {
    useEffect(() => {
        draw();
    }, [data]);

    const draw = () => {
        document.getElementById("nowMoneyGraph").innerHTML = ''
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            total += data[i].Amount;
        }

        /* Make the sum of all the budget values a power of a 10 to ensure bar
            height is equal to maximum y-axis value. */
        var adjusted_total = Math.pow(10, total.toString().length);
        var curr_adjusted_sum = 0;
        for (i = 1; i < data.length; i++) {
            data[i].Amount = parseFloat((adjusted_total * (data[i].Amount/total)).toFixed(2));
            curr_adjusted_sum += data[i].Amount;
        }
        data[0].Amount = adjusted_total - curr_adjusted_sum - 0.0001;

        var svg = dimple.newSvg("#nowMoneyGraph", chart_params.length + chart_params.x,
                                chart_params.height + chart_params.y);

        // Bars are from bottom to top
        var order_rule = ["Minimum Debt Payments", "Recurring Costs", "Retirement Contributions",
        "Additional Debt Payments", "Savings Goal", "Flex Money", "Taxes"]

        var chart = new dimple.chart(svg, data);
        chart.setBounds(chart_params.x, chart_params.y, chart_params.length, chart_params.height);
        // x-axis consists of a value for the stacked bar
        var x_axis = chart.addCategoryAxis("x", "Use");
        var y_axis = chart.addMeasureAxis("y", "Amount");
        x_axis.hidden = true;
        y_axis.hidden = true;

        // The bars are lightest at the top and darkest at the bottom
        for (i = 0; i < data.length; i++) {
            chart.assignColor(order_rule[data.length - 1 - i], "red", null, (i + 1) * 0.1);
        }

        // Bars are stacked using the type of money
        var bar = chart.addSeries("Type", dimple.plot.bar);
        // Ensure ordering of bars is fixed
        bar.addOrderRule(order_rule);

        svg.selectAll("text").remove();

        // Add title
        svg.append("text")
            .attr("x", chart_params.x + chart_params.length / 2)
            .attr("y", chart_params.y - 20)
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-weight", "bold")
            .text("Your Current Budget");

            // Add the labels every time the graph is re-drawn
        bar.afterDraw = function (shape, data) {
            var selected_shape = d3.select(shape)
            var rect = {
                x: parseFloat(selected_shape.attr("x")),
                y: parseFloat(selected_shape.attr("y")),
                width: parseFloat(selected_shape.attr("width")),
                height: parseFloat(selected_shape.attr("height"))
            };
            // Ensure there is space for label
            if (rect.height >= MIN_BAR_HEIGHT) {

                svg.append("text")
                    .attr("x", rect.x + rect.width / 2)
                    .attr("y", rect.y + rect.height / 2 + 4)
                    .style("text-anchor", "middle")
                    .style("font-size", "14px")
                    .style("font-family", "sans-serif")
                    .style("opacity", 0.8)
                // Prevent cursor from changing when hovering text
                    .style("pointer-events", "none")
                    .text(data.aggField + ": $" + (data.height * total/adjusted_total).toFixed(2));
            }

            bar.getTooltipText = function (e) {
                return [
                    e.srcElement.__data__.aggField[0] + ": $" +
                    (e.srcElement.__data__.height * total/adjusted_total).toFixed(2)
                ];
            };
        };

        chart.draw();


    }

    return (
        <div id="nowMoneyGraph">
            {/* <svg>
            </svg> */}
        </div>
    )


}

export default NowMoneyGraph;
