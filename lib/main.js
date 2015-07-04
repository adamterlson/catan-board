import Game from './game';
import Board from './board';
import drawing from './drawing';

let board = new Board();
let game = new Game(board);

drawing.draw(board);