let board = new Board('board');
board.draw();

board.getTileByHex(Hex(0, 0)).borders['NE'].tiles.forEach(tile => {
  Object.keys(tile.borders).forEach(direction => {
    var border = tile.borders[direction];
    border.strokeStyle = '#00f';
    border.draw(board.context);
  })
});

var border = board.getTileByHex(Hex(-2, 1)).borders['W'];

// Tiles along border
border.tiles.forEach(tile => {
  Object.keys(tile.borders).forEach(direction => {
    var border = tile.borders[direction];
    border.strokeStyle = '#000';
    border.draw(board.context);
  });
});

// corners on border
border.corners.forEach(corner => {
  corner.strokeStyle = '#f00';
  corner.draw(board.context);
});

// border itself
border.strokeStyle = '#0f0';
border.draw(board.context);




var corner = board.getTileByHex(Hex(0, 1)).corners['S'];
corner.strokeStyle = '#f00';
corner.draw(board.context);

corner.tiles.forEach(tile => {
  tile.fillStyle = '#ff0';
  tile.draw(board.context);
});