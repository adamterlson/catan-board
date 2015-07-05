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
  for (let i = 0; i < numberOfTiles; i++) {
    resourceTiles.push(resourceType);
  }
});

let numberChips = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

function Game(board) {
  this.board = board;
  this._assignResourcesAndNumbers();

  board.getTileByHex(utils.Hex(0, 0)).borders['NE'].player = 'red';
  board.getTileByHex(utils.Hex(-1, 0)).corners['NW'].player = 'blue';
  board.getTileByHex(utils.Hex(-1, 0)).corners['NW'].level = 1;
  board.getTileByHex(utils.Hex(-1, 0)).corners['NE'].player = 'yellow';
  board.getTileByHex(utils.Hex(-1, 0)).corners['NW'].level = 2;
  board.getTileByHex(utils.Hex(0, 0)).robber = true;

  board.getTileByHex(utils.Hex(1, 0)).getCorner(0).player = 'blue';
}

Game.prototype._assignResourcesAndNumbers = function () {
  let shuffledTiles = utils.shuffle(this.board.tiles);
  let shuffledNumberChips = utils.shuffle(numberChips);
  let shuffledResourceTiles = utils.shuffle(resourceTiles);

  while (shuffledTiles.length) {
    let tile = shuffledTiles.pop();
    tile.resource = shuffledResourceTiles.pop();
    if (tile.resource !== 'desert')
      tile.numberChip = shuffledNumberChips.pop();
  }
};

export default Game;
