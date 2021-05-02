import * as dimple from 'dimple';
import React, { useEffect } from 'react';
import "./FutureMoneyGraph.css"

var chart_params = {
  x: 100,
  y: 40,
  length: 500,
  height: 450
}

function FutureMoneyGraph({ data }) {

    useEffect(() => {
        draw();
    }, [data]);

    const draw = () => {
        document.getElementById("futureMoneyGraph").innerHTML = ''

        var svg = dimple.newSvg("#futureMoneyGraph", chart_params.length + chart_params.x,
                                    chart_params.height + chart_params.y);

        var chart = new dimple.chart(svg, data);
        chart.setBounds(chart_params.x, chart_params.y, chart_params.length, chart_params.height - 50);
        var x_axis = chart.addCategoryAxis("x", "Year");
        var y_axis = chart.addMeasureAxis("y", "Value");
        y_axis.showGridlines = false;
        y_axis.title = "";
        x_axis.title = "";


        var series = chart.addSeries("Type", dimple.plot.area);
        series.addOrderRule(["Debt", "Contribution", "Interest"]);
        chart.assignColor("Debt", "red", "black", 0.7);
        chart.assignColor("Contribution", "red", "black", 0.3);
        chart.assignColor("Interest", "grey", "black", 0.3);

        var legend = chart.addLegend(250, 50, chart_params.width, chart_params.height, "Right");
        legend.fontSize = 15;


        svg.append("text")
          .attr("x", chart_params.x + chart_params.length / 2)
          .attr("y", chart_params.y - 20)
          .style("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-weight", "bold")
          .text("Your Future Money");

        chart.draw();

    }

    return (
        <div id="futureMoneyGraph">
        </div>
    )


}

export default FutureMoneyGraph;
