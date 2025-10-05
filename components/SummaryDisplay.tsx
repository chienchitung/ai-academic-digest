
import React, { useState, useCallback } from 'react';
import { Spinner } from './Spinner';

interface SummaryDisplayProps {
    summary: string;
    isLoading: boolean;
    error: string | null;
    t: (key: string) => string;
}

const EmptyState: React.FC<{t: (key: string) => string}> = ({ t }) => (
    <div className="text-center p-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-full flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{t('summaryAwaits')}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('summaryAwaitsDescription')}</p>
    </div>
);

const CopyIcon: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading, error, t }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyToClipboard = useCallback(() => {
        if (summary) {
            // Strip HTML tags for clean copy
            const plainTextSummary = summary.replace(/<[^>]*>/g, '');
            navigator.clipboard.writeText(plainTextSummary);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [summary]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full transition-colors duration-300">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">{t('generatedSummary')}</h2>
            <div className="relative h-[calc(100%-4rem)]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Spinner />
                        <p className="mt-4 text-slate-600 dark:text-slate-400">{t('analyzing')}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {!isLoading && !error && !summary && <EmptyState t={t} />}
                {!isLoading && !error && summary && (
                    <>
                        <button
                            onClick={handleCopyToClipboard}
                            className="absolute top-0 right-2 z-10 p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors duration-200"
                            aria-label={isCopied ? t('copied') : t('copyToClipboard')}
                        >
                           {isCopied ? <CheckIcon className="h-5 w-5 text-green-600" /> : <CopyIcon className="h-5 w-5" />}
                        </button>
                        <div className="prose prose-slate dark:prose-invert max-w-none h-full overflow-y-auto pr-2">
                            <div 
                                className="whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            >
                            </div>
                        </div>
                   </>
                )}
            </div>
        </div>
    );
};
