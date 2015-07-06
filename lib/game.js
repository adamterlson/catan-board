import * as utils from './utils';


function Game(board) {
  this.board = board;

  board.getTileByHex(utils.Hex(0, 0)).borders['NE'].player = 'red';
  board.getTileByHex(utils.Hex(-1, 0)).corners['NW'].player = 'blue';
  board.getTileByHex(utils.Hex(-1, 0)).corners['NW'].level = 1;
  board.getTileByHex(utils.Hex(-1, 0)).corners['NE'].player = 'yellow';
  board.getTileByHex(utils.Hex(-1, 0)).corners['NW'].level = 2;
  board.getTileByHex(utils.Hex(0, 0)).robber = true;

  board.getTileByHex(utils.Hex(2, 0)).getCorner('NE').player = 'blue';
}

export default Game;
