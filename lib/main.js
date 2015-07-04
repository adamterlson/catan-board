import Game from './game';
import Board from './board';
import drawing from './drawing';

var board = new Board();
var game = new Game(board);

drawing.draw(board);