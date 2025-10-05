
import { SummaryOptions, Audience, OutputFormat } from './types';

export const DEFAULT_OPTIONS: SummaryOptions = {
  wordCount: 250,
  outputFormat: OutputFormat.Paragraph,
  audience: Audience.Academic,
  criticalAnalysis: false,
};

type TFunction = (key: string) => string;

export const getAudienceOptions = (t: TFunction) => [
  { value: Audience.Academic, label: t('audience.academic') },
  { value: Audience.Executive, label: t('audience.executive') },
  { value: Audience.Public, label: t('audience.public') },
  { value: Audience.Student, label: t('audience.student') },
];

export const getFormatOptions = (t: TFunction) => [
  { value: OutputFormat.Paragraph, label: t('format.paragraph') },
  { value: OutputFormat.BulletPoints, label: t('format.bulletPoints') },
];
