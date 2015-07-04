import * as utils from './utils';

let resourceQuantities = {
  stone: 3,
  brick: 3,
  lumber: 4,
  wheat: 4,
  sheep: 4,
  desert: 1,
};

let resourceTiles = [];

Object.keys(resourceQuantities).map(resourceType => {
  let numberOfTiles = resourceQuantities[resourceType];
  for (var i = 0; i < numberOfTiles; i++) {
    resourceTiles.push(resourceType);
  }
});

var numberChips = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

function Game(board) {
  this.board = board;
  this._assignResourcesAndNumbers();
}

Game.prototype._assignResourcesAndNumbers = function () {
  var shuffledTiles = utils.shuffle(this.board.tiles);
  var shuffledNumberChips = utils.shuffle(numberChips);
  var shuffledResourceTiles = utils.shuffle(resourceTiles);

  while (shuffledTiles.length) {
    let tile = shuffledTiles.pop();
    tile.resource = shuffledResourceTiles.pop();
    if (tile.resource !== 'desert')
      tile.numberChip = shuffledNumberChips.pop();
  }
};

export default Game;
