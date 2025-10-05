
// These are loaded from the <script> tags in index.html
declare const mammoth: any;
declare const pdfjsLib: any;

// Configure the worker for pdf.js. This is required for it to work.
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
}

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (_error) => reject(new Error('fileParser.textReadFailed'));
    reader.readAsText(file);
  });
};

const readPdfFile = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
    }
    return textContent;
  } catch(error) {
    console.error('PDF parsing failed:', error);
    throw new Error('fileParser.pdfParseFailed');
  }
};

const readDocxFile = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing failed:', error);
    throw new Error('fileParser.docxParseFailed');
  }
};

export const parseFile = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.txt')) {
    return readTextFile(file);
  }
  
  if (fileName.endsWith('.pdf')) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('fileParser.pdfLibMissing');
    }
    return readPdfFile(file);
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    if (fileName.endsWith('.doc')) {
      console.warn('Parsing .doc files has limited support and may not work as expected. Please use .docx for better results.');
    }
    if (typeof mammoth === 'undefined') {
      throw new Error('fileParser.mammothMissing');
    }
    return readDocxFile(file);
  }

  throw new Error('fileParser.unsupportedType');
};
