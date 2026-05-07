export interface KanaItem {
  romaji: string;
  hiragana: string;
  katakana: string;
}

export const kanaList: KanaItem[] = [
  // Vowels
  { romaji: "a",  hiragana: "あ", katakana: "ア" },
  { romaji: "i",  hiragana: "い", katakana: "イ" },
  { romaji: "u",  hiragana: "う", katakana: "ウ" },
  { romaji: "e",  hiragana: "え", katakana: "エ" },
  { romaji: "o",  hiragana: "お", katakana: "オ" },

  // K-row
  { romaji: "ka", hiragana: "か", katakana: "カ" },
  { romaji: "ki", hiragana: "き", katakana: "キ" },
  { romaji: "ku", hiragana: "く", katakana: "ク" },
  { romaji: "ke", hiragana: "け", katakana: "ケ" },
  { romaji: "ko", hiragana: "こ", katakana: "コ" },

  // S-row
  { romaji: "sa",  hiragana: "さ", katakana: "サ" },
  { romaji: "shi", hiragana: "し", katakana: "シ" },
  { romaji: "su",  hiragana: "す", katakana: "ス" },
  { romaji: "se",  hiragana: "せ", katakana: "セ" },
  { romaji: "so",  hiragana: "そ", katakana: "ソ" },

  // T-row
  { romaji: "ta",  hiragana: "た", katakana: "タ" },
  { romaji: "chi", hiragana: "ち", katakana: "チ" },
  { romaji: "tsu", hiragana: "つ", katakana: "ツ" },
  { romaji: "te",  hiragana: "て", katakana: "テ" },
  { romaji: "to",  hiragana: "と", katakana: "ト" },

  // N-row
  { romaji: "na", hiragana: "な", katakana: "ナ" },
  { romaji: "ni", hiragana: "に", katakana: "ニ" },
  { romaji: "nu", hiragana: "ぬ", katakana: "ヌ" },
  { romaji: "ne", hiragana: "ね", katakana: "ネ" },
  { romaji: "no", hiragana: "の", katakana: "ノ" },

  // H-row
  { romaji: "ha", hiragana: "は", katakana: "ハ" },
  { romaji: "hi", hiragana: "ひ", katakana: "ヒ" },
  { romaji: "fu", hiragana: "ふ", katakana: "フ" },
  { romaji: "he", hiragana: "へ", katakana: "ヘ" },
  { romaji: "ho", hiragana: "ほ", katakana: "ホ" },

  // M-row
  { romaji: "ma", hiragana: "ま", katakana: "マ" },
  { romaji: "mi", hiragana: "み", katakana: "ミ" },
  { romaji: "mu", hiragana: "む", katakana: "ム" },
  { romaji: "me", hiragana: "め", katakana: "メ" },
  { romaji: "mo", hiragana: "も", katakana: "モ" },

  // Y-row (no yi, ye)
  { romaji: "ya", hiragana: "や", katakana: "ヤ" },
  { romaji: "yu", hiragana: "ゆ", katakana: "ユ" },
  { romaji: "yo", hiragana: "よ", katakana: "ヨ" },

  // R-row
  { romaji: "ra", hiragana: "ら", katakana: "ラ" },
  { romaji: "ri", hiragana: "り", katakana: "リ" },
  { romaji: "ru", hiragana: "る", katakana: "ル" },
  { romaji: "re", hiragana: "れ", katakana: "レ" },
  { romaji: "ro", hiragana: "ろ", katakana: "ロ" },

  // W-row (only wa, wo)
  { romaji: "wa", hiragana: "わ", katakana: "ワ" },
  { romaji: "wo", hiragana: "を", katakana: "ヲ" },

  // N
  { romaji: "n", hiragana: "ん", katakana: "ン" },
];