import Tile from './tile';
import * as utils from './utils';

let Board = function () {
  this.radius = 2;
  this.tiles = [];

  this.hexGrid = this._makeHexGrid(this.radius);

  this._assignCornersToTiles();
  this._assignBordersToTiles();

  this.corners = this._getAllCorners();
  this.borders = this._getAllBorders();
};

Board.prototype.getTileByHex = function (hex) {
  var res = this.tiles.filter(function (tile) {
    return tile.location.q === hex.q && tile.location.r === hex.r;
  });

  return res.length ? res[0] : null;
};

Board.prototype.getTileNeighbor = function (tile, direction) {
  return this.getTileByHex(utils.hexAdd(tile.location, utils.DIRECTION_MAPS.NEIGHBORS[direction]));
};

Board.prototype.joins = function (border) {
  return border.tiles;
};

Board.prototype.draw = function () {
  this.tiles.forEach(tile => tile.draw(this.context));
};

Board.prototype._getNeighborsCorner = function (tile, direction) {
  var coordTranslates = utils.DIRECTION_MAPS.CORNERS[direction];
  var corner;
  coordTranslates.forEach(coordTranslate => {
    if (corner) { return; }
    var neighborCoord = utils.hexAdd(coordTranslate, tile.location);
    var neighborTile = this.getTileByHex(neighborCoord);

    if (neighborTile) {
      corner = neighborTile.corners[coordTranslate.corner];
    }
  });

  return corner;
};

Board.prototype._getNeighborsBorder = function (tile, direction) {
  var coordTranslate = utils.DIRECTION_MAPS.BORDERS[direction];
  var neighborCoord = utils.hexAdd(coordTranslate, tile.location);
  var neighborTile = this.getTileByHex(neighborCoord);
  var border;

  if (neighborTile) {
    border = neighborTile.borders[coordTranslate.border];
  }

  return border;
};

Board.prototype._assignCornersToTiles = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.corners).forEach(direction => {
      var corner = this._getNeighborsCorner(tile, direction) || 
                   tile.makeCorner(direction);

      corner.tiles.push(tile);

      tile.corners[direction] = corner;
    });
  });
};

Board.prototype._assignCornersToBorder = function (tile, direction) {
  tile.borders[direction].corners = utils.DIRECTION_MAPS.BORDERS[direction].corners.map(cornerDirection => {
    return tile.corners[cornerDirection];
  });

  tile.borders[direction].corners.forEach(corner => {
    corner.borders.push(tile.borders[direction]);
  });
};

Board.prototype._assignBordersToTiles = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.borders).forEach(direction => {
      var border = this._getNeighborsBorder(tile, direction) ||
                   tile.makeBorder(direction);

      border.tiles.push(tile);
      tile.borders[direction] = border;
      this._assignCornersToBorder(tile, direction);
    });
  });
};

Board.prototype._makeHexGrid = function (radius, tileSize) {
  let cols = [];

  for (let q = -radius; q <= radius; q++) {
    let row = [];
    for (let r = -radius; r <= radius; r++) {
      let hex = new utils.Hex(q, r);
      let cube = utils.hexToCube(hex);
      if (utils.cubeDistance(cube, {x: 0, y: 0, z: 0}) <= this.radius) {
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

Board.prototype._getAllCorners = function () {
  var all = [];
  this.tiles.forEach(tile => {
    Object.keys(tile.corners).forEach(direction => {
      var corner = tile.corners[direction];
      if (corner.ownerTile === tile) {
        all.push(corner);
      }
    });
  });
  return all;
};

Board.prototype._getAllBorders = function () {
  var all = [];
  this.tiles.forEach(tile => {
    Object.keys(tile.borders).forEach(direction => {
      var corner = tile.borders[direction];
      if (corner.ownerTile === tile) {
        all.push(corner);
      }
    });
  });
  return all;
};

export default Board;