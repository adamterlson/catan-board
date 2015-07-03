'use strict';

const DIRECTION_MAPS = {
  CORNERS: {
    N: [{ q: 0, r: 0, corner: 'N' }],
    NE: [{ q: +1, r: -1, corner: 'S' }, { q: +1, r: 0, corner: 'NW' }],
    SE: [{ q: 0, r: +1, corner: 'N' }, { q: +1, r: 0, corner: 'SW' }],
    S: [{ q: 0, r: 0, corner: 'S' }],
    SW: [{ q: -1, r: +1, corner: 'N' }, { q: -1, r: 0, corner: 'SE' }],
    NW: [{ q: 0, r: -1, corner: 'S' }, { q: -1, r: 0, corner: 'NE' }]
  },
  BORDERS: {
    NW: { q: 0, r: 0, border: 'NW', corners: ['NW', 'N'] },
    NE: { q: +1, r: -1, border: 'SW', corners: ['N', 'NE']},
    E: { q: +1, r: 0, border: 'W', corners: ['NE', 'SE'] },
    SE: { q: 0, r: +1, border: 'NW', corners: ['SE', 'S']},
    SW: { q: 0, r: 0, border: 'SW', corners: ['S', 'SW'] },
    W: { q: 0, r: 0, border: 'W', corners: ['SW', 'NW'] }
  },
  NEIGHBORS: {
    NW: { q: 0, r: -1 },
    NE: { q: +1, r: -1 },
    E: { q: +1, r: 0 },
    SE: { q: 0, r: +1 },
    SW: { q: -1, r: +1 },
    W: { q: -1, r: 0 }
  }
};

const CORNER_INDEX_MAP = {
  N: 4,
  NE: 5,
  SE: 6,
  S: 1,
  SW: 2,
  NW: 3
};

const EDGE_SIZE = 30;

let Board = function (canvasId) {
  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext('2d');
  this.context.translate(this.canvas.width / 2, this.canvas.height / 2);

  this.radius = 1;
  this.tiles = [];
  this.corners = [];
  this.borders = [];

  this.hexGrid = this.makeHexGrid(this.radius);
  this.assignCorners();
  this.assignBorders();
};

Board.prototype.makeHexGrid = function (radius, tileSize) {
  let cols = [];

  for (let q = -radius; q <= radius; q++) {
    let row = [];
    for (let r = -radius; r <= radius; r++) {
      let hex = new Hex(q, r);
      let cube = hexToCube(hex);
      if (cubeDistance(cube, {x: 0, y: 0, z: 0}) <= this.radius) {
        let tile = new Tile(hex);

        row.push(tile);
        this.tiles.push(tile);
      } else {
        row.push(null);
      }
    }
    cols.push(row);
  }

  return cols
};

Board.prototype.draw = function () {
  this.tiles.forEach((tile) => { 
    tile.draw(this.context); 
  });
};

Board.prototype.getTileByHex = function (hex) {
  var res = this.tiles.filter(function (tile) {
    return tile.location.q === hex.q && tile.location.r === hex.r;
  });

  return res.length ? res[0] : null;
};

Board.prototype.getTileNeighbor = function (tile, direction) {
  return this.getTileByHex(hexAdd(tile.location, DIRECTION_MAPS.NEIGHBORS[direction]));
};

Board.prototype.assignCorners = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.corners).forEach(direction => {
      if (tile.corners[direction]) {
        this.corners.push(tile.corners[direction]);
        return;
      };

      var coordTranslates = DIRECTION_MAPS.CORNERS[direction];
      var corner;
      coordTranslates.forEach(coordTranslate => {
        if (corner) { return; }
        var neighborCoord = hexAdd(coordTranslate, tile.location);
        var neighborTile = this.getTileByHex(neighborCoord);

        if (neighborTile === tile) return;

        if (neighborTile) {
          corner = neighborTile.corners[coordTranslate.corner];
        }
      });
      if (!corner) {
        corner = tile.makeCorner(direction);
        this.corners.push(corner);
      }
      
      corner.tiles.push(tile);
      tile.corners[direction] = corner;
    });
  });
};

Board.prototype.assignBorders = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.borders).forEach(direction => {
      if (tile.borders[direction]) {
        this.borders.push(tile.borders[direction]);

        tile.borders[direction].corners = DIRECTION_MAPS.BORDERS[direction].corners.map(cornerDirection => {
          return tile.corners[cornerDirection];
        });

        return;
      };

      var coordTranslate = DIRECTION_MAPS.BORDERS[direction];
      var neighborCoord = hexAdd(coordTranslate, tile.location);
      var neighborTile = this.getTileByHex(neighborCoord);
      var border;

      if (neighborTile === tile) return;
      if (neighborTile) {
        border = neighborTile.borders[coordTranslate.border];
      } else {
        border = tile.makeBorder(direction);

        border.corners = coordTranslate.corners.map(function (cornerDirection) {
          return tile.corners[cornerDirection];
        });

        this.borders.push(border);
      }
      
      border.tiles.push(tile);
      tile.borders[direction] = border;
    });
  });
};

