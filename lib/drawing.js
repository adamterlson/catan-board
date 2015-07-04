import * as utils from './utils';

const EDGE_SIZE = 40;
const SPACE = 500;

let svg = d3.select("body")
  .append("svg")
    .attr('viewBox', [-SPACE/2, -SPACE/2, SPACE, SPACE].join(' '))
    .attr("width", SPACE)
    .attr("height", SPACE)
  .append('g');

let drawLine = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear-closed");

function DrawTile(tile) {
  let cornerLocations = [];
  let tileLocation = utils.hexToPixel(tile.location, EDGE_SIZE);

  Object.keys(tile.corners).forEach(direction => {
    let corner = tile.corners[direction];
    cornerLocations.push(getCornerPixelLocation(corner));
  });

  svg.append("path")
    .attr("d", drawLine(cornerLocations))
    .attr('class', 'tile ' + tile.resource);

  svg.append("text")
    .attr("x", tileLocation.x)
    .attr("y", tileLocation.y)
    .attr("dy", ".35em")
    .text(tile.numberChip);
}

function DrawCorner(corner) {
  let location = getCornerPixelLocation(corner);
  svg.append('circle')
    .attr("cx", location.x)
    .attr("cy", location.y)
    .attr("class", 'node');  
}

function DrawBorder(border) {
  var corner1 = getCornerPixelLocation(border.corners[0]);
  var corner2 = getCornerPixelLocation(border.corners[1]);

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


function getCornerPixelLocation(corner) {
  let origin = utils.hexToPixel(corner.ownerTile.location, EDGE_SIZE);
  let i = utils.CORNER_INDEX_MAP[corner.direction];
  let angle_deg = 60 * i + 30;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = utils.Point(origin.x + EDGE_SIZE * Math.cos(angle_rad),
               origin.y + EDGE_SIZE * Math.sin(angle_rad));
  return p;
};