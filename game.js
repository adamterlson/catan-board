'use strict';

let Point = function (x, y) {
  return { x: x, y: y };
};

let Hex = function (q, r) {
  return { q: q, r: r };
};

function cubeToHex(h) {
  return {
    q: h.x,
    r: h.z
  };
}

function hexToCube(h) {
  let x = h.q;
  let z = h.r;
  let y = -x-z;
  return {
    x: x,
    y: y,
    z: z
  };
}

function hex_to_pixel(hex, size) {
  let x = size * Math.sqrt(3) * (hex.q + hex.r/2)
  let y = size * 3/2 * hex.r
  return Point(x, y);
}

function cube_distance(a, b) {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

let Board = function (canvasId) {
  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext('2d');
  this.radius = 3;
  this.tiles = [];
  this.offset = { x: 300, y: 300 };

  this.hexGrid = this.makeHexGrid(this.radius);
};

Board.prototype.forEachTile = function (fn) {
  for (let q = 0; q < this.hexGrid.length; q++) {
    let row = this.hexGrid[q];
    for (let r = 0; r < row.length; r++) {
      if (row[r]) {
        fn(row[r]);
      }
    }
  }
};

Board.prototype.makeHexGrid = function (radius, tileSize) {
  let cols = [];

  for (let q = -radius; q <= radius; q++) {
    let row = [];
    for (let r = -radius; r <= radius; r++) {
      let hex = new Hex(q, r);
      let cube = hexToCube(hex);
      if (cube_distance(cube, {x: 0, y: 0, z: 0}) <= this.radius) {
        let tile = new Tile();

        tile.moveHex(hex);
        tile.translate(this.offset);

        row.push(tile);
      } else {
        row.push(null);
      }
    }
    cols.push(row);
  }

  return cols
};

Board.prototype.draw = function () {
  this.forEachTile(function (tile) { 
    tile.draw(this.context); 
  }.bind(this));
};

Board.prototype.firstColumn = function (row) {
  return -this.radius - Math.min(0, row)
},

Board.prototype.getCoord = function (q, r) {

};


let Tile = function () {
  this.size = 30;
  this.lineWidth = 10;
  this.origin = { x: 0, y: 0 };

  this.makeCorners();
};

Tile.prototype.width = function () {
  return Math.sqrt(3)/2 * this.height();
};

Tile.prototype.height = function () {
  return this.size * 2;
};

Tile.prototype.move = function (point) {
  this.origin = point;

  this.makeCorners();
};

Tile.prototype.moveHex = function (hex) {
  return this.move(hex_to_pixel(hex, this.size));
};

Tile.prototype.translate = function (offset) {
  this.move({
    x: this.origin.x + offset.x,
    y: this.origin.y + offset.y
  });
};

Tile.prototype.makeCorners = function () {
  this.corners = [];
  for (let i = 0; i < 6; i++) {
    this.corners.push(this.hexCorner(i));
  }
};

Tile.prototype.hexCorner = function (i) {
  let angle_deg = 60 * i + 30;
  let angle_rad = Math.PI / 180 * angle_deg;
  let p = Point(this.origin.x + this.size * Math.cos(angle_rad),
               this.origin.y + this.size * Math.sin(angle_rad));
  return p;
};

Tile.prototype.drawingOrigin = function () {
  return {
    x: this.origin.x + this.lineWidth/2,
    y: this.origin.y + this.lineWidth/2
  };
};

Tile.prototype.drawingSize = function () {
  return this.size;
};

Tile.prototype.draw = function (context) {
  let origin = this.drawingOrigin();
  let size = this.drawingSize();

  let path = new Path2D();

  path.moveTo(this.corners[0].x, this.corners[0].y);
  this.corners.forEach(function (point) {
    path.lineTo(point.x, point.y);
  });

  path.closePath();

  context.lineWidth = this.lineWidth;
  
  context.strokeStyle = '#666666';

  context.stroke(path);
};


let board = new Board('board');
board.draw();