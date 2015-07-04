import Board from './board.js';
import * as utils from './utils';

function Game(board) {

}

export default Game;
/*
let board = new Board('board');
board.draw();

board.getTileByHex(utils.Hex(0, 0)).borders['NE'].tiles.forEach(tile => {
  Object.keys(tile.borders).forEach(direction => {
    var border = tile.borders[direction];
    border.strokeStyle = '#00f';
    border.draw(board.context);
  })
});

var border = board.getTileByHex(utils.Hex(-2, 1)).borders['W'];

// Tiles along border
border.tiles.forEach(tile => {
  tile.fillStyle = '#ff0';
  tile.draw(board.context);
});

// corners on border
border.corners.forEach(corner => {
  corner.strokeStyle = '#f0f';
  corner.draw(board.context);
});

// border itself
border.draw(board.context);




var corner = board.getTileByHex(utils.Hex(0, 1)).corners['S'];
corner.strokeStyle = '#00f';
corner.draw(board.context);

corner.borders.forEach(border => {
  border.strokeStyle = '#f0f';
  border.draw(board.context);
});

*/