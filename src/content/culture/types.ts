export type CultureHubId = 'jiaobei' | 'yingge' | 'jianzhi';

export type EvidenceLevel = 'recorded' | 'oral-tradition' | 'game-design';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SourceLink {
  name: string;
  href: string;
}

export interface CultureTerm {
  name: string;
  meaning: string;
  evidence?: EvidenceLevel;
}

export interface CultureSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface CulturePage {
  kind: 'hub' | 'topic';
  hub: CultureHubId;
  /** Topic slug; for hubs equals hub id */
  slug: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  quickAnswer: string[];
  sections: CultureSection[];
  terms?: CultureTerm[];
  faq: FaqItem[];
  sources: SourceLink[];
  relatedPaths: string[];
  gameHref: string;
  gameName: string;
  dateModified: string;
  howToSteps?: { name: string; text: string }[];
}
