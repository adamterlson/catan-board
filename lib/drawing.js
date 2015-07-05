import * as utils from './utils';

const EDGE_SIZE = 90;
const SPACE = 800;

let svg = d3.select('body')
  .append('svg')
    .attr('viewBox', [-SPACE/2, -SPACE/2, SPACE, SPACE].join(' '))
    .attr('width', SPACE)
    .attr('height', SPACE)
  .append('g');

let drawLine = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate('linear-closed');

function DrawTile(tile) {
  let cornerLocations = [];
  let tileLocation = utils.hexToPixel(tile.location, EDGE_SIZE);

  Object.keys(tile.corners).forEach(direction => {
    let corner = tile.corners[direction];
    cornerLocations.push(getCornerPixelLocation(corner));
  });

  let hexSVG = svg.append('path')
    .attr('d', drawLine(cornerLocations))
    .classed('tile ' + tile.resource, true);

  svg.append('text')
    .attr('x', tileLocation.x)
    .attr('y', tileLocation.y)
    .attr('dy', '.35em')
    .text(tile.numberChip);

  if (tile.robber) {
    svg.append('circle')
      .attr('cx', tile.location.x)
      .attr('cy', tile.location.y)
      .attr('class', 'robber');  
  }
}

function DrawPiece(fn) {
  return function (piece) {
    var pieceSVG = fn.apply(this, arguments);
    if (piece.player) {
      pieceSVG
        .classed('owned', true)
        .classed(piece.player, true);
    }
    if (piece.level) {
      pieceSVG
        .classed('level' + piece.level, true);
    }
  };
}

let DrawCorner = DrawPiece(function (corner) {
  let location = getCornerPixelLocation(corner);
  return svg.append('circle')
    .attr('cx', location.x)
    .attr('cy', location.y)
    .attr('class', 'node');  
});

let DrawBorder = DrawPiece(function (border) {
  let corner1 = getCornerPixelLocation(border.corners[0]);
  let corner2 = getCornerPixelLocation(border.corners[1]);

  let classes = ['border'];

  if (border.player) {
    svg.append('path')
      .attr('d', drawLine([corner1, corner2]))
      .classed('border', true)
      .classed('background', true);
  }

  return svg.append('path')
    .attr('d', drawLine([corner1, corner2]))
    .classed('border', true);
});


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
  let angle_deg = 60 * (i + 1) + 30 + 180;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = utils.Point(origin.x + EDGE_SIZE * Math.cos(angle_rad),
               origin.y + EDGE_SIZE * Math.sin(angle_rad));
  return p;
};