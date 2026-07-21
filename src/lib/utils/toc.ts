export interface AiTocItem {
  title: string;
  level: number;
  page: number;
}

export const SYSTEM_PROMPT_VISION = `
Role: Expert PDF ToC Image Parser.
Task: Parse image(s) into a structured JSON array.

Strict Rules:
1. READING ORDER (Auto-Detect):
   - Horizontal: Top-to-Bottom. Page num at line end.
   - Vertical (CJK): Right-to-Left columns. Page num at column bottom.
   - Stitch multiple images mentally.

2. FILTERING (CRITICAL):
   - PAGE NUMBERS: Must contain Arabic digits (0-9).
   - DISCARD line if page is Roman numeral (i, v, x).
   - KEEP Roman numerals in TITLES (e.g., "Part II").

3. CONTENT EXTRACTION:
   - VISUAL LITERALISM: Transcribe page text exactly (e.g., "10", "10-15") as String.
   - PREFIXES: Preserve exact numbering in Title (e.g., "1.1 Intro", "Chapter 1:").
   - LEVEL: Infer 1, 2, 3 from indentation/size/color visual hierarchy.

Output Format (JSON Only, No Markdown):
[{"title": "String (w/ prefix)", "level": Number, "page": Number}]
Return [] if unusable.
`;

export const SYSTEM_PROMPT_TEXT = `
You are an expert Table of Contents text parser.
Your task is to convert raw, unstructured ToC text (copied from websites like Amazon, Douban, etc.) into a structured JSON array.

Rules:
1.  **Extract Structure**: Identify the title, hierarchy level, and page number from each line.
2.  **Hierarchy**: Infer the 'level' (1, 2, 3) based on numbering (e.g., "1.", "1.1", "1.1.1") or indentation.
3.  **Page Numbers**: Extract the page number at the end of the line.
4.  **FULL TITLE RETENTION (CRITICAL)**:
    - The "title" field MUST include the numbering prefix exactly as it appears in the text.
    - Example Input: "1.2 Methodology ....... 15" -> Output Title: "1.2 Methodology"
    - Example Input: "Chapter One: Basics ... 5" -> Output Title: "Chapter One: Basics"
    - Do NOT remove the leading numbers or labels.
5.  **ROMAN NUMERAL BAN (PAGES)**: If the *page number* at the end is Roman (i, v, x), **DISCARD THE LINE**.
6.  **Clean Up**: Remove dots (.....) or dashes (----) that connect the title to the page number.
7.  **JSON ONLY**: Return strictly a JSON array. No markdown.
    Format: [{"title": "String", "level": Number, "page": Number}]
`;

export function normalizeToc(rawData: any[]): AiTocItem[] {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((item) => {
      let cleanPage = 0;

      if (typeof item.page === 'string') {
        const match = item.page.match(/(\d+)/);
        if (match) {
          cleanPage = parseInt(match[0], 10);
        }
      } else if (typeof item.page === 'number') {
        cleanPage = item.page;
      }

      return {
        title: String(item.title || '').trim(),
        level: typeof item.level === 'number' ? item.level : 1,
        page: cleanPage
      };
    })
    .filter(item => item.page > 0 && item.title.length > 0);
}
