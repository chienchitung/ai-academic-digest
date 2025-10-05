
import { GoogleGenAI } from "@google/genai";
import { SummaryOptions, Audience, OutputFormat } from '../types';

const translations = {
    'zh-TW': {
        systemInstruction: "您是一位資深、嚴謹的學術研究助理。嚴禁您杜撰或生成原始文本中不存在的資訊。所有摘要內容必須基於並忠於原始文本。您的預設輸出應包含四個部分：'研究背景'、'研究方法'、'研究結果'和'結論'。",
        promptHeader: "請處理以下研究論文，並根據我的要求生成摘要：",
        task: "1. 任務：以 {outputFormat} 的格式生成摘要。",
        length: "2. 長度要求：總字數應約為 {wordCount} 字。",
        audience: "3. 讀者調整：請調整內容和語氣，使其適合 {audience}。",
        focus: "4. 內容重點：摘要必須聚焦於研究的主要發現和貢獻。",
        analysis: '5. 分析模式：在摘要之後，新增一個標題為 "研究評估" 的部分，並列出此研究的 3 個潛在限制。',
        audienceMap: {
            [Audience.Academic]: "學術研究員",
            [Audience.Executive]: "企業主管",
            [Audience.Public]: "一般大眾",
            [Audience.Student]: "大專院校學生",
        },
        formatMap: {
            [OutputFormat.Paragraph]: "段落",
            [OutputFormat.BulletPoints]: "重點條列",
        }
    },
    'en': {
        systemInstruction: "You are a senior, rigorous academic research assistant. You are strictly forbidden from fabricating or generating information that does not exist in the original text. All summary content must be based on and faithful to the original text. Your default output should include four sections: 'Research Background', 'Methodology', 'Results', and 'Conclusion'.",
        promptHeader: "Please process the following research paper and generate a summary based on my requirements:",
        task: "1. Task: Generate a summary in the format of {outputFormat}.",
        length: "2. Length Requirement: The total word count should be approximately {wordCount} words.",
        audience: "3. Audience Adjustment: Please adjust the content and tone to be suitable for a {audience}.",
        focus: "4. Content Focus: The summary must focus on the key findings and contributions of the research.",
        analysis: '5. Analysis Mode: After the summary, add a section titled "Research Evaluation" and list 3 potential limitations of this research.',
        audienceMap: {
            [Audience.Academic]: Audience.Academic,
            [Audience.Executive]: Audience.Executive,
            [Audience.Public]: Audience.Public,
            [Audience.Student]: Audience.Student,
        },
        formatMap: {
            [OutputFormat.Paragraph]: OutputFormat.Paragraph,
            [OutputFormat.BulletPoints]: OutputFormat.BulletPoints,
        }
    }
};


export async function generateSummary(paperText: string, options: SummaryOptions, locale: 'en' | 'zh-TW'): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const t = translations[locale] || translations['en'];

    const translatedAudience = t.audienceMap[options.audience];
    const translatedOutputFormat = t.formatMap[options.outputFormat];
    
    const promptLines = [
        t.promptHeader,
        t.task.replace('{outputFormat}', translatedOutputFormat),
        t.length.replace('{wordCount}', String(options.wordCount)),
        t.audience.replace('{audience}', translatedAudience),
        t.focus
    ];

    if (options.criticalAnalysis) {
        promptLines.push(t.analysis);
    }

    promptLines.push(
        "\n--- PAPER TEXT BEGINS ---\n",
        paperText,
        "\n--- PAPER TEXT ENDS ---"
    );

    const userPrompt = promptLines.join('\n');
    const systemInstruction = t.systemInstruction;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate summary from Gemini API.");
    }
}
