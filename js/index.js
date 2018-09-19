var url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'

// svg sizing
var w = 800
var h = 500
var padding = 70

// circle sizing
var r = 6

// colors
var legendData = {
  dope: {
    color: '#A56086',
    description: 'Riders with doping allegations'
  },

  clean: {
    color: '#2AC075',
    description: 'No doping allegations'
  }
}

  // create svg
var svg = d3
  .select('body')
  .append('svg')
  .attr('width', w)
  .attr('height', h)

// create tooltip element
var tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0)

// add title
svg
  .append('text')
  .attr('id', 'title')
  .text('Doping in Professional Bicycle Racing')
  .attr('x', w - 35)
  .attr('y', padding / 2 + 14)
  .attr('text-anchor', 'end')

// add subtitle
svg
  .append('text')
  .attr('id', 'subtitle')
  .text("35 Fastest times up Alpe d'Huez")
  .attr('x', w - 35)
  .attr('y', padding / 2 + 40)
  .attr('text-anchor', 'end')

// load in data
var req = new XMLHttpRequest()
req.open('GET', url, true)
req.send()
req.onload = function() {
  var data = JSON.parse(req.responseText)
  // converting "DateTime" values of data array to Date objects
  // in order to work with d3.scaleDateTime()
  data.forEach(function(d) {
    return (d.DateTime = new Date(d.Seconds * 1000))
  })

  var xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, function(d) {
        return d.Year - 1
      }),
      d3.max(data, function(d) {
        return d.Year + 1
      })
    ])
    .range([padding, w - padding])

  var yScale = d3
    .scaleTime()
    .domain([
      d3.min(data, function(d) {
        return d.DateTime
      }),
      d3.max(data, function(d) {
        return d.DateTime
      })
    ])
    .nice() // round the domain's min and max values to full intervals
    .range([padding, h - padding])

  // represent datapoints
  svg
    .selectAll('circle')
    .data(data, function(d) {
      return d.Year
    })
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', function(d) {
      return xScale(d.Year)
    })
    .attr('cy', function(d) {
      return yScale(d.DateTime)
    })
    .attr('r', r)
    .attr('data-xvalue', function(d) {
      return d.Year
    })
    .attr('data-yvalue', function(d) {
      return d.DateTime
    })
    .style('fill', function(d) {
      return d.Doping == '' ? legendData.clean.color : legendData.dope.color
    })
    .style('stroke', 'white')
    .style('stroke-width', 1)
    .style('opacity', 1)
    // add event listeners
    .on('mouseover', function(d) {
      tooltip
        .transition()
        .duration(100)
        .style('opacity', 0.9)
      tooltip
        .html(formatDataHTML(d))
        .style('left', d3.event.pageX + 15 + 'px')
        .style('top', d3.event.pageY - 30 + 'px')
      tooltip.attr('data-year', d.Year)
      svg
        .append('line')
        .attr('class', 'line')
        .attr('x1', xScale(d.Year) - 11)
        .attr('y1', yScale(d.DateTime))
        .attr('x2', padding + 1)
        .attr('y2', yScale(d.DateTime))
        .attr('stroke-width', 1)
        .attr('stroke', 'white')
      svg
        .append('line')
        .attr('class', 'line')
        .attr('x1', xScale(d.Year))
        .attr('y1', yScale(d.DateTime) + 11)
        .attr('x2', xScale(d.Year))
        .attr('y2', h - padding)
        .attr('stroke-width', 1)
        .attr('stroke', 'white')
    })
    .on('mouseout', function(d) {
      tooltip
        .transition()
        .duration(300)
        .style('opacity', 0)
      d3.selectAll('.line').remove()
    })
    .on('click', function(d) {
      return window.open(d.URL)
    }) // open wikipedia link in new tab

  function formatDataHTML(d) {
    var dopeText = d.Doping == '' ? 'No allegations' : d.Doping
    return (
      '<span class="name">' +
      d.Name +
      '</span> ' +
      d.Year +
      ' | ' +
      d.Time +
      'min<br>\n            <strong>Doping:</strong> ' +
      dopeText +
      '<br>'
    )
  }

  // create axes
  var timeFormat = d3.timeFormat('%M:%S')
  var xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.format('d'))
    .tickPadding(9)
  var yAxis = d3
    .axisLeft(yScale)
    .tickFormat(timeFormat)
    .tickPadding(8)

  svg
    .append('g')
    .attr('transform', 'translate(0, ' + (h - padding) + ')')
    .attr('id', 'x-axis')
    .call(xAxis)

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', 0)')
    .attr('id', 'y-axis')
    .call(yAxis)

  // create label for the y axis
  svg
    .append('text')
    .attr('x', padding - 45)
    .attr('y', padding - 25)
    .style('text-anchor', 'start')
    .text('Time (mins)')
    .attr('class', 'axis-label')

  // legend setup
  var legendX = 550
  var legendY = 140
  var side = 18
  var margin = 12
  var lineHeight = 6

  // create group element for legend items
  var legend = svg.append('g').attr('id', 'legend')

  // generate legend entries
  Object.keys(legendData).map(function(entry, i) {
    legend
      .append('rect')
      .attr('x', legendX)
      .attr('y', legendY + (side + lineHeight) * i)
      .attr('width', side)
      .attr('height', side)
      .style('fill', legendData[entry].color)
    legend
      .append('text')
      .attr('class', 'legend-text')
      .attr('x', legendX + side + margin)
      .attr('y', legendY + 14 + (side + lineHeight) * i)
      .text(legendData[entry].description)
  })
}
