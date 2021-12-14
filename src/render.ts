import * as d3 from "d3";
import { Size } from "spotfire-api";

/**
 * Create the graphical elements with attributes that will remain the same through the lifetime of the
 * visualization in order to minimize unnecessary creation of elements in the main
 * interactive visualization loop. Drawing order are controlled via svg group (g) elements.
 */

const modContainer = d3.select("#mod-container");

// svg container
const svg = modContainer
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg");

const displayLayer = svg.append("g").attr("id", "backgroundLayer");

export async function render(
    dataView: Spotfire.DataView,
    windowSize: Size,
    toolTipDisplayAxes: Spotfire.Axis[],
    mod: Spotfire.Mod
) {
    let context = mod.getRenderContext();
    document.querySelector("#extra_styling")!.innerHTML = `
    .displayText { fill: ${context.styling.general.font.color}; font-size: ${context.styling.general.font.fontSize}px; font-weight: ${context.styling.general.font.fontWeight}; font-style: ${context.styling.general.font.fontStyle};}
    .message { fill: ${context.styling.general.font.color}; font-size: ${context.styling.general.font.fontSize}px; font-weight: ${context.styling.general.font.fontWeight}; font-style: ${context.styling.general.font.fontStyle};}
    `;

    //Read the data and meta data
    const rows = await dataView.allRows();

    //clean up and exit if no data
    if (!rows || rows.length < 1) {
        displayLayer.selectAll("*").remove();
        return;
    }

    const hasValue = !!(await dataView.continuousAxis("Value"));

    //Calculate positions for all elements of the visualization
    let modHeight = windowSize.height;
    let modWidth = windowSize.width;

    // set the viewbox of the svg element to match the available drawing area
    svg.attr("viewBox", "0 0 " + modWidth + " " + modHeight);

    let displayText = "";
    if (hasValue && rows != null) {
        displayText = `${rows[0].continuous("Value").formattedValue()}`;
    }

    displayLayer
        .selectAll(".displayText")
        .data([null])
        .enter()
        .append("text")
        .attr("class", "displayText");

    let fontSize = Math.min((1.5 * modWidth) / displayText.length, modHeight);

    displayLayer
        .selectAll(".displayText")
        .attr("x", modWidth / 2)
        .attr("y", modHeight / 2)
        .attr("alignment-baseline", "central")
        .style("font-size", fontSize + "px")
        .text(displayText);
}
