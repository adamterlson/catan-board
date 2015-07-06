import Tile from './tile';
import Port from './port';
import * as utils from './utils';

let resourceAssignments = [];

Object.keys(utils.RESOURCES.TYPES).map(resourceType => {
  let numberOfTiles = utils.RESOURCES.TYPES[resourceType];
  for (let i = 0; i < numberOfTiles; i++) {
    resourceAssignments.push(resourceType);
  }
});
resourceAssignments.push('desert');

let numberChips = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

let Board = function () {
  this.radius = 3;
  this.tiles = [];
  this.resourceTiles = [];
  this.oceanTiles = [];

  this.hexGrid = this._makeHexGrid(this.radius);

  this._assignCornersToTiles();
  this._pruneCorners();

  this._assignBordersToTiles();
  this._pruneBorders();

  this.corners = this._getAllCorners();
  this.borders = this._getAllBorders();

  this._assignResourcesAndNumbers();
  this._assignPorts();
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

Board.prototype.getTileNeighbors = function (tile) {
  return Object.keys(utils.DIRECTION_MAPS.NEIGHBORS)
    .map(direction => this.getTileNeighbor(tile, direction))
    .filter(tile => tile);
};

Board.prototype.joins = function (border) {
  return border.tiles;
};

Board.prototype._pruneBorders = function () {
  this.oceanTiles.forEach(function (tile) {
    Object.keys(tile.borders).forEach(direction => {
      let border = tile.borders[direction];
      if (border && (border.corners[0] === null || border.corners[1] === null)) {
        delete tile.borders[direction];
      }
    });
  });
};

Board.prototype._pruneCorners = function () {
  this.oceanTiles.forEach(function (tile) {
    Object.keys(tile.corners).forEach(function (direction) {
      let corner = tile.corners[direction];      
      if (!corner) return;

      if (corner.tiles.length === 1 || 
          corner.tiles.filter(tile => tile.type === 'ocean').length === corner.tiles.length) {
        tile.corners[direction] = null;
      }
    });
  });
};

Board.prototype._assignPorts = function () {
  let ports = this._makeRandomPorts();
  let orderedOceans = [];

  function neighborOcean(board, tile) {
    orderedOceans.push(tile);

    board.getTileNeighbors(tile).forEach(neighbor => {
      if (neighbor.type === 'ocean' && orderedOceans.indexOf(neighbor) === -1) {
        neighborOcean(board, neighbor);
      }
    })
  }

  neighborOcean(this, this.oceanTiles[0]);


  let i = Math.round(Math.random());
  while (i < orderedOceans.length) {
    let tile = orderedOceans[i];
    let borders = tile.getBorders();
    let randomBorderIndex = Math.floor(Math.random() * borders.length);
    let border = borders[randomBorderIndex];
    let port = ports.pop();

    port.ownerTile = tile;

    border.port = port;

    i+=2;
  }
};

Board.prototype._makeRandomPorts = function () {
  let numPorts = this.oceanTiles.length / 2;
  let numSpecificPorts = utils.RESOURCES.NUM_TYPES;
  let numGenericPorts = numPorts - numSpecificPorts;
  let ports = [];
  let randomizedResourceTypes = utils.shuffle(Object.keys(utils.RESOURCES.TYPES));

  for (let i = 0; i < numSpecificPorts; i++) {
    ports.push(new Port(randomizedResourceTypes[i]));
  }

  for (let j = 0; j < numGenericPorts; j++) {
    ports.push(new Port());
  }

  return utils.shuffle(ports);
};

Board.prototype._assignResourcesAndNumbers = function () {
  let shuffledTiles = utils.shuffle(this.resourceTiles);
  let shuffledNumberChips = utils.shuffle(numberChips);
  let shuffledResourceTiles = utils.shuffle(resourceAssignments);

  while (shuffledTiles.length) {
    let tile = shuffledTiles.pop();
    let resource = shuffledResourceTiles.pop();
    if (resource !== 'desert') {
      tile.resource = resource;
      tile.numberChip = shuffledNumberChips.pop();
    }
    else {
      tile.type = 'desert';
      tile.resource = null;
    }
  }
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
      var corner = this._getNeighborsCorner(tile, direction);
      if (!corner) return;

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
    if (!corner) return;
    corner.borders.push(tile.borders[direction]);
  });
};

Board.prototype._assignBordersToTiles = function () {
  this.tiles.forEach(tile => {
    Object.keys(tile.borders).forEach(direction => {
      var border = this._getNeighborsBorder(tile, direction);
      if (!border) return;

      border.tiles.push(tile);
      tile.borders[direction] = border;
      this._assignCornersToBorder(tile, direction);
    });
  });
};

Board.prototype._makeHexGrid = function (radius) {
  let cols = [];

  for (let q = -radius; q <= radius; q++) {
    let row = [];
    for (let r = -radius; r <= radius; r++) {
      let hex = new utils.Hex(q, r);
      let cube = utils.hexToCube(hex);
      let distance = utils.cubeDistance(cube, {x: 0, y: 0, z: 0});
      if (distance <= this.radius) {
        let tile = new Tile(hex);

        if (distance === this.radius) {
          tile.type = 'ocean';
          this.oceanTiles.push(tile);
        } else {
          tile.type = 'resource';
          this.resourceTiles.push(tile);
        }

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
      if (corner && corner.ownerTile === tile) {
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
      if (corner && corner.ownerTile === tile) {
        all.push(corner);
      }
    });
  });
  return all;
};

export default Board;