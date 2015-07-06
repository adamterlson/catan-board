import * as utils from './utils';

const EDGE_SIZE = 60;
const SPACE = 800;

let svg = d3.select('body')
  .append('svg')
    .attr('viewBox', [-SPACE/2, -SPACE/2, SPACE, SPACE].join(' '))
    .attr('width', SPACE)
    .attr('height', SPACE)
  .append('g');

let drawLineTypes = function (open) {
  return d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate(open ? 'linear' : 'linear-closed');
};

let writeText = function (location, text, parent) {
  return (parent || svg).append('text')
    .attr('x', location.x)
    .attr('y', location.y)
    .attr('dy', '.35em')
    .text(text);
};

let drawLine = drawLineTypes();
let drawOpenLine = drawLineTypes(true);

function DrawTile(tile) {
  let group = svg.append('g')
    .classed('tile', true);

  if (tile.type === 'resource') {
    group.classed(tile.resource, true);
  } else if (tile.type === 'desert') {
    group.classed('desert', true);
  } else {
    group.classed('ocean', true);
  }

  let cornerLocations = [];
  let tileLocation = utils.hexToPixel(tile.location, EDGE_SIZE);

  Object.keys(tile.corners).forEach(direction => {
    cornerLocations.push(getCornerPixelLocation(tile.location, direction));
  });

  group.append('path')
    .attr('d', drawLine(cornerLocations));

  writeText(tileLocation, tile.numberChip, group);

  if (tile.robber) {
    group.append('circle')
      .attr('cx', tile.location.x)
      .attr('cy', tile.location.y)
      .attr('class', 'robber');  
  }

  return group;
}

function DrawPort(border) {
  let location = utils.hexToPixel(border.port.ownerTile.location, EDGE_SIZE);
  let group = svg.append('g')
    .classed('port', true)
    .classed(border.port.type, true);

  let circle = group.append('circle')
      .attr('cx', location.x)
      .attr('cy', location.y);

  if (border.port.resource) {
    group.classed(border.port.resource, true);
    circle.classed(border.port.resource, true);
  }

  let corner1 = getCornerPixelLocation(border.corners[0].ownerTile.location, border.corners[0].direction);
  let corner2 = getCornerPixelLocation(border.corners[1].ownerTile.location, border.corners[1].direction);

  let portIcon = group.append('path')
    .attr('d', drawOpenLine([corner1, location, corner2]));

  let description;
  if (border.port.resource) {
    description = '2:1';
  } else {
    description = '3:1';
  }
  writeText(location, description, group);
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
  let location = getCornerPixelLocation(corner.ownerTile.location, corner.direction);
  return svg.append('circle')
    .attr('cx', location.x)
    .attr('cy', location.y)
    .attr('class', 'node');  
});

let DrawBorder = DrawPiece(function (border) {
  let corner1 = getCornerPixelLocation(border.corners[0].ownerTile.location, border.corners[0].direction);
  let corner2 = getCornerPixelLocation(border.corners[1].ownerTile.location, border.corners[1].direction);

  let classes = ['border'];

  if (border.player) {
    svg.append('path')
      .attr('d', drawLine([corner1, corner2]))
      .classed('border', true)
      .classed('background', true);
  }

  if (border.port) {
    DrawPort(border);
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



function getCornerPixelLocation(location, direction) {
  let origin = utils.hexToPixel(location, EDGE_SIZE);
  let i = utils.CORNER_INDEX_MAP[direction];
  let angle_deg = 60 * (i + 1) + 30 + 180;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = utils.Point(origin.x + EDGE_SIZE * Math.cos(angle_rad),
               origin.y + EDGE_SIZE * Math.sin(angle_rad));
  return p;
};