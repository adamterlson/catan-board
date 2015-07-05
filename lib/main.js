import Game from './game';
import Board from './board';
import ui from './ui';

let board = new Board();
let game = new Game(board);

ui.draw(board);