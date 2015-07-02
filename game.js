'use strict';

let Board = function (canvasId) {
  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext('2d');
  this.context.translate(this.canvas.width / 2, this.canvas.height / 2);

  this.radius = 3;
  this.tiles = [];

  this.hexGrid = this.makeHexGrid(this.radius);
};

Board.prototype.makeHexGrid = function (radius, tileSize) {
  let cols = [];

  for (let q = -radius; q <= radius; q++) {
    let row = [];
    for (let r = -radius; r <= radius; r++) {
      let hex = new Hex(q, r);
      let cube = hexToCube(hex);
      if (cube_distance(cube, {x: 0, y: 0, z: 0}) <= this.radius) {
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
  this.tiles.forEach(function (tile) { 
    tile.draw(this.context); 
  }.bind(this));
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
    return cube_add(hexToCube(location), directions[direction]);
  });
};

Board.prototype.hexNeighbors = function (tile) {
  let directions = [
    Hex(+1,  0), Hex(+1, -1), Hex(0, -1),
    Hex(-1,  0), Hex(-1, +1), Hex(0, +1)
  ];
  let location = tile.location;

  return directions.map(function (direction) { 
    return hex_add(location, direction); 
  });
};

Board.prototype.validNeighbors = function (tile) {
  return this.hexNeighbors(tile)
    .map(function (hex) {
      return this.getTileByHex(hex);
    }.bind(this))
    .filter(function (tile) { return tile != undefined; });
};


let Tile = function (hex) {
  this.size = 30;
  this.lineWidth = 2;
  this.location = hex;
  this.strokeStyle = '#666';
  this.corners = [];

  this.makeCorners();
};

Tile.prototype.width = function () {
  return Math.sqrt(3)/2 * this.height();
};

Tile.prototype.height = function () {
  return this.size * 2;
};

Tile.prototype.moveHex = function (hex) {
  this.location = hex;

  this.makeCorners();
};

Tile.prototype.makeCorners = function () {
  this.corners = [];
  for (let i = 0; i < 6; i++) {
    this.corners.push(this.hexCorner(i));
  }
};

Tile.prototype.hexCorner = function (i) {
  let origin = hex_to_pixel(this.location, this.size);
  let angle_deg = 60 * i + 30;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = Point(origin.x + this.size * Math.cos(angle_rad),
               origin.y + this.size * Math.sin(angle_rad));
  return p;
};

Tile.prototype.drawingOrigin = function () {
  let origin = hex_to_pixel(this.location, this.size);

  return {
    x: origin.x + this.lineWidth/2,
    y: origin.y + this.lineWidth/2
  };
};

Tile.prototype.draw = function (context) {
  let origin = this.drawingOrigin();

  let path = new Path2D();
  path.moveTo(this.corners[0].x, this.corners[0].y);
  this.corners.forEach(function (point) {
    path.lineTo(point.x, point.y);
  });

  path.closePath();

  context.lineWidth = this.lineWidth;
  context.strokeStyle = this.strokeStyle;

  context.stroke(path);
};


let board = new Board('board');
board.draw();

board.tiles.forEach(function (tile) {
  console.log(tile.location);
})
console.log('a', board.tiles[6]);
board.validNeighbors(board.tiles[6]).forEach(function (n) {
  n.strokeStyle = '#f00';
  n.draw(board.context);
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

/**
 * Util Functions
 */

function hex_to_pixel(hex, size) {
  if (!hex || !size) {
    throw new Error('Need hex and size');
  }

  let x = size * Math.sqrt(3) * (hex.q + hex.r/2)
  let y = size * 3/2 * hex.r
  return Point(x, y);
}

function cube_distance(a, b) {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

function cube_add(a, b) {
  return Cube(a.x + b.x, a.y + b.y, a.z + b.z);
}

function hex_add(a, b) {
  return Hex(a.q + b.q, a.r + b.r);
}