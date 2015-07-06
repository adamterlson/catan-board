/**
 * Constants
 */

export const DIRECTION_MAPS = {
  CORNERS: {
    N: [{ q: 0, r: 0, corner: 'N' }],
    NE: [{ q: +1, r: -1, corner: 'S' }, { q: +1, r: 0, corner: 'NW' }],
    SE: [{ q: 0, r: +1, corner: 'N' }, { q: +1, r: 0, corner: 'SW' }],
    S: [{ q: 0, r: 0, corner: 'S' }],
    SW: [{ q: -1, r: +1, corner: 'N' }, { q: -1, r: 0, corner: 'SE' }],
    NW: [{ q: 0, r: -1, corner: 'S' }, { q: -1, r: 0, corner: 'NE' }]
  },
  BORDERS: {
    NW: { q: 0, r: 0, border: 'NW', corners: ['NW', 'N'] },
    NE: { q: +1, r: -1, border: 'SW', corners: ['N', 'NE']},
    E: { q: +1, r: 0, border: 'W', corners: ['NE', 'SE'] },
    SE: { q: 0, r: +1, border: 'NW', corners: ['SE', 'S']},
    SW: { q: 0, r: 0, border: 'SW', corners: ['S', 'SW'] },
    W: { q: 0, r: 0, border: 'W', corners: ['SW', 'NW'] }
  },
  NEIGHBORS: {
    NW: { q: 0, r: -1 },
    NE: { q: +1, r: -1 },
    E: { q: +1, r: 0 },
    SE: { q: 0, r: +1 },
    SW: { q: -1, r: +1 },
    W: { q: -1, r: 0 }
  }
};

export const CORNER_INDEX_MAP = {
  N: 0,
  NE: 1,
  SE: 2,
  S: 3,
  SW: 4,
  NW: 5
};

export const EDGE_INDEX_MAP = {
  NE: 0,
  E: 1,
  SE: 2,
  SW: 3,
  W: 4,
  NW: 5
};

export const RESOURCES = {
  TYPES: {
    stone: 3,
    brick: 3,
    lumber: 4,
    wheat: 4,
    sheep: 4
  },
  NUM_TYPES: 6
}

/**
 * Conversions
 */

export function cubeDistance(a, b) {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

export function cubeAdd(a, b) {
  return Cube(a.x + b.x, a.y + b.y, a.z + b.z);
}

export function hexAdd(a, b) {
  return Hex(a.q + b.q, a.r + b.r);
}

/**
 * Coord Types
 */

export function Point(x, y) {
  return { x: x, y: y };
};

export function Hex(q, r) {
  return { q: q, r: r };
};

export function Cube(x, y, z) {
  return {
    x: x,
    y: y,
    z: z
  };
};

/**
 * Type Conversions
 */

export function cubeToHex(h) {
  return Hex(h.x, h.z);
}

export function hexToCube(h) {
  let x = h.q;
  let z = h.r;
  let y = -x-z;

  return Cube(x, y, z);
}

export function hexToPixel(h, size) {
  if (!h || !size) {
    throw new Error('Need hex and size');
  }

  let x = size * Math.sqrt(3) * (h.q + h.r/2)
  let y = size * 3/2 * h.r
  return Point(x, y);
}

/**
 * Functions
 */

export function shuffle(array) {
  var array = array.slice(0);
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function cardinalDirectionify(direction) {
  if (typeof direction === 'string') {
    return direction;
  } else {
    let res;
    for (let key of Object.keys(CORNER_INDEX_MAP)) {
      if (CORNER_INDEX_MAP[key] === direction) {
        return key;
      }
    }
  }
};