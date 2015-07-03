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