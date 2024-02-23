const AlphanumericSet = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "m",
  "n",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const getInviteCodeByUIDUnique = (uid, len = 4) => {
  const code = [];
  for (let i = 0; i < len; i++) {
    const idx = uid % AlphanumericSet.length;
    code.push(AlphanumericSet[idx]);
    uid = uid / AlphanumericSet.length;
  }
  return code.map(c => c === void(0) ? 1 : c).join('');
};

module.exports = {
  getInviteCodeByUIDUnique,
};
