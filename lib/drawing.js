let svg = d3.select("body")
  .append("svg")
    .attr('viewBox', '-250 -250 500 500')
    .attr("width", 500)
    .attr("height", 500)
  .append('g');

let drawLine = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear-closed");

function DrawTile(tile) {
  let cornerLocations = [];

  Object.keys(tile.corners).forEach(direction => {
    let corner = tile.corners[direction];
    cornerLocations.push(corner.getPixelLocation());
  });

  svg.append("path")
    .attr("d", drawLine(cornerLocations))
    .attr('class', 'tile');
}

function DrawCorner(corner) {
  let location = corner.getPixelLocation();
  svg.append('circle')
    .attr("cx", location.x)
    .attr("cy", location.y)
    .attr("class", 'node');  
}

function DrawBorder(border) {
  var corner1 = border.corners[0].getPixelLocation();
  var corner2 = border.corners[1].getPixelLocation();

  svg.append("path")
    .attr("d", drawLine([corner1, corner2]))
    .attr('class', 'border');
}


export default {
  draw: function (board) {
    board.tiles.forEach(tile => DrawTile(tile));
    board.borders.forEach(border => DrawBorder(border));
    board.corners.forEach(corner => DrawCorner(corner));
  }
};