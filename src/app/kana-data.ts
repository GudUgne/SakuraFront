// kana-data.ts
export const HIRAGANA_TABLE = [
  { row: '', kana: ['あ', 'い', 'う', 'え', 'お'], romaji: ['a', 'i', 'u', 'e', 'o'] },
  { row: 'K', kana: ['か', 'き', 'く', 'け', 'こ'], romaji: ['ka', 'ki', 'ku', 'ke', 'ko'] },
  { row: 'S', kana: ['さ', 'し', 'す', 'せ', 'そ'], romaji: ['sa', 'shi', 'su', 'se', 'so'] },
  { row: 'T', kana: ['た', 'ち', 'つ', 'て', 'と'], romaji: ['ta', 'chi', 'tsu', 'te', 'to'] },
  { row: 'N', kana: ['な', 'に', 'ぬ', 'ね', 'の'], romaji: ['na', 'ni', 'nu', 'ne', 'no'] },
  { row: 'H', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'], romaji: ['ha', 'hi', 'fu', 'he', 'ho'] },
  { row: 'M', kana: ['ま', 'み', 'む', 'め', 'も'], romaji: ['ma', 'mi', 'mu', 'me', 'mo'] },
  { row: 'Y', kana: ['や', '', 'ゆ', '', 'よ'], romaji: ['ya', '', 'yu', '', 'yo'] },
  { row: 'R', kana: ['ら', 'り', 'る', 'れ', 'ろ'], romaji: ['ra', 'ri', 'ru', 're', 'ro'] },
  { row: 'W', kana: ['わ', '', '', '', 'を'], romaji: ['wa', '', '', '', 'wo'] },
  { row: 'N', kana: ['ん', '', '', '', ''], romaji: ['n', '', '', '', ''] }
];

export const HIRAGANA_COMPOUND_GROUPED = [
  { romajiGroup: 'K', kana: ['きゃ', 'きゅ', 'きょ'], romaji: ['kya', 'kyu', 'kyo'] },
  { romajiGroup: 'S', kana: ['しゃ', 'しゅ', 'しょ'], romaji: ['sha', 'shu', 'sho'] },
  { romajiGroup: 'T', kana: ['ちゃ', 'ちゅ', 'ちょ'], romaji: ['cha', 'chu', 'cho'] },
  { romajiGroup: 'N', kana: ['にゃ', 'にゅ', 'にょ'], romaji: ['nya', 'nyu', 'nyo'] },
  { romajiGroup: 'H', kana: ['ひゃ', 'ひゅ', 'ひょ'], romaji: ['hya', 'hyu', 'hyo'] },
  { romajiGroup: 'M', kana: ['みゃ', 'みゅ', 'みょ'], romaji: ['mya', 'myu', 'myo'] },
  { romajiGroup: 'R', kana: ['りゃ', 'りゅ', 'りょ'], romaji: ['rya', 'ryu', 'ryo'] },
  { romajiGroup: 'G', kana: ['ぎゃ', 'ぎゅ', 'ぎょ'], romaji: ['gya', 'gyu', 'gyo'] },
  { romajiGroup: 'J', kana: ['じゃ', 'じゅ', 'じょ'], romaji: ['ja', 'ju', 'jo'] },
  { romajiGroup: 'B', kana: ['びゃ', 'びゅ', 'びょ'], romaji: ['bya', 'byu', 'byo'] },
  { romajiGroup: 'P', kana: ['ぴゃ', 'ぴゅ', 'ぴょ'], romaji: ['pya', 'pyu', 'pyo'] }
];

export const KATAKANA_TABLE = [
  { row: '', kana: ['ア', 'イ', 'ウ', 'エ', 'オ'], romaji: ['a', 'i', 'u', 'e', 'o'] },
  { row: 'K', kana: ['カ', 'キ', 'ク', 'ケ', 'コ'], romaji: ['ka', 'ki', 'ku', 'ke', 'ko'] },
  { row: 'S', kana: ['サ', 'シ', 'ス', 'セ', 'ソ'], romaji: ['sa', 'shi', 'su', 'se', 'so'] },
  { row: 'T', kana: ['タ', 'チ', 'ツ', 'テ', 'ト'], romaji: ['ta', 'chi', 'tsu', 'te', 'to'] },
  { row: 'N', kana: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'], romaji: ['na', 'ni', 'nu', 'ne', 'no'] },
  { row: 'H', kana: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'], romaji: ['ha', 'hi', 'fu', 'he', 'ho'] },
  { row: 'M', kana: ['マ', 'ミ', 'ム', 'メ', 'モ'], romaji: ['ma', 'mi', 'mu', 'me', 'mo'] },
  { row: 'Y', kana: ['ヤ', '', 'ユ', '', 'ヨ'], romaji: ['ya', '', 'yu', '', 'yo'] },
  { row: 'R', kana: ['ラ', 'リ', 'ル', 'レ', 'ロ'], romaji: ['ra', 'ri', 'ru', 're', 'ro'] },
  { row: 'W', kana: ['ワ', '', '', '', 'ヲ'], romaji: ['wa', '', '', '', 'wo'] },
  { row: 'N', kana: ['ン', '', '', '', ''], romaji: ['n', '', '', '', ''] }
];

export const KATAKANA_COMPOUND_GROUPED = [
  { romajiGroup: 'K', kana: ['キャ', 'キュ', 'キョ'], romaji: ['kya', 'kyu', 'kyo'] },
  { romajiGroup: 'S', kana: ['シャ', 'シュ', 'ショ'], romaji: ['sha', 'shu', 'sho'] },
  { romajiGroup: 'T', kana: ['チャ', 'チュ', 'チョ'], romaji: ['cha', 'chu', 'cho'] },
  { romajiGroup: 'N', kana: ['ニャ', 'ニュ', 'ニョ'], romaji: ['nya', 'nyu', 'nyo'] },
  { romajiGroup: 'H', kana: ['ヒャ', 'ヒュ', 'ヒョ'], romaji: ['hya', 'hyu', 'hyo'] },
  { romajiGroup: 'M', kana: ['ミャ', 'ミュ', 'ミョ'], romaji: ['mya', 'myu', 'myo'] },
  { romajiGroup: 'R', kana: ['リャ', 'リュ', 'リョ'], romaji: ['rya', 'ryu', 'ryo'] },
  { romajiGroup: 'G', kana: ['ギャ', 'ギュ', 'ギョ'], romaji: ['gya', 'gyu', 'gyo'] },
  { romajiGroup: 'J', kana: ['ジャ', 'ジュ', 'ジョ'], romaji: ['ja', 'ju', 'jo'] },
  { romajiGroup: 'B', kana: ['ビャ', 'ビュ', 'ビョ'], romaji: ['bya', 'byu', 'byo'] },
  { romajiGroup: 'P', kana: ['ピャ', 'ピュ', 'ピョ'], romaji: ['pya', 'pyu', 'pyo'] }
];
