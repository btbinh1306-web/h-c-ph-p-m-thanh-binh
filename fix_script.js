import fs from 'fs';
let code = fs.readFileSync('src/data/pinyinData.ts', 'utf8');

const sIdx = code.indexOf(`symbol: 's',`);
const startS = code.lastIndexOf('{', sIdx);
const endArr = code.indexOf('// ==========================================', sIdx);

let goodCode = `  {
    id: 's',
    symbol: 's',
    pinyinName: 's (si)',
    group: '舌尖前音 (Âm đầu lưỡi trước)',
    vietnameseGuide: 'Đọc giống "s" xì hơi thẳng lưỡi (răng khép nhẹ).',
    mouthDescription: 'Đầu lưỡi thẳng gần chân răng dưới, hơi xì nhẹ qua kẽ răng.',
    aspirated: false,
    voiced: false,
    gridPosition: 'mid',
    exampleWord: 'sān (三 - số 3)',
    examplePinyin: 'sān',
    exampleVietnamese: 'Số 3',
    mouthDiagramType: 'dental_sibilant',
  },

  // --- Nhóm 舌尖后音 (Âm uốn lưỡi) ---
  {
    id: 'zh',
    symbol: 'zh',
    pinyinName: 'zh (zhi)',
    group: '舌尖后音 (Âm uốn lưỡi)',
    vietnameseGuide: 'UỐN LƯỠI lên ngạc cứng rồi phát âm giống "tr" nặng (không bật hơi).',
    mouthDescription: 'Đầu lưỡi uốn cong lên chạm ngạc cứng rồi hạ nhẹ hơi thoát ra.',
    aspirated: false,
    voiced: false,
    gridPosition: 'top-mid',
    exampleWord: 'zhōng (中 - trung/trung quốc)',
    examplePinyin: 'zhōng',
    exampleVietnamese: 'Trung tâm',
    mouthDiagramType: 'retroflex',
  },
  {
    id: 'ch',
    symbol: 'ch',
    pinyinName: 'ch (chi)',
    group: '舌尖后音 (Âm uốn lưỡi)',
    vietnameseGuide: 'UỐN LƯỠI giống "zh" nhưng BẬT HƠI MẠNH out khói.',
    mouthDescription: 'Đầu lưỡi uốn cong chạm ngạc cứng, tích khí nén rồi BẬT MẠNH hơi ra.',
    aspirated: true,
    voiced: false,
    gridPosition: 'top-mid',
    exampleWord: 'chī (吃 - ăn)',
    examplePinyin: 'chī',
    exampleVietnamese: 'Ăn',
    mouthDiagramType: 'retroflex',
  },
  {
    id: 'sh',
    symbol: 'sh',
    pinyinName: 'sh (shi)',
    group: '舌尖后音 (Âm uốn lưỡi)',
    vietnameseGuide: 'UỐN LƯỠI xì hơi giống "s" nặng / "sh" tiếng Anh (lưỡi cong).',
    mouthDescription: 'Đầu lưỡi uốn gần ngạc cứng, hơi xì mạnh qua khe lưỡi uốn.',
    aspirated: false,
    voiced: false,
    gridPosition: 'top-mid',
    exampleWord: 'shì (是 - là/đúng)',
    examplePinyin: 'shì',
    exampleVietnamese: 'Là, phải',
    mouthDiagramType: 'retroflex',
  },
  {
    id: 'r',
    symbol: 'r',
    pinyinName: 'r (ri)',
    group: '舌尖后音 (Âm uốn lưỡi)',
    vietnameseGuide: 'UỐN LƯỠI đọc phát âm giống "r" miền Nam hoặc "j" rung nhẹ.',
    mouthDescription: 'Đầu lưỡi uốn cong gần ngạc cứng, dây thanh rung nhẹ.',
    aspirated: false,
    voiced: true,
    gridPosition: 'mid',
    exampleWord: 'rén (人 - người)',
    examplePinyin: 'rén',
    exampleVietnamese: 'Người',
    mouthDiagramType: 'retroflex',
  }
];

// ==========================================`;

const fullTextToReplace = code.substring(startS, endArr + '// =========================================='.length);
code = code.replace(fullTextToReplace, goodCode);
fs.writeFileSync('src/data/pinyinData.ts', code);
