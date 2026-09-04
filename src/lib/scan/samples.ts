import { EMPTY_FORM, type ScanForm } from "./types";

export interface SampleScenario {
  id: string;
  title: string;
  blurb: string;
  form: ScanForm;
}

export const SAMPLES: SampleScenario[] = [
  {
    id: "travel-vlog",
    title: "Original travel vlog",
    blurb: "You filmed it. Original voiceover. Library music.",
    form: {
      ...EMPTY_FORM,
      title: "A quiet week in Kyoto — walking the canals at dawn",
      description:
        "Shot on a handheld camera over seven mornings. Original voiceover, licensed library piano under the credits. No street performances recorded.",
      tags: "kyoto, travel, walking, japan",
      category: "Travel & Events",
      audience: "not-kids",
      music: "library",
      footage: "self",
      hasThirdPartyClips: false,
      hasProminentBrands: false,
      childrenOnCamera: false,
      monetize: true,
      topics: [],
      notes: "All footage shot by the uploader. Music: Artlist license on file.",
    },
  },
  {
    id: "movie-recap",
    title: "Movie recap with clips",
    blurb: "Studio footage, commercial score, 'fair use' in the description.",
    form: {
      ...EMPTY_FORM,
      title: "EVERY SCENE in Dune 2 explained in 12 minutes (NO COPYRIGHT INTENDED)",
      description:
        "Fair use. I do not own the movie. All clips from the film with my voiceover recap. Watch the original!",
      tags: "dune, recap, explained, movie, spoilers",
      category: "Film & Animation",
      audience: "not-kids",
      music: "commercial",
      footage: "clips",
      hasThirdPartyClips: true,
      hasProminentBrands: true,
      childrenOnCamera: false,
      monetize: true,
      topics: ["violence"],
      notes: "Sourced from a retail Blu-ray rip. Commercial soundtrack left in.",
    },
  },
  {
    id: "game-plus-song",
    title: "Gameplay over a hit song",
    blurb: "Fortnite capture with a trending Drake track on the mix.",
    form: {
      ...EMPTY_FORM,
      title: "INSANE 30 KILL GAME + Drake - God's Plan (best montage)",
      description:
        "Gameplay montage with God's Plan playing the whole time. Subscribe for daily Fortnite. Free V-Bucks giveaway in the discord.",
      tags: "fortnite, montage, drake, gods plan, vbucks",
      category: "Gaming",
      audience: "unsure",
      music: "commercial",
      footage: "game",
      hasThirdPartyClips: false,
      hasProminentBrands: true,
      childrenOnCamera: false,
      monetize: true,
      topics: ["violence", "profanity"],
      notes: "Full song used from a ripped mp3. In-game lobby music also audible.",
    },
  },
];
