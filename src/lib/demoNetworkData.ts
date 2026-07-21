// Fake profile + connections in the exact shape fetchWidgetData resolves to
// -- fed straight into the real widget engine via NetworkWidget's demoData
// prop. The signed-out marketing page has no live embed_key or Supabase row
// to fetch, so this stands in for it.

// Simple UI wireframes for work samples -- actual mockups of screens (a
// landing page, a mobile app, a dashboard, etc.), not abstract shapes, as
// flat SVGs (data URIs, so no network dependency). One (the messaging app,
// SAMPLES[7]) genuinely animates via native SVG <animate> -- a small
// pulsing "typing…" indicator -- so it's a real (if tiny) moving image, not
// just a static frame wearing a ".gif" label.
function placeholder(bg: string, shapes: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='360'><rect width='480' height='360' fill='${bg}'/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// A few grid-shaped wireframes (calendar, chart bars) are built from repeated
// cells -- generated here instead of hand-typed to avoid transcription
// errors across dozens of near-identical <rect> tags.
function calendarWireframe(accent: string): string {
  const cells: string[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 20 + col * 62;
      const y = 55 + row * 62;
      cells.push(`<rect x='${x}' y='${y}' width='54' height='54' rx='8' fill='${accent}' opacity='0.14'/>`);
    }
  }
  const events: Array<[number, number]> = [
    [0, 1],
    [1, 3],
    [2, 5],
  ];
  events.forEach(([row, col]) => {
    const x = 20 + col * 62 + 6;
    const y = 55 + row * 62 + 38;
    cells.push(`<rect x='${x}' y='${y}' width='42' height='10' rx='4' fill='${accent}'/>`);
  });
  return cells.join("");
}

function barChart(accent: string): string {
  const heights = [60, 90, 130, 75, 110];
  const opacities = [0.35, 0.55, 1, 0.45, 0.7];
  return heights
    .map((h, i) => {
      const x = 100 + i * 40;
      const y = 320 - h;
      return `<rect x='${x}' y='${y}' width='24' height='${h}' fill='${accent}' opacity='${opacities[i]}'/>`;
    })
    .join("");
}

