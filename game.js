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

  this.hexGrid = this.makeHexGrid(this.radius);

  let tileSize = 30;
  let boardXOffset = 300;
  let boardYOffset = 300;

  console.log(this.hexGrid);

  for (let i = 0; i < this.hexGrid.length; i++) {
    var row = this.hexGrid[i];
    for (let j = 0; j < row.length; j++) {
      let hex = row[j];
      if (hex) {
        let tile = new Tile(tileSize);
        let point = hex_to_pixel(hex, tileSize);

        console.log(tile);

        point.x += boardXOffset;
        point.y += boardYOffset;

        tile.move(point);
        this.tiles.push(tile);
      }
      /*let tile = new Tile(tileSize);
      let x = tile.width() * i + boardXOffset;
      let y = tile.height() * 3/4 * j + boardYOffset;

      if (j % 2 === 0) {
        x += tile.width() / 2;
      }

      tile.move({ x: x, y: y });

      this.tiles.push(tile);*/
    }
  }
};

Board.prototype.makeHexGrid = function (radius) {
  let cols = [];

  for (let q = -radius; q <= radius; q++) {
    let row = [];
    for (let r = -radius; r <= radius; r++) {
      let hex = new Hex(q, r);
      let cube = hexToCube(hex);
      if (cube_distance(cube, {x: 0, y: 0, z: 0}) <= this.radius) {
        row.push(hex);
      } else {
        row.push(null);
      }
    }
    cols.push(row);
  }

  return cols
}

Board.prototype.draw = function () {
  this.tiles.forEach(function (tile) { 
    tile.draw(this.context); 
  }.bind(this));
};

Board.prototype.firstColumn = function (row) {
  return -this.radius - Math.min(0, row)
},

Board.prototype.getCoord = function (q, r) {

};

let Tile = function (size) {
  this.size = size;
  this.lineWidth = 10;
  this.corners = [];

  this.move({ x: 0, y: 0 });
};

Tile.prototype.width = function () {
  return Math.sqrt(3)/2 * this.height();
};

Tile.prototype.height = function () {
  return this.size * 2;
};

Tile.prototype.move = function (point) {
  this.origin = point;

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

  /*
  let origin = this.drawingOrigin();
  let size = this.drawingSize();

  let path = new Path2D();

  path.moveTo(origin.x, origin.y);
  path.lineTo(origin.x + size, origin.y);
  path.lineTo(origin.x + size, origin.y + size);
  path.lineTo(origin.x, origin.y + size);
  path.closePath();

  context.lineWidth = this.lineWidth;
  
  context.strokeStyle = '#666666';

  context.stroke(path);*/
};


let board = new Board('board');
board.draw();