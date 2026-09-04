export type Verdict = "green" | "caution" | "hold";
export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type PolicyCategory =
  | "copyright"
  | "community"
  | "advertiser"
  | "kids"
  | "monetization"
  | "terms";

export type MusicSource =
  | "none"
  | "original"
  | "library"
  | "yt-audio"
  | "cover"
  | "commercial"
  | "unknown";

export type FootageOrigin =
  | "self"
  | "collab"
  | "stock"
  | "game"
  | "clips"
  | "mixed"
  | "unknown";

export type Audience = "kids" | "not-kids" | "unsure";

export type SensitiveTopic =
  | "violence"
  | "weapons"
  | "drugs"
  | "adult"
  | "politics"
  | "tragedy"
  | "medical"
  | "profanity";

export type ScanMode = "file" | "url" | "describe";

export interface FrameSample {
  t: number;
  dataUrl: string;
}

export interface VideoMeta {
  durationSec: number;
  width: number;
  height: number;
  fileName: string;
  fileSize: number;
}

export interface ScanForm {
  title: string;
  description: string;
  tags: string;
  category: string;
  audience: Audience;
  music: MusicSource;
  footage: FootageOrigin;
  hasThirdPartyClips: boolean;
  hasProminentBrands: boolean;
  childrenOnCamera: boolean;
  monetize: boolean;
  topics: SensitiveTopic[];
  youtubeUrl: string;
  notes: string;
}

export interface ScanInput {
  mode: ScanMode;
  form: ScanForm;
  video?: VideoMeta;
  frames: FrameSample[];
  sampleId?: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  category: PolicyCategory;
  title: string;
  detail: string;
  policyId: string;
  fix: string;
  frameIndex?: number;
}

export interface CategoryScore {
  score: number;
  verdict: Verdict;
  note: string;
}

export interface ScanReport {
  id: string;
  createdAt: string;
  verdict: Verdict;
  score: number;
  summary: string;
  categories: Record<PolicyCategory, CategoryScore>;
  findings: Finding[];
  nextSteps: string[];
  contentIdLikelihood: "low" | "medium" | "high";
  ageRestrictionLikelihood: "low" | "medium" | "high";
  monetizationOutlook: "full" | "limited" | "none" | "ineligible";
  fairUseNotes: string;
  aiUsed: boolean;
  aiError?: string;
  form: ScanForm;
  video?: VideoMeta;
  thumbDataUrl?: string;
  sourceLabel: string;
  youtubeListing?: {
    title: string;
    author: string;
  };
}

export const EMPTY_FORM: ScanForm = {
  title: "",
  description: "",
  tags: "",
  category: "People & Blogs",
  audience: "not-kids",
  music: "unknown",
  footage: "self",
  hasThirdPartyClips: false,
  hasProminentBrands: false,
  childrenOnCamera: false,
  monetize: true,
  topics: [],
  youtubeUrl: "",
  notes: "",
};

export const YT_CATEGORIES = [
  "Film & Animation",
  "Autos & Vehicles",
  "Music",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
  "Gaming",
  "People & Blogs",
  "Comedy",
  "Entertainment",
  "News & Politics",
  "Howto & Style",
  "Education",
  "Science & Technology",
  "Nonprofits & Activism",
] as const;
