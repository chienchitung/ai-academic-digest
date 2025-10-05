
import React, { useRef, useState } from 'react';
import { SummaryOptions, Audience, OutputFormat } from '../types';
import { getAudienceOptions, getFormatOptions } from '../constants';
import { parseFile } from '../utils/fileParser';

interface ControlsPanelProps {
    options: SummaryOptions;
    setOptions: (options: SummaryOptions) => void;
    paperText: string;
    setPaperText: (text: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    t: (key: string, params?: { [key: string]: string | number }) => string;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
    options,
    setOptions,
    paperText,
    setPaperText,
    onSubmit,
    isLoading,
    t
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const audienceOptions = getAudienceOptions(t);
    const formatOptions = getFormatOptions(t);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setParseError(null);
        setPaperText('');
        setFileName(null);

        try {
            const text = await parseFile(file);
            setPaperText(text);
            setFileName(file.name);
        } catch (error) {
            const message = error instanceof Error ? t(error.message) : 'An unknown error occurred during file parsing.';
            console.error('File parsing error:', error);
            setParseError(message);
        } finally {
            setIsParsing(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleOptionChange = <K extends keyof SummaryOptions>(key: K, value: SummaryOptions[K]) => {
        setOptions({ ...options, [key]: value });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col space-y-6 h-full transition-colors duration-300">
            <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">{t('providePaper')}</h2>
                <div className="mt-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/pdf"
                        disabled={isLoading || isParsing}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isParsing}
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{isParsing ? t('parsingFile') : (fileName || t('uploadFile'))}</span>
                    </button>
                    {parseError && <p className="text-red-600 text-sm mt-2">{parseError}</p>}
                </div>
            </div>

             <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-800 px-2 text-sm text-slate-500 dark:text-slate-400">{t('or')}</span>
                </div>
            </div>

            <textarea
                className="w-full h-52 p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ease-in-out resize-y text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-400"
                placeholder={t('pasteTextPlaceholder')}
                value={paperText}
                onChange={(e) => {
                    setPaperText(e.target.value);
                    setFileName(null);
                    setParseError(null);
                }}
                disabled={isLoading}
            />

            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">{t('configureSummary')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('targetAudience')}</label>
                    <select
                        id="audience"
                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={options.audience}
                        onChange={(e) => handleOptionChange('audience', e.target.value as Audience)}
                        disabled={isLoading}
                    >
                        {audienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="format" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('outputFormat')}</label>
                    <select
                        id="format"
                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={options.outputFormat}
                        onChange={(e) => handleOptionChange('outputFormat', e.target.value as OutputFormat)}
                        disabled={isLoading}
                    >
                        {formatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="wordCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('wordCountLimit', { count: options.wordCount })}</label>
                    <input
                        type="range"
                        id="wordCount"
                        min="100"
                        max="500"
                        step="50"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        value={options.wordCount}
                        onChange={(e) => handleOptionChange('wordCount', parseInt(e.target.value, 10))}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="relative flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="critical-analysis"
                        name="critical-analysis"
                        type="checkbox"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                        checked={options.criticalAnalysis}
                        onChange={(e) => handleOptionChange('criticalAnalysis', e.target.checked)}
                        disabled={isLoading}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="critical-analysis" className="font-medium text-slate-700 dark:text-slate-300">{t('enableCriticalAnalysis')}</label>
                    <p className="text-slate-500 dark:text-slate-400">{t('criticalAnalysisDescription')}</p>
                </div>
            </div>
            
            <div className="flex-grow"></div>

            <button
                onClick={onSubmit}
                disabled={isLoading || !paperText}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out flex items-center justify-center"
            >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('generating')}
                  </>
                ) : t('generateSummary')}
            </button>
        </div>
    );
};