const SAMPLES = [
  // 0: landing page wireframe
  placeholder(
    "#EAF2FF",
    "<rect x='20' y='20' width='440' height='30' rx='8' fill='#FFFFFF'/><circle cx='40' cy='35' r='5' fill='#3B5BDB'/><circle cx='58' cy='35' r='5' fill='#8FA8F0'/><circle cx='76' cy='35' r='5' fill='#C7D3F7'/>" +
      "<rect x='20' y='66' width='60' height='16' rx='4' fill='#3B5BDB'/><rect x='300' y='70' width='40' height='8' rx='4' fill='#8FA8F0'/><rect x='350' y='70' width='40' height='8' rx='4' fill='#8FA8F0'/><rect x='400' y='70' width='60' height='8' rx='4' fill='#8FA8F0'/>" +
      "<rect x='20' y='100' width='440' height='150' rx='12' fill='#3B5BDB' opacity='0.15'/>" +
      "<rect x='20' y='265' width='220' height='20' rx='6' fill='#1c1c1a' opacity='0.85'/><rect x='20' y='295' width='160' height='10' rx='4' fill='#8a8a8a'/><rect x='20' y='320' width='90' height='24' rx='12' fill='#3B5BDB'/>",
  ),
  // 1: mobile app screen wireframe
  placeholder(
    "#FDEDE7",
    "<rect x='150' y='20' width='180' height='320' rx='24' fill='#FFFFFF' stroke='#E8785A' stroke-width='3'/>" +
      "<rect x='170' y='40' width='140' height='18' rx='6' fill='#E8785A'/><circle cx='300' cy='49' r='7' fill='#F5B5A2'/>" +
      "<rect x='170' y='75' width='140' height='70' rx='10' fill='#E8785A' opacity='0.18'/><rect x='170' y='150' width='90' height='8' rx='4' fill='#E8785A' opacity='0.5'/><rect x='170' y='163' width='60' height='8' rx='4' fill='#E8785A' opacity='0.3'/>" +
      "<rect x='170' y='185' width='140' height='70' rx='10' fill='#E8785A' opacity='0.18'/><rect x='170' y='260' width='90' height='8' rx='4' fill='#E8785A' opacity='0.5'/><rect x='170' y='273' width='60' height='8' rx='4' fill='#E8785A' opacity='0.3'/>",
  ),
  // 2: dashboard wireframe (sidebar + stat cards + bar chart)
  placeholder(
    "#F1EBFB",
    "<rect x='20' y='20' width='60' height='320' rx='10' fill='#7C4DFF' opacity='0.15'/><rect x='35' y='40' width='30' height='30' rx='8' fill='#7C4DFF'/><rect x='35' y='85' width='30' height='8' rx='4' fill='#7C4DFF' opacity='0.4'/><rect x='35' y='105' width='30' height='8' rx='4' fill='#7C4DFF' opacity='0.4'/><rect x='35' y='125' width='30' height='8' rx='4' fill='#7C4DFF' opacity='0.4'/>" +
      "<rect x='100' y='20' width='120' height='60' rx='10' fill='#FFFFFF'/><rect x='115' y='35' width='60' height='10' rx='4' fill='#7C4DFF'/><rect x='115' y='55' width='40' height='16' rx='4' fill='#7C4DFF' opacity='0.3'/>" +
      "<rect x='235' y='20' width='120' height='60' rx='10' fill='#FFFFFF'/><rect x='250' y='35' width='60' height='10' rx='4' fill='#7C4DFF'/><rect x='250' y='55' width='40' height='16' rx='4' fill='#7C4DFF' opacity='0.3'/>" +
      "<rect x='370' y='20' width='90' height='60' rx='10' fill='#FFFFFF'/><rect x='385' y='35' width='40' height='10' rx='4' fill='#7C4DFF'/><rect x='385' y='55' width='30' height='16' rx='4' fill='#7C4DFF' opacity='0.3'/>" +
      barChart("#7C4DFF"),
  ),
  // 3: e-commerce product grid wireframe
  placeholder(
    "#EAF6EE",
    "<rect x='20' y='20' width='440' height='28' rx='14' fill='#FFFFFF'/><circle cx='40' cy='34' r='6' fill='#2FA35C' opacity='0.5'/><rect x='55' y='29' width='150' height='10' rx='5' fill='#2FA35C' opacity='0.25'/>" +
      "<rect x='20' y='66' width='210' height='120' rx='10' fill='#FFFFFF'/><rect x='32' y='78' width='186' height='75' rx='8' fill='#2FA35C' opacity='0.2'/><rect x='32' y='160' width='80' height='9' rx='4' fill='#1c1c1a' opacity='0.5'/><rect x='32' y='175' width='40' height='9' rx='4' fill='#2FA35C'/>" +
      "<rect x='250' y='66' width='210' height='120' rx='10' fill='#FFFFFF'/><rect x='262' y='78' width='186' height='75' rx='8' fill='#2FA35C' opacity='0.2'/><rect x='262' y='160' width='80' height='9' rx='4' fill='#1c1c1a' opacity='0.5'/><rect x='262' y='175' width='40' height='9' rx='4' fill='#2FA35C'/>" +
      "<rect x='20' y='200' width='210' height='120' rx='10' fill='#FFFFFF'/><rect x='32' y='212' width='186' height='75' rx='8' fill='#2FA35C' opacity='0.2'/><rect x='32' y='294' width='80' height='9' rx='4' fill='#1c1c1a' opacity='0.5'/><rect x='32' y='309' width='40' height='9' rx='4' fill='#2FA35C'/>" +
      "<rect x='250' y='200' width='210' height='120' rx='10' fill='#FFFFFF'/><rect x='262' y='212' width='186' height='75' rx='8' fill='#2FA35C' opacity='0.2'/><rect x='262' y='294' width='80' height='9' rx='4' fill='#1c1c1a' opacity='0.5'/><rect x='262' y='309' width='40' height='9' rx='4' fill='#2FA35C'/>",
  ),
  // 4: blog/article wireframe
  placeholder(
    "#FBF2DC",
    "<rect x='30' y='30' width='300' height='26' rx='6' fill='#1c1c1a' opacity='0.85'/><rect x='30' y='66' width='140' height='10' rx='4' fill='#C98A1F'/>" +
      "<rect x='30' y='100' width='260' height='9' rx='4' fill='#8a8a8a'/><rect x='30' y='118' width='260' height='9' rx='4' fill='#8a8a8a'/><rect x='30' y='136' width='180' height='9' rx='4' fill='#8a8a8a'/>" +
      "<rect x='30' y='165' width='6' height='60' fill='#C98A1F'/><rect x='46' y='170' width='230' height='9' rx='4' fill='#C98A1F' opacity='0.7'/><rect x='46' y='188' width='190' height='9' rx='4' fill='#C98A1F' opacity='0.7'/>" +
      "<rect x='330' y='30' width='120' height='170' rx='10' fill='#C98A1F' opacity='0.25'/>",
  ),
  // 5: settings/form wireframe
  placeholder(
    "#FCEAF1",
    "<rect x='40' y='40' width='90' height='9' rx='4' fill='#1c1c1a' opacity='0.6'/><rect x='40' y='58' width='300' height='30' rx='8' fill='#FFFFFF' stroke='#D6437E' stroke-width='2'/>" +
      "<rect x='40' y='110' width='90' height='9' rx='4' fill='#1c1c1a' opacity='0.6'/><rect x='40' y='128' width='300' height='30' rx='8' fill='#FFFFFF' stroke='#D6437E' stroke-width='2'/>" +
      "<rect x='40' y='180' width='90' height='9' rx='4' fill='#1c1c1a' opacity='0.6'/><rect x='40' y='198' width='300' height='30' rx='8' fill='#FFFFFF' stroke='#D6437E' stroke-width='2'/>" +
      "<rect x='40' y='250' width='60' height='26' rx='13' fill='#D6437E' opacity='0.3'/><circle cx='86' cy='263' r='10' fill='#D6437E'/>" +
      "<rect x='40' y='300' width='110' height='34' rx='17' fill='#D6437E'/>",
  ),
  // 6: calendar/scheduling wireframe
  placeholder("#E7F5F2", calendarWireframe("#1F9C8F")),
  // 7: messaging app wireframe -- the one with real animation (pulsing
  // "typing…" dots via SVG <animate>), tagged with the #a.gif fragment
  // wherever it's used below so the widget shows its "GIF" badge.
  placeholder(
    "#2B2B2B",
    "<rect x='30' y='30' width='220' height='40' rx='16' fill='#454545'/><rect x='46' y='45' width='150' height='10' rx='5' fill='#8a8a8a'/>" +
      "<rect x='230' y='85' width='220' height='40' rx='16' fill='#4FD1C5' opacity='0.85'/><rect x='246' y='100' width='150' height='10' rx='5' fill='#173330'/>" +
      "<rect x='30' y='140' width='180' height='40' rx='16' fill='#454545'/><rect x='46' y='155' width='110' height='10' rx='5' fill='#8a8a8a'/>" +
      "<rect x='30' y='195' width='90' height='40' rx='16' fill='#454545'/>" +
      "<circle cx='55' cy='215' r='6' fill='#8a8a8a'><animate attributeName='opacity' values='0.3;1;0.3' dur='1.2s' begin='0s' repeatCount='indefinite'/></circle>" +
      "<circle cx='75' cy='215' r='6' fill='#8a8a8a'><animate attributeName='opacity' values='0.3;1;0.3' dur='1.2s' begin='0.2s' repeatCount='indefinite'/></circle>" +
      "<circle cx='95' cy='215' r='6' fill='#8a8a8a'><animate attributeName='opacity' values='0.3;1;0.3' dur='1.2s' begin='0.4s' repeatCount='indefinite'/></circle>" +
      "<rect x='30' y='300' width='380' height='36' rx='18' fill='#3a3a3a'/><circle cx='430' cy='318' r='18' fill='#4FD1C5'/>",
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
      workSamples: [workSample("w6", 5), workSample("w7", 6), workSample("w8", 2), workSample("w9", 0)],
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
        workSample("w16", 7, true),
        workSample("w17", 0),
        workSample("w18", 4),
        workSample("w19", 2),
      ],
    },
  ],
};
