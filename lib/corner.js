import * as utils from './utils';

let Corner = function (ownerTile, direction) {
  this.tiles = [];
  this.borders = [];
  this.ownerTile = ownerTile;
  this.direction = direction;
  this.radius = 5;
};

export default Corner;