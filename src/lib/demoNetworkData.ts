// Fake profile + connections in the exact shape fetchWidgetData resolves to
// -- fed straight into the real widget engine via NetworkWidget's demoData
// prop. The signed-out marketing page has no live embed_key or Supabase row
// to fetch, so this stands in for it.

// Simple abstract "designed placeholder" thumbnails for work samples -- flat
// SVGs (as data URIs, so no network dependency) rather than photos, matching
// the wireframe aesthetic used everywhere else on this page.
function placeholder(bg: string, shapes: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='360'><rect width='480' height='360' fill='${bg}'/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const SAMPLES = [
  placeholder(
    "#F4E7DD",
    "<circle cx='150' cy='190' r='110' fill='#E8785A'/><rect x='300' y='60' width='140' height='240' rx='24' fill='#2B2B2B' opacity='0.85'/>",
  ),
  placeholder(
    "#E4ECF7",
    "<rect x='40' y='60' width='190' height='240' rx='20' fill='#3B5BDB'/><circle cx='360' cy='150' r='80' fill='#1C1C1A' opacity='0.15'/><rect x='300' y='210' width='150' height='90' rx='16' fill='#3B5BDB' opacity='0.6'/>",
  ),
  placeholder(
    "#EAF3E8",
    "<g fill='#3E8E4F'><circle cx='60' cy='70' r='26'/><circle cx='170' cy='70' r='26'/><circle cx='280' cy='70' r='26'/><circle cx='390' cy='70' r='26'/><circle cx='60' cy='180' r='26'/><circle cx='170' cy='180' r='26'/><circle cx='280' cy='180' r='26'/><circle cx='390' cy='180' r='26'/><circle cx='60' cy='290' r='26'/><circle cx='170' cy='290' r='26'/><circle cx='280' cy='290' r='26'/><circle cx='390' cy='290' r='26'/></g>",
  ),
  placeholder("#EDE6F7", "<path d='M0 360L240 0L480 360Z' fill='#7C4DFF' opacity='0.8'/>"),
  placeholder(
    "#FBF0DA",
    "<rect x='60' y='80' width='360' height='70' rx='18' fill='#D8A13A'/><rect x='60' y='170' width='260' height='70' rx='18' fill='#D8A13A' opacity='0.75'/><rect x='60' y='260' width='190' height='40' rx='14' fill='#D8A13A' opacity='0.5'/>",
  ),
  placeholder(
    "#FBE4EC",
    "<circle cx='150' cy='140' r='90' fill='#E24C82'/><circle cx='300' cy='220' r='60' fill='#E24C82' opacity='0.55'/><circle cx='380' cy='110' r='34' fill='#E24C82' opacity='0.3'/>",
  ),
  placeholder(
    "#E0F3F1",
    "<path d='M0 250 Q120 150 240 250 T480 250 V360 H0 Z' fill='#1F9C8F'/><circle cx='390' cy='100' r='46' fill='#1F9C8F' opacity='0.5'/>",
  ),
  placeholder(
    "#2B2B2B",
    "<rect x='40' y='60' width='400' height='140' rx='16' fill='#525252'/><rect x='40' y='220' width='190' height='80' rx='14' fill='#525252'/><rect x='250' y='220' width='190' height='80' rx='14' fill='#525252'/>",
  ),
];

function workSample(id: string, index: number, asGif = false): { id: string; url: string; sort_order: number } {
  const url = SAMPLES[index % SAMPLES.length] + (asGif ? "#a.gif" : "");
  return { id, url, sort_order: index };
}

export const DEMO_WIDGET_DATA = {
  profile: {
    name: "Jordan Lee",
    bio: "Product designer specializing in fintech and B2B dashboards.",
    website: "jordanlee.design",
    avatar_url: null,
    widget_settings: { theme: "light", corner: "bottom-left", label: "View My Network" },
    workSamples: [],
    endorsements: [
      {
        id: "e1",
        fromId: "maya",
        fromName: "Maya Chen",
        fromAvatarUrl: null,
        text: "Jordan's eye for detail elevated every screen we shipped together.",
      },
      {
        id: "e2",
        fromId: "sam",
        fromName: "Sam Okafor",
        fromAvatarUrl: null,
        text: "One of the few designers who can also talk through the engineering tradeoffs.",
      },
      {
        id: "e3",
        fromId: "ivy",
        fromName: "Ivy Novak",
        fromAvatarUrl: null,
        text: "Jordan and I never had to over-explain a handoff. Just fast, clear collaboration.",
      },
    ],
  },
  connections: [
    {
      id: "maya",
      name: "Maya Chen",
      bio: "Senior Product Designer at Notion.",
      website: "mayachen.design",
      avatar_url: null,
      relationship: "Maya and I designed the onboarding flow together at Notion.",
      endorsesOwner: true,
      endorsements: [
        {
          id: "e4",
          fromId: "you",
          fromName: "Jordan Lee",
          fromAvatarUrl: null,
          text: "Maya elevated every project we worked on together — impeccable taste.",
        },
      ],
      workSamples: [workSample("w1", 0), workSample("w2", 1), workSample("w3", 2)],
    },
    {
      id: "sam",
      name: "Sam Okafor",
      bio: "Frontend Engineer at Vercel.",
      website: "samokafor.dev",
      avatar_url: null,
      relationship: "I worked with Sam on the component library at Vercel.",
      endorsesOwner: true,
      endorsements: [],
      workSamples: [workSample("w4", 3), workSample("w5", 4)],
    },
    {
      id: "priya",
      name: "Priya Nair",
      bio: "Art Director, freelance.",
      website: "priyanair.co",
      avatar_url: null,
      relationship: "Priya and I collaborated on brand identity for two startups.",
      endorsesOwner: false,
      endorsements: [],
      workSamples: [workSample("w6", 5), workSample("w7", 6), workSample("w8", 7), workSample("w9", 0)],
    },
    {
      id: "leo",
      name: "Leo Fischer",
      bio: "UX Researcher at Linear.",
      website: "leofischer.com",
      avatar_url: null,
      relationship: "I worked with Leo on usability studies at Linear.",
      endorsesOwner: true,
      endorsements: [],
      workSamples: [workSample("w10", 1)],
    },
    {
      id: "ava",
      name: "Ava Torres",
      bio: "Illustrator & visual designer.",
      website: "avatorres.art",
      avatar_url: null,
      relationship: "Ava and I partnered on editorial illustration for a launch campaign.",
      endorsesOwner: false,
      endorsements: [],
      workSamples: [workSample("w11", 5), workSample("w12", 3), workSample("w13", 6)],
    },
    {
      id: "ivy",
      name: "Ivy Novak",
      bio: "Motion Designer, freelance.",
      website: "ivynovak.studio",
      avatar_url: null,
      relationship: "Ivy and I built the motion system for our marketing site together.",
      endorsesOwner: true,
      endorsements: [],
      workSamples: [
        workSample("w16", 6, true),
        workSample("w17", 1),
        workSample("w18", 5),
        workSample("w19", 7),
      ],
    },
  ],
};
