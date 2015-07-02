'use strict';

const DIRECTION_MAPS = {
  CORNERS: {
    N: { q: 0, r: 0, corner: 'N' },
    NE: { q: +1, r: -1, corner: 'S' },
    SE: { q: 0, r: +1, corner: 'N' },
    S: { q: 0, r: 0, corner: 'S' },
    SW: { q: -1, r: +1, corner: 'N' },
    NW: { q: 0, r: -1, corner: 'S' }
  },
  BORDERS: {
    NW: { q: 0, r: 0, border: 'NW' },
    NE: { q: +1, r: -1, border: 'SW' },
    E: { q: +1, r: 0, border: 'W' },
    SE: { q: 0, r: +1, border: 'NW' },
    SW: { q: 0, r: 0, border: 'SW' },
    W: { q: 0, r: 0, border: 'W' }
  }
};

const CORNER_INDEX_MAP = {
  N: 5,
  NE: 6,
  SE: 1,
  S: 2,
  SW: 3,
  NW: 4
};

let Board = function (canvasId) {
  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext('2d');
  this.context.translate(this.canvas.width / 2, this.canvas.height / 2);

  this.radius = 1;
  this.tiles = [];

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

Board.prototype.cubeNeighbors = function (tile) {
  let directions = [
     Cube(+1, -1,  0), Cube(+1,  0, -1), Cube(0, +1, -1),
     Cube(-1, +1,  0), Cube(-1,  0, +1), Cube(0, -1, +1)
  ];
  let location = tile.location;

  return directions.map(function (direction) {
    return cubeAdd(hexToCube(location), directions[direction]);
  });
};

Board.prototype.hexNeighbors = function (tile) {
  let directions = [
    Hex(+1,  0), Hex(+1, -1), Hex(0, -1),
    Hex(-1,  0), Hex(-1, +1), Hex(0, +1)
  ];
  let location = tile.location;

  return directions.map(function (direction) { 
    return hexAdd(location, direction); 
  });
};

Board.prototype.validNeighbors = function (tile) {
  return this.hexNeighbors(tile)
    .map(function (hex) {
      return this.getTileByHex(hex);
    }.bind(this))
    .filter(function (tile) { return tile != undefined; });
};

Board.prototype.assignCorners = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.corners).forEach(direction => {
      if (tile.corners[direction]) return;

      var coordTranslate = DIRECTION_MAPS.CORNERS[direction];
      var neighborCoord = hexAdd(coordTranslate, tile.location);
      var neighborTile = this.getTileByHex(neighborCoord);
      var corner;

      if (neighborTile === tile) return;

      if (neighborTile) {
        corner = neighborTile.corners[coordTranslate.corner];
      } else {
        corner = new Corner();
      }
      
      corner.tiles.push(tile);
      tile.corners[direction] = corner;
    });
  });
};

Board.prototype.assignBorders = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.borders).forEach(direction => {
      if (tile.borders[direction]) return;

      var coordTranslate = DIRECTION_MAPS.BORDERS[direction];
      var neighborCoord = hexAdd(coordTranslate, tile.location);
      var neighborTile = this.getTileByHex(neighborCoord);
      var border;

      if (neighborTile === tile) return;
      if (neighborTile) {
        border = neighborTile.borders[coordTranslate.border];
      } else {
        border = new Border();
      }
      
      border.tiles.push(tile);
      tile.borders[direction] = border;
    });
  });
};

let Corner = function () {
  this.tiles = [];
};

let Border = function () {
  this.tiles = [];
};


let Tile = function (hex) {
  this.size = 30;
  this.lineWidth = 2;
  this.location = hex;
  this.strokeStyle = '#666';

  var north = new Corner();
  north.tiles.push(this);
  var south = new Corner();
  south.tiles.push(this);

  this.corners = {
    N: this.makeCorner(),
    NE: null,
    SE: null,
    S: this.makeCorner(),
    SW: null,
    NW: null
  };

  this.borders = {
    NW: this.makeBorder(),
    NE: null,
    E: null,
    SE: null,
    SW: this.makeBorder(),
    W: this.makeBorder()
  };
};

Tile.prototype.makeCorner = function () {
  var corner = new Corner();
  corner.tiles.push(this);

  return corner;
};

Tile.prototype.makeBorder = function () {
  var border = new Border();
  border.tiles.push(this);

  return border;
};

Tile.prototype.width = function () {
  return Math.sqrt(3)/2 * this.height();
};

Tile.prototype.height = function () {
  return this.size * 2;
};

Tile.prototype.moveHex = function (hex) {
  this.location = hex;
};

Tile.prototype.makeCornerPoints = function () {
  return Object.keys(this.corners).map(function (key) {
    var corner = this.corners[key];
    var i = CORNER_INDEX_MAP[key];

    return this.hexCorner(i);
  }, this);
};

Tile.prototype.hexCorner = function (i) {
  let origin = hexToPixel(this.location, this.size);
  let angle_deg = 60 * i + 30;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = Point(origin.x + this.size * Math.cos(angle_rad),
               origin.y + this.size * Math.sin(angle_rad));
  return p;
};

Tile.prototype.drawingOrigin = function () {
  let origin = hexToPixel(this.location, this.size);

  return {
    x: origin.x + this.lineWidth/2,
    y: origin.y + this.lineWidth/2
  };
};

Tile.prototype.draw = function (context) {
  var corners = this.makeCornerPoints();
  this.drawCorners(context, corners);

  let origin = this.drawingOrigin();

  let path = new Path2D();
  path.moveTo(corners[0].x, corners[0].y);
  corners.forEach(function (point) {
    path.lineTo(point.x, point.y);
  });

  path.closePath();

  context.lineWidth = this.lineWidth;
  context.strokeStyle = this.strokeStyle;

  context.stroke(path);
};

Tile.prototype.drawCorners = function (context, corners) {
  let origin = this.drawingOrigin();

  corners.forEach(point => {
    let path = new Path2D();

    path.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.stroke(path);
  });

};


let board = new Board('board');
board.draw();

board.validNeighbors(board.tiles[6]).forEach(function (n) {
  n.strokeStyle = '#0f0';
});

board.tiles[0].borders['NE'].tiles.forEach(tile => {
  tile.strokeStyle = '#00f';
});

board.draw();



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