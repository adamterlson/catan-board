let Corner = function (ownerTile, direction) {
  this.tiles = [];
  this.borders = [];
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