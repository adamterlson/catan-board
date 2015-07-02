'use strict';

let Point = function (x, y) {
  return { x: x, y: y };
};

let Board = function (canvasId) {
  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext('2d');
  this.size = 4;
  this.tiles = [];

  let tileSize = 100;
  let boardXOffset = 150;
  let boardYOffset = 150;

  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      let tile = new Tile(tileSize);
      let x = tile.width() * i + boardXOffset;
      let y = tile.height() * 3/4 * j + boardYOffset;

      if (j % 2 === 0) {
        x += tile.width() / 2;
      }

      tile.move({ x: x, y: y });

      this.tiles.push(tile);
    }
  }
};

Board.prototype.draw = function () {
  this.tiles.forEach(function (tile) { 
    tile.draw(this.context); 
  }.bind(this));
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
  var p = Point(this.origin.x + this.size * Math.cos(angle_rad),
               this.origin.y + this.size * Math.sin(angle_rad));
  console.log(p);
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