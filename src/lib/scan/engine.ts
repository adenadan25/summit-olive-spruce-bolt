import type {
  Finding,
  PolicyCategory,
  ScanForm,
  ScanReport,
  Severity,
  Verdict,
  VideoMeta,
} from "./types";

function finding(
  partial: Omit<Finding, "id"> & { id?: string },
): Finding {
  return {
    id: partial.id ?? `${partial.policyId}-${partial.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    severity: partial.severity,
    category: partial.category,
    title: partial.title,
    detail: partial.detail,
    policyId: partial.policyId,
    fix: partial.fix,
    frameIndex: partial.frameIndex,
  };
}

function looksLikeAllCaps(title: string): boolean {
  const letters = title.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 8) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.8;
}

function textBlob(form: ScanForm): string {
  return `${form.title}\n${form.description}\n${form.tags}\n${form.notes}`.toLowerCase();
}

export function runPolicyEngine(form: ScanForm, video?: VideoMeta): Finding[] {
  const out: Finding[] = [];
  const blob = textBlob(form);
  const title = form.title.trim();

  if (
    /no copyright intended|copyright free|i do not own|not my (song|music|video)|credits to the owner/.test(
      blob,
    )
  ) {
    out.push(
      finding({
        severity: "medium",
        category: "copyright",
        policyId: "cr-ownership",
        title: "A disclaimer does not grant you rights",
        detail:
          "Phrases like 'no copyright intended' or 'I do not own the music' are treated as an admission that you lack a license. They do not stop Content ID or a takedown.",
        fix: "Remove the disclaimer and replace uncleared music or clips with material you own or licensed.",
      }),
    );
  }

  if (form.music === "commercial") {
    out.push(
      finding({
        severity: "high",
        category: "copyright",
        policyId: "cr-music",
        title: "Commercial music is almost always claimed",
        detail:
          "Popular recordings are in Content ID. Typical outcomes: the label takes your revenue, the audio is muted, or the video is blocked in some countries. That is a claim, not automatically a strike — but the video may never go live as you intended.",
        fix: "Swap to original music, YouTube Audio Library, or a library you have a written license for. Keep the invoice.",
      }),
    );
  }

  if (form.music === "cover") {
    out.push(
      finding({
        severity: "medium",
        category: "copyright",
        policyId: "cr-music",
        title: "Covers still use someone else's composition",
        detail:
          "Performing a song yourself avoids the recording fingerprint, but the composition is still owned. YouTube has deals for some covers; many songs still claim, block regionally, or take ads.",
        fix: "Check whether the specific song is in a YouTube cover program, or license the composition. Original songs are cleaner.",
      }),
    );
  }

  if (form.music === "unknown") {
    out.push(
      finding({
        severity: "medium",
        category: "copyright",
        policyId: "cr-content-id",
        title: "Unknown music source is a hidden claim risk",
        detail:
          "If you cannot name the license, Content ID probably can. Background playlists, restaurant TVs, gym speakers, and 'free MP3' sites are common surprise matches.",
        fix: "Identify every track. Mute or replace anything you cannot document.",
      }),
    );
  }

  if (form.music === "library" || form.music === "yt-audio") {
    out.push(
      finding({
        severity: "info",
        category: "copyright",
        policyId: "cr-music",
        title: "Keep proof of the music license",
        detail:
          "Library and YouTube Audio Library tracks are the usual safe path, but mis-tagged 'copyright free' playlists are not the same thing. A license you cannot produce is a weak dispute.",
        fix: "Save the track name, license page, and receipt alongside the project files.",
      }),
    );
  }

  if (form.footage === "clips" || form.hasThirdPartyClips) {
    out.push(
      finding({
        severity: "high",
        category: "copyright",
        policyId: "cr-fair-use",
        title: "Third-party clips will be fingerprinted",
        detail:
          "Movie, TV, sports, and news footage is in Content ID. Recaps, 'best moments', and reaction videos that are mostly the original clip rarely survive as fair use. YouTube will still match first and ask questions later.",
        fix: "Cut to the minimum clip, add substantial original commentary on camera, and be ready for a claim. If this is a recap with no transformation, do not upload it.",
      }),
    );
    out.push(
      finding({
        severity: "high",
        category: "monetization",
        policyId: "cr-reused",
        title: "Clip compilations look like reused content",
        detail:
          "Even if a clip is licensed or claimed rather than struck, YPP reviewers treat channels built from other people's footage as reused content. That can deny or remove monetization for the whole channel.",
        fix: "Make your narration, analysis, or on-camera performance the point of the video — not the borrowed clip.",
      }),
    );
  }

  if (form.footage === "game") {
    out.push(
      finding({
        severity: "medium",
        category: "copyright",
        policyId: "cr-games",
        title: "Publisher rules vary by game",
        detail:
          "Most let's plays are tolerated, but in-game radio, licensed stadium music, and cinematic cutscenes are frequently claimed. Sports and rhythm games are the strictest.",
        fix: "Read the publisher's fan-content policy. Mute licensed in-game music. Skip unskippable movie cinematics if the publisher is aggressive.",
      }),
    );
  }

  if (form.footage === "unknown") {
    out.push(
      finding({
        severity: "medium",
        category: "copyright",
        policyId: "cr-ownership",
        title: "Footage origin is undocumented",
        detail:
          "YouTube's Terms put the burden on you to prove you have the rights. If you cannot say who shot it, a claim or takedown is hard to fight.",
        fix: "Only upload footage you shot, co-own, or licensed. Keep the files and agreements.",
      }),
    );
  }

  if (form.footage === "mixed") {
    out.push(
      finding({
        severity: "medium",
        category: "copyright",
        policyId: "cr-ownership",
        title: "Mixed footage needs a paper trail",
        detail:
          "A video assembled from your clips plus other people's work is judged as a whole. Any uncleared shot can claim or take down the entire upload.",
        fix: "List every source. Replace anything you cannot license. Keep invoices next to the project files.",
      }),
    );
  }

  if (form.hasProminentBrands) {
    out.push(
      finding({
        severity: "low",
        category: "copyright",
        policyId: "tos-rights",
        title: "Logos and brands can trigger trademark complaints",
        detail:
          "Incidental logos in the real world are usually fine. Making a brand the subject, using its logo as your thumbnail, or implying endorsement is how channels get legal complaints even without a Content ID match.",
        fix: "Avoid brand marks in thumbnails unless you have permission. Editorial use in a review is safer than a logo-as-clickbait.",
      }),
    );
  }

  if (form.audience === "kids") {
    out.push(
      finding({
        severity: "info",
        category: "kids",
        policyId: "kids-coppa",
        title: "Made for Kids disables key features",
        detail:
          "Kids videos cannot use personalized ads, comments, live chat the usual way, or notifications as an adult channel would. Earnings are lower by design.",
        fix: "Set the made-for-kids flag honestly. Do not try to keep comments on a preschool video.",
      }),
    );
    if (form.topics.includes("profanity") || form.topics.includes("adult") || form.topics.includes("violence")) {
      out.push(
        finding({
          severity: "critical",
          category: "kids",
          policyId: "cg-child-safety",
          title: "Adult themes in a kids-directed video",
          detail:
            "Packaging adult, violent, or sexual content for children is a child-safety violation, not a monetization issue. Channels are terminated for this.",
          fix: "Do not upload. Separate adult content onto a clearly adult channel with adult packaging, and never target it at kids.",
        }),
      );
    }
  }

  if (form.audience === "unsure") {
    out.push(
      finding({
        severity: "medium",
        category: "kids",
        policyId: "kids-coppa",
        title: "Audience setting is undecided",
        detail:
          "COPPA enforcement looks at whether the video is designed to attract children — toys, cartoons, sing-alongs, bright simple play — not at what you privately intended. A wrong 'not for kids' setting on kid-coded content is a legal risk.",
        fix: "If a child would choose this video, mark it made for kids. If it is for adults, strip kid-coded thumbnails and characters.",
      }),
    );
  }

  if (form.childrenOnCamera) {
    out.push(
      finding({
        severity: "medium",
        category: "kids",
        policyId: "cg-child-safety",
        title: "Minors on camera need extra care",
        detail:
          "Family vlogs that embarrass children, show them distressed, or invite creepy comments are a growing enforcement area. Thumbnails that isolate a child's face next to shock text are a red flag.",
        fix: "Get guardian consent. Do not film children crying, in swimwear close-up, or as the punchline. Lock comments if needed.",
      }),
    );
  }

  if (form.topics.includes("adult")) {
    out.push(
      finding({
        severity: "high",
        category: "community",
        policyId: "cg-nudity",
        title: "Sexual content is often removed or age-restricted",
        detail:
          "Pornography is banned. Sexually suggestive thumbnails and titles are enough. Age restriction, if you get it instead of a removal, still kills typical monetization and reach.",
        fix: "Keep clothing on, drop sexual thumbnails, and reframe as comedy, education, or relationship talk without graphic detail.",
      }),
    );
    out.push(
      finding({
        severity: "high",
        category: "advertiser",
        policyId: "ad-friendly",
        title: "Adult themes are not advertiser-friendly",
        detail: "Even if the video stays up, sexual themes usually mean limited or no ads.",
        fix: "If RPM matters, take adult material out of the first 15 seconds, title, and thumbnail — or accept no ads.",
      }),
    );
  }

  if (form.topics.includes("violence")) {
    out.push(
      finding({
        severity: "medium",
        category: "community",
        policyId: "cg-violence",
        title: "Graphic real-world violence can be removed",
        detail:
          "Game and fictional violence is usually allowed. Real blood, corpse close-ups, and fight compilations are the problem. News and documentary need visible context.",
        fix: "Blur injury, cut lingering gore, and explain why the viewer is seeing it. Do not use violence as the thumbnail.",
      }),
    );
    out.push(
      finding({
        severity: "medium",
        category: "advertiser",
        policyId: "ad-friendly",
        title: "Violence often means limited ads",
        detail:
          "Advertisers restrict graphic gaming in the cold open and uncontextualized injury. You can still be on YouTube with a yellow icon.",
        fix: "Start with context, not a gore hook, if you want full ads.",
      }),
    );
  }

  if (form.topics.includes("weapons")) {
    out.push(
      finding({
        severity: "medium",
        category: "community",
        policyId: "cg-firearms",
        title: "Weapons content is tightly scoped",
        detail:
          "Sporting, legal review, and news are usually allowed. How-to manufacturing, conversion, explosives, or a storefront for guns is removed.",
        fix: "No instructions for building or converting weapons. No buy links. Keep it educational or journalistic.",
      }),
    );
  }

  if (form.topics.includes("drugs")) {
    out.push(
      finding({
        severity: "medium",
        category: "community",
        policyId: "cg-harm",
        title: "Drug-use how-tos and promotion are removed",
        detail:
          "Depicting illegal drug sale, manufacturing, or abuse for entertainment is a Community Guidelines and advertiser problem. Recovery stories and news need a clear frame.",
        fix: "Do not show use, recipes, or sourcing. If the topic is harm reduction or news, make that obvious in the first seconds.",
      }),
    );
  }

  if (form.topics.includes("tragedy")) {
    out.push(
      finding({
        severity: "medium",
        category: "advertiser",
        policyId: "ad-sensitive-events",
        title: "Tragedy content is rarely fully monetized",
        detail:
          "Exploiting disasters, wars, or deaths for clicks can also be removed. Even careful news packages usually get limited ads.",
        fix: "No victim close-ups in the thumbnail. Lead with reporting, not shock. Expect limited ads.",
      }),
    );
  }

  if (form.topics.includes("medical")) {
    out.push(
      finding({
        severity: "medium",
        category: "community",
        policyId: "cg-misinfo",
        title: "Medical claims are high-scrutiny",
        detail:
          "Miracle cures, anti-science health advice, and 'this one trick' treatments can be removed as harmful misinformation. They also fail advertiser-friendly review.",
        fix: "Do not promise outcomes. Cite clinicians, and avoid supplement hard-sell in the same video as a disease claim.",
      }),
    );
  }

  if (form.topics.includes("profanity") && form.monetize) {
    out.push(
      finding({
        severity: "low",
        category: "advertiser",
        policyId: "ad-language",
        title: "Profanity in the open cuts RPM",
        detail:
          "Strong language in the title or first 8–15 seconds is the usual path to limited ads. Later, occasional swearing is often tolerated.",
        fix: "Clean title and cold open. Save stronger language for later, or accept limited ads.",
      }),
    );
  }

  if (form.topics.includes("politics") && form.monetize) {
    out.push(
      finding({
        severity: "low",
        category: "advertiser",
        policyId: "ad-sensitive-events",
        title: "Political content often gets limited ads",
        detail:
          "Commentary is allowed. Advertisers still sit out of many political videos, especially around elections, even when Community Guidelines are clean.",
        fix: "Stay factual, disclose AI-altered clips, and expect a lower RPM than entertainment content.",
      }),
    );
  }

  if (
    /\b(full movie|full episode|watch online free|camrip|hdcam|telesync|dvdrip|bluray rip)\b/i.test(
      blob,
    )
  ) {
    out.push(
      finding({
        severity: "critical",
        category: "copyright",
        policyId: "cr-ownership",
        title: "This listing reads as a pirate copy",
        detail:
          "Titles and descriptions that offer a full movie, episode, or cam rip are treated as copyright infringement, not as fair use. Channels are terminated for this, often without a prior warning.",
        fix: "Do not upload. YouTube is not a file host for other people's films or shows.",
      }),
    );
  }

  if (
    /\b(lyrics? video|karaoke|nightcore|slowed(?:\s*(?:\+|and)?\s*reverb)?|8d audio|full album)\b/i.test(
      blob,
    )
  ) {
    out.push(
      finding({
        severity: "high",
        category: "copyright",
        policyId: "cr-music",
        title: "Lyric, karaoke, and 'slowed' uploads are usually claimed",
        detail:
          "Putting someone else's recording under lyrics, a karaoke card, nightcore, or slowed-and-reverb still uses the master and the composition. Content ID matches these constantly. Many are blocked or fully monetized by the label.",
        fix: "Use original or licensed audio. A lyrics overlay does not create new rights.",
      }),
    );
  }

  if (
    /\b(tiktok compilation|reels compilation|best of tiktok|stolen video|reupload)\b/i.test(blob)
  ) {
    out.push(
      finding({
        severity: "high",
        category: "monetization",
        policyId: "cr-reused",
        title: "Repost compilations are reused content",
        detail:
          "Scraping TikToks, Reels, or other YouTube videos — even with a watermark crop — fails both copyright and YouTube Partner Program originality rules.",
        fix: "Build original videos. If you feature someone else's clip, get a license and make your commentary the point.",
      }),
    );
  }

  if (/\b(how to hack|ddos|steal (?:accounts|passwords)|credit card dump|ransomware)\b/i.test(blob)) {
    out.push(
      finding({
        severity: "high",
        category: "community",
        policyId: "cg-cyber",
        title: "Hacking and cyber-attack how-tos are removed",
        detail:
          "Instructional content for breaking into accounts, running attacks, or distributing malware violates Community Guidelines. 'Educational' is not a shield when the video is a recipe.",
        fix: "Do not upload attack instructions. Cybersecurity education must stay at a high level with no actionable exploit steps.",
      }),
    );
  }

  if (looksLikeAllCaps(title) || /free\s+(v-?bucks|robux|nitro)|you won'?t believe|\bgone wrong\b/i.test(title)) {
    out.push(
      finding({
        severity: "medium",
        category: "community",
        policyId: "cg-spam",
        title: "Title looks like spam or clickbait",
        detail:
          "ALL CAPS, fake giveaways, and 'gone wrong' bait that the video does not deliver are deceptive-practices issues. They also train the spam classifiers against the channel.",
        fix: "Write a specific title that matches the actual footage. Drop fake giveaways entirely.",
      }),
    );
  }

  if (/\b(deepfake|ai generated|elevenlabs|voice clone)\b/.test(blob)) {
    out.push(
      finding({
        severity: "medium",
        category: "terms",
        policyId: "tos-ai",
        title: "Realistic AI content needs disclosure",
        detail:
          "YouTube requires a disclosure when synthetic or altered content could look real — faces, voices, events. Cloning a real person to speak for them can also be impersonation.",
        fix: "Use YouTube's altered-content toggle. Do not impersonate a real person. Add a real editorial point of view so the channel is not a bulk farm.",
      }),
    );
  }

  if (form.monetize && (form.footage === "clips" || form.hasThirdPartyClips)) {
    out.push(
      finding({
        severity: "high",
        category: "monetization",
        policyId: "ypp-thresholds",
        title: "Monetization is unlikely on clip-led videos",
        detail:
          "Between Content ID taking the revenue and YPP reused-content review, clip compilations rarely pay the uploader. A claim can assign every dollar to the studio.",
        fix: "Monetize original series instead. Treat this video as promotional, not as the business.",
      }),
    );
  }

  if (video && video.durationSec > 0 && video.durationSec < 8 && form.category === "Music") {
    out.push(
      finding({
        severity: "info",
        category: "copyright",
        policyId: "cr-music",
        title: "Very short music clips still match Content ID",
        detail:
          "Content ID can match a few seconds of a recording. Shorts are not exempt from music claims.",
        fix: "Use original or licensed audio even on Shorts.",
      }),
    );
  }

  if (!title) {
    out.push(
      finding({
        severity: "info",
        category: "community",
        policyId: "cg-thumbnails",
        title: "Add the planned title before you rely on this report",
        detail:
          "Titles and thumbnails are reviewed on their own. A clean video with a sexual or misleading title still fails.",
        fix: "Paste the exact title and a description draft, then run the pre-flight again.",
      }),
    );
  }

  return out;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  info: 0,
  low: 3,
  medium: 8,
  high: 18,
  critical: 36,
};

const VERDICT_RANK: Record<Verdict, number> = { green: 0, caution: 1, hold: 2 };

export function scoreFromFindings(findings: Finding[]): number {
  const deduct = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.max(8, Math.min(100, 100 - deduct));
}

export function verdictFromFindings(findings: Finding[], score: number): Verdict {
  if (findings.some((f) => f.severity === "critical") || score < 40) return "hold";
  if (
    findings.some((f) => f.severity === "high" || f.severity === "medium") ||
    score < 72
  ) {
    return "caution";
  }
  return "green";
}

export function worseVerdict(a: Verdict, b: Verdict): Verdict {
  return VERDICT_RANK[a] >= VERDICT_RANK[b] ? a : b;
}

const CATEGORIES: PolicyCategory[] = [
  "copyright",
  "community",
  "advertiser",
  "kids",
  "monetization",
  "terms",
];

function categorySlice(findings: Finding[], category: PolicyCategory) {
  const subset = findings.filter((f) => f.category === category);
  const score = subset.length === 0 ? 96 : scoreFromFindings(subset);
  const verdict = subset.length === 0 ? "green" : verdictFromFindings(subset, score);
  const top = subset.sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])[0];
  return {
    score,
    verdict: verdict as Verdict,
    note: top ? top.title : "No issues flagged in this category.",
  };
}

function contentIdLikelihood(findings: Finding[], form: ScanForm): "low" | "medium" | "high" {
  if (form.music === "commercial" || form.footage === "clips" || form.hasThirdPartyClips) return "high";
  if (findings.some((f) => f.category === "copyright" && (f.severity === "high" || f.severity === "critical")))
    return "high";
  if (form.music === "unknown" || form.music === "cover" || form.footage === "game") return "medium";
  return "low";
}

function ageLikelihood(findings: Finding[], form: ScanForm): "low" | "medium" | "high" {
  if (form.topics.includes("adult") || form.topics.includes("violence")) return "high";
  if (form.topics.includes("weapons") || form.topics.includes("drugs") || form.topics.includes("profanity"))
    return "medium";
  if (findings.some((f) => f.policyId === "cg-nudity" || f.policyId === "cg-violence")) return "high";
  return "low";
}

function monetizationOutlook(
  verdict: Verdict,
  findings: Finding[],
  form: ScanForm,
): ScanReport["monetizationOutlook"] {
  if (findings.some((f) => f.severity === "critical")) return "ineligible";
  if (!form.monetize) return "none";
  if (verdict === "hold") return "none";
  if (form.audience === "kids") return "limited";
  if (findings.some((f) => f.category === "advertiser" && (f.severity === "high" || f.severity === "medium")))
    return "limited";
  if (form.music === "commercial" || form.hasThirdPartyClips) return "none";
  if (verdict === "caution") return "limited";
  return "full";
}

export function buildReport(opts: {
  form: ScanForm;
  video?: VideoMeta;
  findings: Finding[];
  summary?: string;
  nextSteps?: string[];
  fairUseNotes?: string;
  aiUsed: boolean;
  aiError?: string;
  thumbDataUrl?: string;
  sourceLabel: string;
  youtubeListing?: ScanReport["youtubeListing"];
}): ScanReport {
  const findings = opts.findings;
  const score = scoreFromFindings(findings);
  const verdict = verdictFromFindings(findings, score);
  const categories = Object.fromEntries(
    CATEGORIES.map((c) => [c, categorySlice(findings, c)]),
  ) as ScanReport["categories"];

  const defaultSummary =
    verdict === "green"
      ? "No high-risk signals from your answers and the frames we could see. Ordinary care still applies — this is not a Content ID pass."
      : verdict === "caution"
        ? "The video can probably be uploaded, but expect claims, limited ads, age restriction, or extra review. Fix the items below before you treat it as safe."
        : "High chance of a removal, strike, or a policy that can take the channel down. Do not upload this as it stands.";

  const defaultSteps = findings
    .filter((f) => f.severity === "critical" || f.severity === "high" || f.severity === "medium")
    .slice(0, 6)
    .map((f) => f.fix);

  if (defaultSteps.length === 0) {
    defaultSteps.push(
      "Keep license proofs for music and stock.",
      "Match the title and thumbnail to the actual video.",
      "Set the made-for-kids flag honestly at upload.",
    );
  }

  const fairUseNotes =
    opts.fairUseNotes ??
    (opts.form.hasThirdPartyClips || opts.form.footage === "clips"
      ? "Fair use is decided by courts, not by YouTube. Content ID will still match the clip. Adding 'fair use' in the description has no legal effect. Transformative commentary helps a dispute; a recap that replaces the original does not."
      : "You are not relying on fair use based on the answers given. If you later add uncleared clips, the picture changes.");

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    verdict,
    score,
    summary: opts.summary ?? defaultSummary,
    categories,
    findings,
    nextSteps: opts.nextSteps?.length ? opts.nextSteps : defaultSteps,
    contentIdLikelihood: contentIdLikelihood(findings, opts.form),
    ageRestrictionLikelihood: ageLikelihood(findings, opts.form),
    monetizationOutlook: monetizationOutlook(verdict, findings, opts.form),
    fairUseNotes,
    aiUsed: opts.aiUsed,
    aiError: opts.aiError,
    form: opts.form,
    video: opts.video,
    thumbDataUrl: opts.thumbDataUrl,
    sourceLabel: opts.sourceLabel,
    youtubeListing: opts.youtubeListing,
  };
}
