
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { SummaryDisplay } from './components/SummaryDisplay';
import { SummaryOptions } from './types';
import { DEFAULT_OPTIONS } from './constants';
import { generateSummary } from './services/geminiService';

// --- Internationalization (i18n) ---
const translations = {
  en: {
    "appTitle": "Academia Digest",
    "appDescription": "AI-Powered Academic Paper Summarization Tool",
    "toggleTheme": "Toggle theme",
    "toggleLanguage": "切換語言",
    "providePaper": "1. Provide Paper Text",
    "uploadFile": "Upload a file (PDF, DOCX, TXT)",
    "parsingFile": "Parsing File...",
    "or": "OR",
    "pasteTextPlaceholder": "Paste the text of the academic paper here...",
    "configureSummary": "2. Configure Summary",
    "targetAudience": "Target Audience",
    "outputFormat": "Output Format",
    "wordCountLimit": "Word Count Limit (~{{count}} words)",
    "audience.academic": "Academic",
    "audience.executive": "Executive",
    "audience.public": "Public",
    "audience.student": "Student",
    "format.paragraph": "Paragraph",
    "format.bulletPoints": "Bullet Points",
    "enableCriticalAnalysis": "Enable Critical Analysis",
    "criticalAnalysisDescription": "Also identify potential research limitations.",
    "generateSummary": "Generate Summary",
    "generating": "Generating...",
    "generatedSummary": "3. Generated Summary",
    "summaryAwaits": "Your Summary Awaits",
    "summaryAwaitsDescription": "Configure your options and paste your text to generate an AI-powered summary.",
    "copyToClipboard": "Copy to clipboard",
    "copied": "Copied!",
    "analyzing": "Analyzing text and generating summary...",
    "error.generic": "An error occurred while generating the summary. Please check your API key and try again.",
    "error.missingText": "Please paste the paper text before generating a summary."
  },
  'zh-TW': {
    "appTitle": "學術文摘",
    "appDescription": "AI 驅動的學術論文摘要工具",
    "toggleTheme": "切換主題",
    "toggleLanguage": "Switch Language",
    "providePaper": "1. 提供論文原文",
    "uploadFile": "上傳檔案 (PDF, DOCX, TXT)",
    "parsingFile": "正在解析檔案...",
    "or": "或",
    "pasteTextPlaceholder": "在此貼上學術論文的文字...",
    "configureSummary": "2. 設定摘要選項",
    "targetAudience": "目標讀者",
    "outputFormat": "輸出格式",
    "wordCountLimit": "字數限制 (約 {{count}} 字)",
    "audience.academic": "學術研究員",
    "audience.executive": "企業主管",
    "audience.public": "一般大眾",
    "audience.student": "大專院校學生",
    "format.paragraph": "段落",
    "format.bulletPoints": "重點條列",
    "enableCriticalAnalysis": "啟用批判性分析",
    "criticalAnalysisDescription": "同時識別潛在的研究限制。",
    "generateSummary": "生成摘要",
    "generating": "生成中...",
    "generatedSummary": "3. 生成的摘要",
    "summaryAwaits": "等待您的摘要",
    "summaryAwaitsDescription": "設定您的選項並貼上文字以生成 AI 摘要。",
    "copyToClipboard": "複製到剪貼簿",
    "copied": "已複製！",
    "analyzing": "正在分析文字並生成摘要...",
    "error.generic": "生成摘要時發生錯誤。請檢查您的 API 金鑰並再試一次。",
    "error.missingText": "生成摘要前，請先貼上論文內容。"
  }
};

const fileParserErrors = {
    en: {
        "fileParser.unsupportedType": "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
        "fileParser.pdfLibMissing": "PDF processing library could not be loaded. Please check your internet connection and try again.",
        "fileParser.mammothMissing": "Word document processing library could not be loaded. Please check your internet connection and try again.",
        "fileParser.pdfParseFailed": "Could not parse the PDF file. It might be corrupted or protected.",
        "fileParser.docxParseFailed": "Could not parse the DOCX file. Please ensure it is a valid .docx file.",
        "fileParser.textReadFailed": "Failed to read the text file."
    },
    'zh-TW': {
        "fileParser.unsupportedType": "不支援的檔案類型。請上傳 PDF、DOCX 或 TXT 檔案。",
        "fileParser.pdfLibMissing": "無法載入 PDF 處理函式庫。請檢查您的網路連線並再試一次。",
        "fileParser.mammothMissing": "無法載入 Word 文件處理函式庫。請檢查您的網路連線並再試一次。",
        "fileParser.pdfParseFailed": "無法解析 PDF 檔案。檔案可能已損壞或受保護。",
        "fileParser.docxParseFailed": "無法解析 DOCX 檔案。請確保它是有效的 .docx 檔案。",
        "fileParser.textReadFailed": "讀取文字檔失敗。"
    }
}

// Merge general and file parser errors into main translations
Object.assign(translations.en, fileParserErrors.en);
Object.assign(translations['zh-TW'], fileParserErrors['zh-TW']);


type Theme = 'light' | 'dark';
type Locale = 'en' | 'zh-TW';

const supportedLanguages: Locale[] = ['en', 'zh-TW'];

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const savedLocale = localStorage.getItem('locale') as Locale;
  if (savedLocale && supportedLanguages.includes(savedLocale)) {
    return savedLocale;
  }
  const browserLang = navigator.language;
  if (supportedLanguages.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return 'en';
};
// --- End i18n ---

function App() {
  const [paperText, setPaperText] = useState<string>('');
  const [options, setOptions] = useState<SummaryOptions>(DEFAULT_OPTIONS);
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const [locale, setLocale] = useState<Locale>(getInitialLocale());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = () => {
    setLocale(prevLocale => prevLocale === 'en' ? 'zh-TW' : 'en');
  };

  const t = useCallback((key: string, params?: { [key: string]: string | number }): string => {
    const translationSet = translations[locale] || translations['en'];
    let translation = (translationSet as any)[key] || key;

    if (params) {
      Object.keys(params).forEach(pKey => {
        translation = translation.replace(new RegExp(`{{${pKey}}}`, 'g'), String(params[pKey]));
      });
    }
    return translation;
  }, [locale]);

  const handleGenerateSummary = useCallback(async () => {
    if (!paperText.trim()) {
      setError(t('error.missingText'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummaryResult('');

    try {
      const result = await generateSummary(paperText, options, locale);
      setSummaryResult(result);
    } catch (e) {
      console.error(e);
      setError(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  }, [paperText, options, t, locale]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        t={t}
        changeLanguage={changeLanguage}
        locale={locale}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ControlsPanel
            options={options}
            setOptions={setOptions}
            paperText={paperText}
            setPaperText={setPaperText}
            onSubmit={handleGenerateSummary}
            isLoading={isLoading}
            t={t}
          />
          <SummaryDisplay
            summary={summaryResult}
            isLoading={isLoading}
            error={error}
            t={t}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
