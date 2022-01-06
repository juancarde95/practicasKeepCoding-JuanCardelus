// variables definition
const width = 800
const height = 600
const margin = {
    top: 10,
    bottom: 40,
    left: 60,
    right: 10
}
 
// svg lable append
const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height).attr("id", "svg")

const elementsGroup = svg.append("g").attr("id", "elementsGroup")
    .attr("transform", `translate(${margin.left +1}, ${margin.top})`)

const elementsGroup2 = svg.append("g").attr("id", "elementsGroup2")
    .attr("transform", `translate(${margin.left}, ${-margin.top - margin.bottom})`)

// scales & axis
// scales
var x = d3.scaleTime().range([0, width - margin.left - margin.right])

var y = d3.scaleLinear().range([height - margin.left - margin.top, 0])
var y2 = d3.scaleLinear().range([height - margin.left - margin.top, 400])

// axis group to append in the svg
const axisGroup = svg.append("g").attr("id", "axisGroup")
const axisGroup2 = svg.append("g").attr("id", "axisGroup2")

// axis variable groups to append in the axisGroup(in the svg)
const xGroup = axisGroup.append("g").attr("id", "xGroup")
    .attr("transform", `translate (${margin.left}, ${height-margin.left})`)
const xGroup2 = axisGroup2.append("g").attr("id", "xGroup2")
    .attr("transform", `translate (${margin.left}, ${height-margin.left})`)
const yGroup = axisGroup.append("g").attr("id", "yGroup")
    .attr("transform", `translate (${margin.left}, ${margin.top})`)
const yGroup2 = axisGroup2.append("g").attr("id", "yGroup2")
    .attr("transform", `translate (${margin.left}, ${margin.top})`)

// axis variables
var xAxis = d3.axisBottom().scale(x)
var yAxis = d3.axisLeft().scale(y)
var yAxis2 = d3.axisLeft().scale(y2)

// formatDate Variable and formatNumber
const formatDate = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%m-%d-%Y")

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function noDecimals(n){
    return n.toFixed(0)}

//Tooltip and refLine
const div = d3.select("#chart").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0)

var refLineGroup = elementsGroup.append("g").attr("id", "refLineGroup")
var maxRefLine = refLineGroup.append("line").attr("id", "maxRefLine")
var maxRefText = refLineGroup.append("text").attr("id", "maxRefText")

// dataCalling
d3.csv("ibex.csv").then(myData => {
    
    // dataMapping
    myData.map(d => {
        d.date = formatDate(d.date)
        d.close = +d.close
        d.high = +d.high
        d.low = +d.low
        d.open = +d.open
        d.volume = +d.volume
    })
    console.log(myData)

    // domains
    // X domain with the date
    x.domain(d3.extent(myData.map(d => d.date))) // discrete data (no max-min needed just extent)

    // Y domain with the close price
    y.domain([
        d3.min(myData.map(d=>d.close))-1500,
        d3.max(myData.map(d=>d.close))+500
    ])

    // Y2 domain with the volume
    y2.domain([
        d3.min(myData.map(d=>d.volume)),
        d3.max(myData.map(d=>d.volume))+500
    ])

    // calling the axis
    yGroup.call(yAxis)
    xGroup.call(xAxis)

    // defining element variable
    var elements = elementsGroup2.selectAll("rect").data(myData)
    elements.enter().append("rect")
        .attr("height", d => height - y2(d.volume) - margin.top) 
        .attr("y", d=> y2(d.volume))
        .attr("x", d => x(d.date))
        .attr("width", 2)
        .attr("fill", d => (d.open > d.close ? "red" : "green"))
        .on("mouseover", function(d) {
            div.transition()
                .duration(100)
                .style("opacity", .95)
            div.html("<b>" + "Date: " + "</b>" + formatTime(d.date) + "<br/>"  + "<b>" + "Volume: " + "</b>" + formatNumber(noDecimals(d.volume)))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
            })
        .on("mouseout", function(d) {
            div.transition()		
                .duration(500)
                .style("opacity", 0)})


    // drawing the area
    elementsGroup.datum(myData)
    .append('path')
    .attr("d", d3.area()
        .x((d) => { return x(d.date) })
        .y0(height - margin.top - margin.left)
        .y1((d) => { return y(d.close) })
        .curve(d3.curveCardinal))


    // add the scatterplot for the tooltip
    elementsGroup.selectAll("dot")	
        .data(myData)			
    .enter().append("circle")								
        .attr("r", 2)		
        .attr("cx", function(d) { return x(d.date) })		 
        .attr("cy", function(d) { return y(d.close) })
        .attr("fill", "#16705b")
        .on("mouseover", function(d) {
            div.transition()
                .duration(100)
                .style("opacity", .95)
            div.html("<b>" + "Date: " + "</b>" + formatTime(d.date) + "<br/>"  + "<b>" + "Value: " + "</b>" + formatNumber(noDecimals(d.close)))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
            })					
        .on("mouseout", function(d) {
            div.transition()		
                .duration(500)
                .style("opacity", 0)})

    // maxRefLine
    maxRefLine
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(d3.max(myData.map(d => d.close))))
        .attr("y2", y(d3.max(myData.map(d => d.close))))

    maxRefText
        .attr("transform", `translate (${3}, ${y(d3.max(myData.map(d => d.close)))-5})`)
        .text("Max: " + formatNumber(noDecimals(d3.max(myData.map(d => d.close)))))

    // title
    svg.append("text")     
        .style("font-size", "16px")
        .style("font", "sans-serif")
        .style("text-decoration", "underline") 
        .style("text-decoration", "bold") 
        .text("Práctica D3 - Juan Cardelús")
        .attr("transform", `translate (${margin.left +20}, ${margin.top +20})`)

})





