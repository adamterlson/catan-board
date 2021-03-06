import Corner from './corner';
import Border from './border';
import * as utils from './utils';

let Tile = function (hex) {
  this.location = hex;
  this.fillStyle = null;

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

Tile.prototype.getCorners = function () {
  return Object.keys(this.corners)
    .map(direction => this.corners[direction])
    .filter(corner => corner);
};

Tile.prototype.getBorders = function () {
  return Object.keys(this.borders)
    .map(direction => this.borders[direction])
    .filter(corner => corner);
};

Tile.prototype.getCorner = function (direction) {
  return this.corners[utils.cardinalDirectionify(direction)];
};

Tile.prototype.makeCorner = function (direction) {
  return new Corner(this, direction);
};

Tile.prototype.makeBorder = function (direction) {
  let border = new Border(this, direction);
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
  if (this.fillStyle) {
    context.globalCompositeOperation='destination-over';
    let path = new Path2D();

    let locations = Object.keys(this.corners).map(direction => {
      let corner = this.corners[direction];
      return corner.getPixelLocation();
    });

    context.beginPath();
    context.moveTo(locations[0].x, locations[0].y);
    locations.forEach(location => context.lineTo(location.x, location.y));
    context.closePath();

    context.fillStyle = this.fillStyle;
    context.fill();
  }

  context.globalCompositeOperation='source-over';

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

export default Tile;