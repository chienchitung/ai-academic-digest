
export enum Audience {
  Academic = 'Academic Researcher',
  Executive = 'Corporate Executive',
  Public = 'General Public',
  Student = 'University Student',
}

export enum OutputFormat {
  Paragraph = 'paragraph',
  BulletPoints = 'bullet points',
}

export interface SummaryOptions {
  wordCount: number;
  outputFormat: OutputFormat;
  audience: Audience;
  criticalAnalysis: boolean;
}
