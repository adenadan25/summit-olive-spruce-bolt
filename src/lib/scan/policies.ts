import type { PolicyCategory } from "./types";

export interface Policy {
  id: string;
  category: PolicyCategory;
  title: string;
  summary: string;
  whatHappens: string;
  howToStaySafe: string[];
  sourceLabel: string;
  sourceUrl: string;
  keywords: string[];
}

export const POLICIES: Policy[] = [
  {
    id: "cr-ownership",
    category: "copyright",
    title: "You must own or license everything in the video",
    summary:
      "YouTube's Terms require that you own the copyright or have permission for every piece of the upload: picture, music, stills, fonts, and graphics. 'I found it online' or 'no copyright intended' does not grant rights.",
    whatHappens:
      "A rightsholder can Content ID claim the video, mute it, block it in some or all countries, or file a DMCA takedown. A takedown is a copyright strike.",
    howToStaySafe: [
      "Film original footage, or keep written licenses for stock and music.",
      "Do not use movie, TV, sports, or news clips unless you have a license or a real fair-use case you are willing to defend.",
      "Keep invoices and license certificates. YouTube may ask for them.",
    ],
    sourceLabel: "YouTube copyright",
    sourceUrl: "https://www.youtube.com/howyoutubeworks/policies/copyright/",
    keywords: ["own", "license", "permission", "stolen", "download"],
  },
  {
    id: "cr-content-id",
    category: "copyright",
    title: "Content ID claims vs copyright strikes",
    summary:
      "Content ID is YouTube's automated fingerprinting system. It compares your upload against a private database of audio and video supplied by labels, studios, sports leagues, and other rightsholders. A match is a claim, not a strike.",
    whatHappens:
      "On a claim the rightsholder may take your ad revenue, track the video, mute the audio, or block it. A copyright strike only happens after a formal legal takedown. Three strikes in 90 days terminate the channel.",
    howToStaySafe: [
      "Assume popular commercial music, film, TV, and sports broadcasts will match.",
      "A claim is usually not fatal, but a blocked video never publishes, and claimed revenue is not yours.",
      "Dispute a claim only if you truly have rights. False disputes can escalate to a strike.",
    ],
    sourceLabel: "Content ID",
    sourceUrl: "https://support.google.com/youtube/answer/2797370",
    keywords: ["content id", "claim", "fingerprint", "match", "strike"],
  },
  {
    id: "cr-music",
    category: "copyright",
    title: "Music is the most common claim",
    summary:
      "Recordings and compositions are separate rights. Using a popular song, a radio capture, a live cover, or a 'free mp3' almost always hits Content ID. Trending sounds on Shorts are often still owned.",
    whatHappens:
      "Typical outcomes: the label monetizes your video, the video is blocked in some territories, or the audio is muted. Repeat uploads of the same track can draw a takedown.",
    howToStaySafe: [
      "Use original music, YouTube Audio Library, or a library you paid for (Artlist, Epidemic, etc.).",
      "Covers still need a mechanical/composition license; YouTube's deals do not cover every song in every country.",
      "Never trust 'no copyright music' playlists on YouTube itself — many are mislabeled and claimed.",
    ],
    sourceLabel: "YouTube music copyright",
    sourceUrl: "https://support.google.com/youtube/answer/2807684",
    keywords: ["music", "song", "beat", "soundtrack", "cover", "spotify"],
  },
  {
    id: "cr-fair-use",
    category: "copyright",
    title: "Fair use is a legal defense, not a YouTube setting",
    summary:
      "US fair use (and similar doctrines elsewhere) considers purpose, amount, nature, and market effect. Criticism, commentary, news, teaching, and parody can qualify — but YouTube does not decide fair use in advance, and Content ID will still match the clip.",
    whatHappens:
      "Even a strong fair-use video can be claimed or taken down first. You then dispute or file a counter-notification. Only a court can finally rule. Adding 'fair use' in the description does nothing.",
    howToStaySafe: [
      "Use the minimum clip needed, transform it with substantial original commentary, and do not substitute for the original.",
      "Movie recaps, 'every scene in 10 minutes', and lyric videos almost never qualify.",
      "Be ready to lose the dispute. Have a backup plan if the video is blocked.",
    ],
    sourceLabel: "Fair use on YouTube",
    sourceUrl: "https://support.google.com/youtube/answer/9783148",
    keywords: ["fair use", "transformative", "commentary", "parody", "recap"],
  },
  {
    id: "cr-games",
    category: "copyright",
    title: "Game footage depends on the publisher",
    summary:
      "Let's Plays are widely tolerated, but it is not a legal right. Some publishers (especially sports, music-rhythm, and movie-tie-in games) restrict or claim footage. In-game radio, licensed stadium music, and cinematic cutscenes are frequent claim sources.",
    whatHappens:
      "Publishers may claim the upload, mute cutscenes, or block entire games. Monetization can be taken even when the video stays up.",
    howToStaySafe: [
      "Check the publisher's 'games + YouTube' or fan-content policy before you invest in a series.",
      "Mute in-game licensed music and skip unskippable copyrighted cinematics if the publisher is strict.",
      "Your commentary and face-cam help, but they do not override a Content ID match on the audio.",
    ],
    sourceLabel: "YouTube copyright",
    sourceUrl: "https://www.youtube.com/howyoutubeworks/policies/copyright/",
    keywords: ["game", "gameplay", "let's play", "fortnite", "cutscene", "esports"],
  },
  {
    id: "cr-reused",
    category: "monetization",
    title: "Reused content can lock you out of YPP",
    summary:
      "YouTube Partner Program requires original content. Compilations of other people's clips, 'top 10' scrapes, mirrored livestreams, and mass-produced slideshows are reused content even when they are not copyright-infringing.",
    whatHappens:
      "YPP application is denied, or existing monetization is removed from the channel. Copyright claims are a separate, additional problem.",
    howToStaySafe: [
      "Add substantial original narration, editing, and on-camera presence.",
      "Do not build a channel from other creators' videos, TikToks, or podcasts.",
      "AI-generated bulk uploads with no original point of view are often treated as reused or spam.",
    ],
    sourceLabel: "YouTube Partner Program policies",
    sourceUrl: "https://support.google.com/youtube/answer/1311392",
    keywords: ["reused", "compilation", "repost", "mirror", "ypp", "original"],
  },
  {
    id: "cg-spam",
    category: "community",
    title: "Spam, scams, and deceptive practices",
    summary:
      "Misleading titles, fake 'free V-Bucks / giveaway' bait, engagement bait that promises something it cannot deliver, stolen channels, and repetitive bulk uploads violate Community Guidelines.",
    whatHappens:
      "Video removal, warning, feature limits, or channel termination for severe or repeat spam. Strikes apply.",
    howToStaySafe: [
      "Title, thumbnail, and video must match. No fake arrows, circles, or promised outcomes that never appear.",
      "Do not run giveaways you cannot fulfill. Do not impersonate brands or creators.",
      "Avoid uploading near-duplicate videos to game search.",
    ],
    sourceLabel: "Spam & deceptive practices",
    sourceUrl: "https://support.google.com/youtube/answer/2801973",
    keywords: ["spam", "scam", "misleading", "clickbait", "giveaway", "duplicate"],
  },
  {
    id: "cg-thumbnails",
    category: "community",
    title: "Thumbnails and titles are moderated too",
    summary:
      "YouTube reviews custom thumbnails and titles independently of the video. Sexualized imagery, graphic violence, shock faces, medical misinformation, and text that contradicts the video can be removed even if the video itself stays.",
    whatHappens:
      "Thumbnail is stripped or the video is taken down. Repeat offenders lose custom-thumbnail privileges.",
    howToStaySafe: [
      "Do not crop toward breasts, butts, or gore to manufacture clicks.",
      "Do not put claims in the title that the video does not support.",
      "Avoid sensational tragedy, death, or 'you won't believe' medical claims.",
    ],
    sourceLabel: "YouTube Community Guidelines",
    sourceUrl: "https://support.google.com/youtube/answer/9288567",
    keywords: ["thumbnail", "title", "clickbait", "custom thumbnail"],
  },
  {
    id: "cg-nudity",
    category: "community",
    title: "Nudity and sexual content",
    summary:
      "Pornography and sexual content meant to arouse are not allowed. Some artistic, educational, or documentary nudity is allowed with age restriction. Fetishes, sexualized minors (including animation), and graphic sex acts are removed.",
    whatHappens:
      "Removal and a Community Guidelines strike. Sexual content involving minors is a zero-tolerance termination and may be reported to authorities.",
    howToStaySafe: [
      "Keep clothing on. Sexually suggestive thumbnails are enough to get a video pulled.",
      "Educational content should be clearly framed as such, not as titillation.",
      "Never sexualize anyone 17 or under, including 3D, anime, or 'aging up' disclaimers.",
    ],
    sourceLabel: "Nudity & sexual content",
    sourceUrl: "https://support.google.com/youtube/answer/2802002",
    keywords: ["nudity", "sexual", "porn", "onlyfans", "fetish"],
  },
  {
    id: "cg-child-safety",
    category: "kids",
    title: "Child safety is a termination-level policy",
    summary:
      "Content that endangers, sexualizes, or exploits minors is forbidden. So is family-vlog content that humiliates children, or challenges that put kids at risk. Appearance of a minor in adult-themed videos is also a problem.",
    whatHappens:
      "Immediate channel termination for sexual or exploitative content. Other child-safety violations can strike or terminate. Law enforcement may be notified.",
    howToStaySafe: [
      "Do not film children in situations that embarrass, endanger, or sexualize them.",
      "If minors appear, keep the topic age-appropriate and get guardian permission.",
      "Do not mix adult humor, violence, or sexual talk with child-focused packaging.",
    ],
    sourceLabel: "Child safety",
    sourceUrl: "https://support.google.com/youtube/answer/2801999",
    keywords: ["child", "minor", "kids", "underage", "family vlog"],
  },
  {
    id: "cg-harm",
    category: "community",
    title: "Harmful or dangerous acts",
    summary:
      "YouTube removes content that shows or encourages dangerous challenges, hard-drug use, eating disorders as a goal, or instructions for violent crime, weapons modification, or scams.",
    whatHappens:
      "Removal and a strike. Instructional content for violent crime or weapons can terminate the channel.",
    howToStaySafe: [
      "Do not demonstrate how to do something that could seriously injure someone.",
      "Pranks that cause real fear, property damage, or injury are not 'just comedy'.",
      "Addiction, recovery, and news reporting need clear educational context, not how-to detail.",
    ],
    sourceLabel: "Harmful or dangerous content",
    sourceUrl: "https://support.google.com/youtube/answer/2801964",
    keywords: ["challenge", "prank", "drugs", "how to", "dangerous"],
  },
  {
    id: "cg-violence",
    category: "community",
    title: "Violent and graphic content",
    summary:
      "Graphic death, torture, corpse close-ups, and sadistic violence are not allowed. Fictional or game violence is usually allowed, sometimes age-restricted. Real-world fights filmed to glorify harm can be removed.",
    whatHappens:
      "Removal or age restriction. Repeated uploads of gore can terminate. Age-restricted videos cannot be monetized in the usual way and are blocked in some apps.",
    howToStaySafe: [
      "Blur or cut real blood and injury unless you are a news or documentary channel with strong context.",
      "Do not compile fight or crash videos for entertainment.",
      "Game footage of violence is typically fine; real animal cruelty is not.",
    ],
    sourceLabel: "Violent or graphic content",
    sourceUrl: "https://support.google.com/youtube/answer/2802008",
    keywords: ["violence", "gore", "blood", "fight", "graphic"],
  },
  {
    id: "cg-hate",
    category: "community",
    title: "Hate speech",
    summary:
      "Content that promotes violence or hatred against people based on race, ethnicity, religion, gender, sexual orientation, disability, nationality, or veteran status is banned. Slurs as the punchline, supremacy content, and conspiracy theories that dehumanize a group are included.",
    whatHappens:
      "Removal and a strike. Severe or repeat hate can terminate the channel without prior warning.",
    howToStaySafe: [
      "Do not platform supremacy or dehumanizing claims, even as 'just asking questions'.",
      "Documentary use of hate material needs clear condemnation and context.",
      "Comedy is not a free pass — YouTube looks at whether the video spreads the slur or critiques it.",
    ],
    sourceLabel: "Hate speech",
    sourceUrl: "https://support.google.com/youtube/answer/2801939",
    keywords: ["hate", "slur", "racism", "supremacy", "dehumanize"],
  },
  {
    id: "cg-harassment",
    category: "community",
    title: "Harassment and cyberbullying",
    summary:
      "Content whose purpose is to humiliate, dox, stalk, or incite others to harass a private person is not allowed. 'Drama' videos that publish personal info, sexualize a non-consenting person, or encourage raid-style attacks violate this policy.",
    whatHappens:
      "Removal and a strike. Doxxing and sexual harassment of private individuals can terminate.",
    howToStaySafe: [
      "Criticize public work, not private lives. No addresses, phone numbers, or workplaces.",
      "Do not clip minors or private people to mock them.",
      "Reply content should not exist solely to pile on.",
    ],
    sourceLabel: "Harassment & cyberbullying",
    sourceUrl: "https://support.google.com/youtube/answer/2802268",
    keywords: ["harassment", "dox", "bully", "drama", "expose"],
  },
  {
    id: "cg-misinfo",
    category: "community",
    title: "Misinformation",
    summary:
      "YouTube removes certain types of harmful misinformation: election interference, census fraud, proven medical hoaxes with serious harm (for example fake cancer cures), and manipulated media presented as real without disclosure.",
    whatHappens:
      "Removal, reduced recommendations, or info panels. Repeat medical or election misinfo can strike or terminate.",
    howToStaySafe: [
      "Do not present AI-altered footage of real people as authentic. Disclose realistic synthetic content.",
      "Avoid miracle-cure, anti-vaccine-as-fact, and 'the election was stolen' content.",
      "Opinion is allowed; fabricating evidence is not.",
    ],
    sourceLabel: "Misinformation policies",
    sourceUrl: "https://support.google.com/youtube/answer/10834785",
    keywords: ["misinformation", "fake news", "deepfake", "election", "medical"],
  },
  {
    id: "cg-firearms",
    category: "community",
    title: "Firearms and weapons",
    summary:
      "Showing legal, unmodified firearms in a sporting, educational, or documentary setting is usually allowed. Instruction on how to make firearms, convert them to automatic, build explosives, or sell weapons is not.",
    whatHappens:
      "Instructional or sales-focused weapons content is removed. Some videos are age-restricted.",
    howToStaySafe: [
      "No DIY gunsmithing, 3D-printed guns, or 'how to convert' content.",
      "Do not include buy links or prices for firearms and ammo as a storefront.",
      "Keep the focus on safety, sport, or news, not on causing harm.",
    ],
    sourceLabel: "Firearms policy",
    sourceUrl: "https://support.google.com/youtube/answer/7667759",
    keywords: ["gun", "firearm", "weapon", "ammo", "explosive"],
  },
  {
    id: "ad-friendly",
    category: "advertiser",
    title: "Advertiser-friendly guidelines",
    summary:
      "Even a video that stays on YouTube can be limited or demonetized. Advertisers avoid strong profanity in the first 8–15 seconds, graphic violence, adult themes, controversial political issues, drugs, shocking imagery, and content that is unfriendly to families.",
    whatHappens:
      "Limited or no ads. A yellow-dollar icon. In serious or repeat cases, YPP can be suspended. This is not a Community Guidelines strike.",
    howToStaySafe: [
      "Keep the open clean if you want full ads: no swearing, gore, or sexual dialogue in the first seconds.",
      "Contextualize violence, news, and tragedy. Do not make it the hook.",
      "Kids-directed content cannot run personalized ads even when it is otherwise clean.",
    ],
    sourceLabel: "Advertiser-friendly content",
    sourceUrl: "https://support.google.com/youtube/answer/6162278",
    keywords: ["ads", "demonetized", "yellow icon", "limited ads", "advertiser"],
  },
  {
    id: "ad-language",
    category: "advertiser",
    title: "Profanity and vulgar language",
    summary:
      "Occasional strong language later in a video may still get full ads. Profanity in the title, thumbnail, or throughout the majority of the runtime usually means limited or no ads.",
    whatHappens: "Limited ads, or no ads if the video is essentially a string of insults or sexual language.",
    howToStaySafe: [
      "Keep titles and the first 15 seconds clean if you care about RPM.",
      "Bleeping helps some reviewers; it does not guarantee full ads.",
      "Music videos with a dirty backing track are judged in context.",
    ],
    sourceLabel: "Advertiser-friendly content",
    sourceUrl: "https://support.google.com/youtube/answer/6162278",
    keywords: ["profanity", "swear", "language", "vulgar"],
  },
  {
    id: "kids-coppa",
    category: "kids",
    title: "Made for Kids and COPPA",
    summary:
      "If your audience is children, or the video is designed to attract them (characters, toys, sing-alongs, bright simple play), you must set it as made for kids. That disables personalized ads, comments, and some live features. Setting it wrong — either way — is a legal and policy problem.",
    whatHappens:
      "Wrong designation can bring COPPA enforcement, deleted videos, or channel termination. Made-for-kids videos earn less and cannot use several features.",
    howToStaySafe: [
      "Set 'made for kids' when the video is for children, even if your channel is mixed.",
      "Do not pack adult jokes into a kid-coded thumbnail and title.",
      "If children appear in a vlog aimed at adults, still be careful with comments and thumbnails.",
    ],
    sourceLabel: "Made for Kids",
    sourceUrl: "https://support.google.com/youtube/answer/9528076",
    keywords: ["coppa", "made for kids", "children audience", "family"],
  },
  {
    id: "tos-rights",
    category: "terms",
    title: "YouTube Terms of Service — rights you grant",
    summary:
      "By uploading you grant YouTube a worldwide license to host, modify, and display the video. You also warrant that the content does not infringe anyone else's rights (copyright, privacy, publicity, trademarks) and does not violate the law.",
    whatHappens:
      "YouTube can remove content, suspend features, or terminate accounts for ToS breaches. You remain legally responsible to rightsholders and to people you film.",
    howToStaySafe: [
      "Get consent from identifiable people, especially in private spaces.",
      "Do not upload content you do not have the rights to — including music inside a restaurant or gym.",
      "Read the current Terms before you treat an old rumor as policy.",
    ],
    sourceLabel: "YouTube Terms of Service",
    sourceUrl: "https://www.youtube.com/t/terms",
    keywords: ["terms", "tos", "license", "warrant", "privacy"],
  },
  {
    id: "tos-impersonation",
    category: "terms",
    title: "Impersonation and fake identity",
    summary:
      "Pretending to be another creator, a company, a public figure, or YouTube itself is not allowed. Parody channels must be obviously parody in the name and about section, not a trap.",
    whatHappens: "Channel termination. YouTube may also transfer a handle in some impersonation cases.",
    howToStaySafe: [
      "Do not copy another channel's name, banner, and face to siphon their audience.",
      "Mark parody clearly. 'Fan account' is not a license to speak as the brand.",
      "Deepfakes of real people need prominent disclosure and still cannot be used to defraud.",
    ],
    sourceLabel: "Impersonation policy",
    sourceUrl: "https://support.google.com/youtube/answer/2801947",
    keywords: ["impersonation", "fake", "parody", "handle", "brand"],
  },
  {
    id: "tos-ai",
    category: "terms",
    title: "Altered or synthetic (AI) content",
    summary:
      "YouTube requires you to disclose realistic content that is synthetic or altered when it could look real — especially faces, voices, and events. Low-effort mass-produced AI slideshows also collide with spam and reused-content rules.",
    whatHappens:
      "Missing disclosure can mean reduced reach or removal. Spammy AI channels are denied YPP and often terminated.",
    howToStaySafe: [
      "Toggle YouTube's altered-content disclosure when people or events look real but are not.",
      "Do not clone a real person's face or voice to speak for them.",
      "If you use AI, add a real point of view — research, hosting, editing — so it is not a bulk farm.",
    ],
    sourceLabel: "Altered content disclosure",
    sourceUrl: "https://support.google.com/youtube/answer/14328490",
    keywords: ["ai", "synthetic", "deepfake", "disclosure", "generated"],
  },
  {
    id: "ypp-thresholds",
    category: "monetization",
    title: "YouTube Partner Program eligibility",
    summary:
      "YPP requires 1,000 subscribers and 4,000 valid public watch hours in 12 months, or 10 million valid Shorts views in 90 days, plus no active strikes, a complete AdSense setup, and compliance with all program policies including reused content and advertiser-friendly rules.",
    whatHappens:
      "If you fall out of compliance, monetization is paused or removed. Copyright claims do not always eject you from YPP, but strikes and reused-content reviews do.",
    howToStaySafe: [
      "Do not buy subs or views. Invalid traffic is a termination path.",
      "Keep Community Guidelines and copyright records clean before you apply.",
      "A claimed soundtrack can zero out that video's revenue even inside YPP.",
    ],
    sourceLabel: "YouTube Partner Program",
    sourceUrl: "https://support.google.com/youtube/answer/72851",
    keywords: ["ypp", "monetize", "watch hours", "shorts views", "adsense"],
  },
  {
    id: "cg-self-harm",
    category: "community",
    title: "Suicide, self-harm, and eating disorders",
    summary:
      "Content that promotes or provides instructions for suicide, self-harm, or disordered eating is removed. Personal stories with a recovery frame, and news reporting, can stay with limited recommendations and help panels.",
    whatHappens:
      "Promotional or how-to content is removed and may terminate. Sensitive videos are often age-restricted and unmonetized.",
    howToStaySafe: [
      "Do not include methods, quantities, or 'how I did it' detail.",
      "If you discuss mental health, point to professional help and keep the focus on recovery.",
      "Never film or challenge anyone to harm themselves.",
    ],
    sourceLabel: "Suicide & self-harm",
    sourceUrl: "https://support.google.com/youtube/answer/2802245",
    keywords: ["suicide", "self-harm", "eating disorder", "mental health"],
  },
  {
    id: "ad-sensitive-events",
    category: "advertiser",
    title: "Sensitive events and controversial issues",
    summary:
      "Content that exploits tragedies, wars, terror attacks, or public-health emergencies for views is not advertiser-friendly and may also violate Community Guidelines if it is misleading or graphic. Topics like abuse, suicide, and abortion often get limited or no ads even when they remain up.",
    whatHappens: "Limited or no ads. Exploitative tragedy content can be removed as spam or harmful content.",
    howToStaySafe: [
      "News and documentary need a clear public-interest frame, not a shock montage.",
      "Do not use death counts, crash photos, or victim images as the thumbnail.",
      "Expect limited ads on hard-news and controversy even when you follow every rule.",
    ],
    sourceLabel: "Advertiser-friendly content",
    sourceUrl: "https://support.google.com/youtube/answer/6162278",
    keywords: ["tragedy", "war", "sensitive", "news", "controversy"],
  },
  {
    id: "cg-inauthentic",
    category: "community",
    title: "Inauthentic and mass-produced content",
    summary:
      "YouTube removes or limits channels that pump out repetitive, mass-produced, or misleading videos — including bulk AI slideshows, copied news recaps, and faceless spam that exists only to harvest views.",
    whatHappens:
      "Reduced recommendations, YPP denial, or channel termination for spam. This can happen even when no single video is a copyright strike.",
    howToStaySafe: [
      "Each upload should have a real point of view: hosting, research, or original footage.",
      "Do not clone the same script across dozens of videos with swapped stock clips.",
      "AI tools are allowed as a tool, not as a factory with no human editorial voice.",
    ],
    sourceLabel: "Spam & deceptive practices",
    sourceUrl: "https://support.google.com/youtube/answer/2801973",
    keywords: ["inauthentic", "mass-produced", "spam channel", "faceless", "bulk ai"],
  },
  {
    id: "cg-animals",
    category: "community",
    title: "Animal cruelty",
    summary:
      "Content that shows animals being tortured, baited, or harmed for entertainment is not allowed. Hunting, farming, and wildlife documentary with a public-interest frame can stay, with context.",
    whatHappens: "Removal and a strike. Severe animal-cruelty channels are terminated.",
    howToStaySafe: [
      "Do not stage or film harm to animals for views.",
      "Wildlife and farm content should inform, not shock.",
      "Thumbnails of injured animals are a fast way to lose the video.",
    ],
    sourceLabel: "Violent or graphic content",
    sourceUrl: "https://support.google.com/youtube/answer/2802008",
    keywords: ["animal", "cruelty", "pet", "wildlife", "harm"],
  },
  {
    id: "cg-cyber",
    category: "community",
    title: "Hacking and cyber attacks",
    summary:
      "Showing how to steal accounts, run DDoS attacks, spread malware, or bypass security for crime is banned. High-level cybersecurity awareness without exploit steps is usually allowed.",
    whatHappens: "Removal and a strike. Instructional attack content can terminate the channel.",
    howToStaySafe: [
      "No working exploits, credential dumps, or 'try this on your friend' attacks.",
      "Keep security videos at the concept-and-defense level.",
      "Never include download links for cracking tools.",
    ],
    sourceLabel: "Harmful or dangerous content",
    sourceUrl: "https://support.google.com/youtube/answer/2801964",
    keywords: ["hack", "ddos", "malware", "password", "cyber"],
  },
  {
    id: "cr-repeat",
    category: "copyright",
    title: "Three copyright strikes terminate the channel",
    summary:
      "A Content ID claim is not a strike. A formal DMCA takedown is. Three copyright strikes in 90 days delete the channel and all videos. One strike also blocks live streaming and some features until it expires or is resolved.",
    whatHappens:
      "First strike: restrictions and a warning. Third strike: channel termination. Appeals exist but are slow, and uploading the same work again is a fast path to strike two.",
    howToStaySafe: [
      "Treat a takedown as a fire, not a Content ID claim. Do not re-upload the same file.",
      "Dispute only when you have a license or a real fair-use case you can document.",
      "Keep the channel clean of uncleared music and movie clips so one bad video cannot sink it.",
    ],
    sourceLabel: "Copyright strikes",
    sourceUrl: "https://support.google.com/youtube/answer/2814000",
    keywords: ["strike", "three strikes", "dmca", "takedown", "terminate"],
  },
];

export function policyById(id: string): Policy | undefined {
  return POLICIES.find((p) => p.id === id);
}

export const CATEGORY_LABEL: Record<PolicyCategory, string> = {
  copyright: "Copyright",
  community: "Community",
  advertiser: "Advertiser-friendly",
  kids: "Child safety",
  monetization: "Monetization",
  terms: "Terms of Service",
};