Board.prototype.draw = function () {
  this.tiles.forEach(tile => tile.draw(this.context));
};

let Corner = function (ownerTile, direction) {
  this.tiles = [];
  this.ownerTile = ownerTile;
  this.direction = direction;
  this.radius = 5;
};

Corner.prototype.makeCornerPoints = function () {
  return Object.keys(this.corners).map(function (key) {
    var corner = this.corners[key];
    var i = CORNER_INDEX_MAP[key];

    return this.hexCorner(i);
  }, this);
};

Corner.prototype.drawingOrigin = function () {
  let origin = hexToPixel(this.ownerTile.location, EDGE_SIZE);

  return {
    x: origin.x + this.lineWidth/2,
    y: origin.y + this.lineWidth/2
  };
};

Corner.prototype.draw = function (context) {
  let point = this.getPixelLocation();
  let path = new Path2D();

  path.arc(point.x, point.y, this.radius, 0, 2 * Math.PI, false);
  context.lineWidth = this.lineWidth;
  context.strokeStyle = this.strokeStyle;
  context.stroke(path);
};

Corner.prototype.getPixelLocation = function () {
  let origin = hexToPixel(this.ownerTile.location, EDGE_SIZE);
  let i = CORNER_INDEX_MAP[this.direction];
  let angle_deg = 60 * i + 30;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = Point(origin.x + EDGE_SIZE * Math.cos(angle_rad),
               origin.y + EDGE_SIZE * Math.sin(angle_rad));
  return p;
};

let Border = function (ownerTile, direction) {
  this.tiles = [];
  this.corners = [];
  this.lineWidth = 2;
  this.strokeStyle = '#666';
  this.ownerTile = ownerTile;
  this.direction = direction;
};

Border.prototype.draw = function (context) {
  let path = new Path2D();
  var corner1Location = this.corners[0].getPixelLocation();
  var corner2Location = this.corners[1].getPixelLocation();

  path.moveTo(corner1Location.x, corner1Location.y);
  path.lineTo(corner2Location.x, corner2Location.y);

  context.lineWidth = this.lineWidth;
  context.strokeStyle = this.strokeStyle;

  context.stroke(path);
};


let Tile = function (hex) {
  this.location = hex;

  this.corners = {
    N: this.makeCorner('N'),
    NE: null,
    SE: null,
    S: this.makeCorner('S'),
    SW: null,
    NW: null
  };

  this.borders = {
    NW: this.makeBorder('NW'),
    NE: null,
    E: null,
    SE: null,
    SW: this.makeBorder('SW'),
    W: this.makeBorder('W')
  };
};

Tile.prototype.makeCorner = function (direction) {
  var corner = new Corner(this, direction);
  corner.tiles.push(this);

  return corner;
};

Tile.prototype.makeBorder = function (direction) {
  var border = new Border(this, direction);
  border.tiles.push(this);

  return border;
};

Tile.prototype.width = function () {
  return Math.sqrt(3)/2 * this.height();
};

Tile.prototype.height = function () {
  return EDGE_SIZE * 2;
};

Tile.prototype.moveHex = function (hex) {
  this.location = hex;
};

Tile.prototype.draw = function (context) {
  Object.keys(this.corners).forEach(direction => {
    let corner = this.corners[direction];
    if (corner.ownerTile === this) {
      corner.draw(context);
    }
  });

  Object.keys(this.borders).forEach(direction => {
    let border = this.borders[direction];
    if (border.ownerTile === this) {
      border.draw(context);
    }
  });
};


let board = new Board('board');
//board.draw();

console.log(board.corners.length);
console.log(board.borders.length);

board.corners.forEach(corner => {
  corner.radius = Math.round(Math.random()*5) + 1;
  corner.draw(board.context);
});

board.borders.forEach(border => {
  border.radius = Math.round(Math.random()*5) + 1;
  border.draw(board.context);
});

board.tiles[0].borders['NE'].tiles.forEach(tile => {
  tile.strokeStyle = '#00f';
});




/**
 * Coord Types
 */

function Point(x, y) {
  return { x: x, y: y };
};

function Hex(q, r) {
  return { q: q, r: r };
};

function Cube(x, y, z) {
  return {
    x: x,
    y: y,
    z: z
  };
};

/**
 * Type Conversions
 */

function cubeToHex(h) {
  return Hex(h.x, h.z);
}

function hexToCube(h) {
  let x = h.q;
  let z = h.r;
  let y = -x-z;

  return Cube(x, y, z);
}

function hexToPixel(h, size) {
  if (!h || !size) {
    throw new Error('Need hex and size');
  }

  let x = size * Math.sqrt(3) * (h.q + h.r/2)
  let y = size * 3/2 * h.r
  return Point(x, y);
}

/**
 * Util Functions
 */

function cubeDistance(a, b) {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

function cubeAdd(a, b) {
  return Cube(a.x + b.x, a.y + b.y, a.z + b.z);
}

function hexAdd(a, b) {
  return Hex(a.q + b.q, a.r + b.r);
}