const DIRECTION_MAPS = {
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

const CORNER_INDEX_MAP = {
  N: 4,
  NE: 5,
  SE: 6,
  S: 1,
  SW: 2,
  NW: 3
};

const EDGE_SIZE = 30;