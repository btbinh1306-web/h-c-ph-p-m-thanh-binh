export type InitialGroup =
  | '唇音 (Âm môi)'
  | '舌尖音 (Âm đầu lưỡi)'
  | '舌根音 (Âm gốc lưỡi)'
  | '舌面音 (Âm mặt lưỡi)'
  | '舌尖前音 (Âm đầu lưỡi trước)'
  | '舌尖后音 (Âm uốn lưỡi)'
  | '半辅音 (Bán phụ âm)';

export interface InitialItem {
  id: string;
  symbol: string;
  pinyinName: string;
  group: InitialGroup;
  partNumber: number; // 1: Phần 1 (Buổi 1), 2: Phần 2 (Buổi 2)
  vietnameseGuide: string;
  mouthDescription: string;
  aspirated: boolean; // Có bật hơi không
  voiced: boolean;
  gridPosition: 'top-mid' | 'mid' | 'mid-bottom' | 'full' | 'top-bottom'; // Vị trí kẹp trên dòng kẻ 4 dòng
  exampleWord: string; // Từ ví dụ
  examplePinyin: string;
  exampleVietnamese: string;
  mouthDiagramType: 'lip_closure' | 'tongue_tip_teeth' | 'velar_throat' | 'palatal' | 'retroflex' | 'dental_sibilant';
}

export interface InitialPartInfo {
  id: string;
  partNumber: number;
  title: string;
  sessionName: string;
  description: string;
  initialSymbols: string[];
}

export type FinalCategory = 'Đơn (单韵母)' | 'Kép (复韵母)' | 'Mũi (鼻韵母)';

export interface FinalItem {
  id: string;
  symbol: string;
  pinyinName: string;
  category: FinalCategory;
  partNumber: number; // 1: Phần 1 (Buổi 1), 2: Phần 2 (Buổi 2)
  vietnameseGuide: string;
  mouthGuide: string;
  exampleWord: string;
  examplePinyin: string;
  exampleVietnamese: string;
}

export interface FinalPartInfo {
  id: string;
  partNumber: number;
  title: string;
  sessionName: string;
  description: string;
  finalSymbols: string[];
}

export interface ToneItem {
  toneNumber: number;
  name: string;
  chineseName: string;
  symbolMark: string; // ā, á, ǎ, à
  pitchContour: string; // 5-5, 3-5, 2-1-4, 5-1, 3-1
  description: string;
  exampleWord: string;
  examplePinyin: string;
  exampleVietnamese: string;
}

export interface PinyinRule {
  id: string;
  title: string;
  summary: string;
  details: string[];
  examples: {
    original: string;
    written: string;
    pronounciation: string;
    meaning: string;
  }[];
  slideNote?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'initial' | 'final' | 'tone' | 'syllable';
  lessonPart?: 1 | 2;
  audioPinyin: string; // Chuỗi pinyin đọc mẫu
  displayPrompt: string; // Chuỗi hiển thị ví dụ: "_ uài" hoặc "h _ _"
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface UserProgress {
  listenedCount: number;
  completedGamesCount: number;
  score: number;
  streak: number;
}
