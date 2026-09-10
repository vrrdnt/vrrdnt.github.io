// Conway B3/S23 oscillator seeds. Names and discoverers retained from the RLE catalog.
// Source: https://github.com/macmade/GameOfLife/tree/master/GameOfLife/Library/Oscillators
// Every declared period is verified against life-core.js in tests.
export const OSCILLATORS = [
  {
    "name": "Pulsar",
    "period": 3,
    "rows": [
      "..OOO...OOO..",
      ".............",
      "O....O.O....O",
      "O....O.O....O",
      "O....O.O....O",
      "..OOO...OOO..",
      ".............",
      "..OOO...OOO..",
      "O....O.O....O",
      "O....O.O....O",
      "O....O.O....O",
      ".............",
      "..OOO...OOO.."
    ],
    "author": "John Conway"
  },
  {
    "name": "Kok's galaxy",
    "period": 8,
    "rows": [
      "..O..O.O.",
      "OO.O.OOO.",
      ".O......O",
      "OO.....O.",
      ".........",
      ".O.....OO",
      "O......O.",
      ".OOO.O.OO",
      ".O.O..O.."
    ],
    "author": "Jan Kok"
  },
  {
    "name": "Pentadecathlon",
    "period": 15,
    "rows": [
      "..O....O..",
      "OO.OOOO.OO",
      "..O....O.."
    ],
    "author": "John Conway"
  },
  {
    "name": "Figure eight",
    "period": 8,
    "rows": [
      "OO....",
      "OO.O..",
      "....O.",
      ".O....",
      "..O.OO",
      "....OO"
    ],
    "author": "Simon Norton"
  },
  {
    "name": "Mold",
    "period": 4,
    "rows": [
      "...OO.",
      "..O..O",
      "O..O.O",
      "....O.",
      "O.OO..",
      ".O...."
    ],
    "author": "Achim Flammenkamp"
  },
  {
    "name": "Clock",
    "period": 2,
    "rows": [
      "..O.",
      "O.O.",
      ".O.O",
      ".O.."
    ],
    "author": "Simon Norton"
  },
  {
    "name": "Beacon",
    "period": 2,
    "rows": [
      "OO..",
      "O...",
      "...O",
      "..OO"
    ],
    "author": "John Conway"
  },
  {
    "name": "Toad",
    "period": 2,
    "rows": [
      ".OOO",
      "OOO."
    ],
    "author": "Simon Norton"
  },
  {
    "name": "Blinker",
    "period": 2,
    "rows": [
      "OOO"
    ],
    "author": "John Conway"
  },
  {
    "name": "Bipole",
    "period": 2,
    "rows": [
      "OO...",
      "O.O..",
      ".....",
      "..O.O",
      "...OO"
    ]
  },
  {
    "name": "Tripole",
    "period": 2,
    "rows": [
      "OO....",
      "O.O...",
      "......",
      "..O.O.",
      ".....O",
      "....OO"
    ]
  },
  {
    "name": "Quadpole",
    "period": 2,
    "rows": [
      "OO.....",
      "O.O....",
      ".......",
      "..O.O..",
      ".......",
      "....O.O",
      ".....OO"
    ]
  },
  {
    "name": "Pentapole",
    "period": 2,
    "rows": [
      "OO......",
      "O.O.....",
      "........",
      "..O.O...",
      "........",
      "....O.O.",
      ".......O",
      "......OO"
    ]
  },
  {
    "name": "Fore and back",
    "period": 2,
    "rows": [
      "OO.OO..",
      "OO.O.O.",
      "......O",
      "OOO.OOO",
      "O......",
      ".O.O.OO",
      "..OO.OO"
    ],
    "author": "Achim Flammenkamp"
  },
  {
    "name": "By flops",
    "period": 2,
    "rows": [
      "...O..",
      ".O.O..",
      ".....O",
      "OOOOO.",
      ".....O",
      ".O.O..",
      "...O.."
    ],
    "author": "Robert Wainwright"
  },
  {
    "name": "Unix",
    "period": 6,
    "rows": [
      ".OO.....",
      ".OO.....",
      "........",
      ".O......",
      "O.O.....",
      "O..O..OO",
      "....O.OO",
      "..OO...."
    ],
    "author": "David Buckingham"
  },
  {
    "name": "Octagon 2",
    "period": 5,
    "rows": [
      "...OO...",
      "..O..O..",
      ".O....O.",
      "O......O",
      "O......O",
      ".O....O.",
      "..O..O..",
      "...OO..."
    ],
    "author": "Sol Goodman and Arthur Taber"
  },
  {
    "name": "Mazing",
    "period": 4,
    "rows": [
      "...OO..",
      ".O.O...",
      "O.....O",
      ".O...OO",
      ".......",
      "...O.O.",
      "....O.."
    ],
    "author": "David Buckingham"
  },
  {
    "name": "Smiley",
    "period": 8,
    "rows": [
      "OOO.OOO",
      ".O.O.O.",
      ".......",
      ".O...O.",
      ".......",
      "O.O.O.O",
      "..O.O.."
    ],
    "author": "Achim Flammenkamp"
  },
  {
    "name": "Caterer",
    "period": 3,
    "rows": [
      "..O.....",
      "O...OOOO",
      "O...O...",
      "O.......",
      "...O....",
      ".OO....."
    ],
    "author": "Dean Hickerson"
  },
  {
    "name": "Jam",
    "period": 3,
    "rows": [
      "...OO.",
      "..O..O",
      "O..O.O",
      "O...O.",
      "O.....",
      "...O..",
      ".OO..."
    ],
    "author": "Achim Flammenkamp"
  },
  {
    "name": "Monogram",
    "period": 4,
    "rows": [
      "OO...OO",
      ".O.O.O.",
      ".OO.OO.",
      ".O.O.O.",
      "OO...OO"
    ],
    "author": "Dean Hickerson"
  },
  {
    "name": "Phoenix 1",
    "period": 2,
    "rows": [
      "...O....",
      "...O.O..",
      ".O......",
      "......OO",
      "OO......",
      "......O.",
      "..O.O...",
      "....O..."
    ]
  },
  {
    "name": "Star",
    "period": 3,
    "rows": [
      "....OOO....",
      "...........",
      "..O.O.O.O..",
      "...........",
      "O.O.....O.O",
      "O.........O",
      "O.O.....O.O",
      "...........",
      "..O.O.O.O..",
      "...........",
      "....OOO...."
    ],
    "author": "Hartmut Holzwart"
  },
  {
    "name": "Windmill",
    "period": 4,
    "rows": [
      "...........O......",
      ".........OO.O.....",
      ".......OO.........",
      "..........OO......",
      ".......OOO........",
      "..................",
      "OOO...............",
      "...OO..OOO.OO.....",
      "..........OOOOOOO.",
      ".OOOOOOO..........",
      ".....OO.OOO..OO...",
      "...............OOO",
      "..................",
      "........OOO.......",
      "......OO..........",
      ".........OO.......",
      ".....O.OO.........",
      "......O..........."
    ],
    "author": "Dean Hickerson"
  },
  {
    "name": "Pinwheel",
    "period": 4,
    "rows": [
      "......OO....",
      "......OO....",
      "............",
      "....OOOO....",
      "OO.O....O...",
      "OO.O..O.O...",
      "...O...OO.OO",
      "...O.O..O.OO",
      "....OOOO....",
      "............",
      "....OO......",
      "....OO......"
    ],
    "author": "Simon Norton"
  },
  {
    "name": "Spark coil",
    "period": 2,
    "rows": [
      "OO....OO",
      "O.O..O.O",
      "..O..O..",
      "O.O..O.O",
      "OO....OO"
    ]
  },
  {
    "name": "Fumarole",
    "period": 5,
    "rows": [
      "...OO...",
      ".O....O.",
      ".O....O.",
      ".O....O.",
      "..O..O..",
      "O.O..O.O",
      "OO....OO"
    ],
    "author": "Dean Hickerson"
  },
  {
    "name": "Cross",
    "period": 3,
    "rows": [
      "..OOOO..",
      "..O..O..",
      "OOO..OOO",
      "O......O",
      "O......O",
      "OOO..OOO",
      "..O..O..",
      "..OOOO.."
    ],
    "author": "Robert Wainwright"
  },
  {
    "name": "Tumbler",
    "period": 14,
    "rows": [
      ".O.....O.",
      "O.O...O.O",
      "O..O.O..O",
      "..O...O..",
      "..OO.OO.."
    ],
    "author": "George Collins"
  },
  {
    "name": "Piston",
    "period": 2,
    "rows": [
      "OO.......OO",
      "O.O..O..O.O",
      "..OOOO..O..",
      "O.O..O..O.O",
      "OO.......OO"
    ]
  },
  {
    "name": "Ring of fire",
    "period": 2,
    "rows": [
      "................O.................",
      "..............O.O.O...............",
      "............O.O.O.O.O.............",
      "..........O.O.O.O.O.O.O...........",
      "........O.O.O..OO.O.O.O.O.........",
      "......O.O.O.O......O..O.O.O.......",
      "....O.O.O..O..........O.O.O.O.....",
      ".....OO.O..............O..O.O.O...",
      "...O...O..................O.OO....",
      "....OOO....................O...O..",
      "..O.........................OOO...",
      "...OO...........................O.",
      ".O...O........................OO..",
      "..OOOO.......................O...O",
      "O.............................OOO.",
      ".OOO.............................O",
      "O...O.......................OOOO..",
      "..OO........................O...O.",
      ".O...........................OO...",
      "...OOO.........................O..",
      "..O...O....................OOO....",
      "....OO.O..................O...O...",
      "...O.O.O..O..............O.OO.....",
      ".....O.O.O.O..........O..O.O.O....",
      ".......O.O.O..O......O.O.O.O......",
      ".........O.O.O.O.OO..O.O.O........",
      "...........O.O.O.O.O.O.O..........",
      ".............O.O.O.O.O............",
      "...............O.O.O..............",
      ".................O................"
    ],
    "author": "Dean Hickerson"
  }
];
