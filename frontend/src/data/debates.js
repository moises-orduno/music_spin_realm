// Debates redesigned to match VS-style mockup
// type: 'vs' (two contenders), 'binary' (yes/no), 'album-pick' (multi album), 'game'

export const allDebates = [
  {
    id: 1,
    type: "vs",
    badge: "TRENDING",
    badgeColor: "#8b5cf6",
    title: "Who did more for metal?",
    subtitle: "The foundation. The evolution. The legacy.",
    contenders: [
      { name: "Black Sabbath", pct: 42, image: "linear-gradient(135deg, #3a3a3a, #0a0a0a)" },
      { name: "Metallica", pct: 38, image: "linear-gradient(135deg, #2a2a2a, #050505)" },
    ],
    extra: { name: "AC/DC", pct: 20 },
    votes: "2.3K",
    comments: "652",
  },
  {
    id: 2,
    type: "binary",
    badge: "HOT",
    badgeColor: "#ef4444",
    title: "Can you separate art from the artist?",
    subtitle: "Where do you draw the line?",
    options: [
      { label: "Yes", pct: 58 },
      { label: "No", pct: 42 },
    ],
    votes: "8.1K",
    comments: "2.1K",
  },
  {
    id: 3,
    type: "vs",
    badge: "TRENDING",
    badgeColor: "#8b5cf6",
    title: "Beatles vs Beach Boys: who had better harmonies?",
    contenders: [
      { name: "The Beatles", pct: 63, image: "linear-gradient(135deg, #4a4a5a, #1a1a25)" },
      { name: "The Beach Boys", pct: 37, image: "linear-gradient(135deg, #c2a876, #3a2a15)" },
    ],
    votes: "5.4K",
    comments: "1.2K",
  },
  {
    id: 4,
    type: "album-pick",
    badge: "NEW",
    badgeColor: "#10b981",
    title: "Which album has no skips?",
    subtitle: "Name the perfect album.",
    albums: [
      { title: "Dark Side of the Moon", cover: "radial-gradient(circle, #fff, #6ab0d8 28%, #0a1530 60%)" },
      { title: "In Rainbows", cover: "linear-gradient(135deg, #e85a2f, #8a2f14)" },
      { title: "Rumours", cover: "linear-gradient(135deg, #c2a876, #3a2a15)" },
      { title: "Nevermind", cover: "linear-gradient(135deg, #1a5a9c, #0a2f5c)" },
      { title: "OK Computer", cover: "linear-gradient(135deg, #8a8575, #3a3630)" },
    ],
    votes: "3.1K",
    comments: "894",
  },
  {
    id: 5,
    type: "game",
    badge: "FUN & GAMES",
    badgeColor: "#a78bfa",
    title: "Form your band: 90s Edition",
    subtitle: "You have $30. Build the ultimate 90s band.",
    avatars: 6,
    stat: "1.7K lineups created",
    comments: "412",
    cta: "Play Now",
  },
  {
    id: 6,
    type: "binary",
    badge: "CONTROVERSIAL",
    badgeColor: "#f59e0b",
    title: "Is rock dead, or just sleeping?",
    options: [
      { label: "Dead", pct: 32 },
      { label: "Sleeping", pct: 68 },
    ],
    votes: "4.1K",
    comments: "1.1K",
  },
];

export const debateOfTheDay = {
  title: "Velvet Underground & Nico",
  subtitle: "Is this a masterpiece or overrated?",
  cover: "linear-gradient(135deg, #e8d530, #4a4015)",
  votes: "1.9K",
  comments: "745",
};

export const activeNow = [
  { handle: "vinyl_lover92", status: "Commenting", color: "#c2a876" },
  { handle: "indie_head", status: "Voting", color: "#6b3fa0" },
  { handle: "crate_digger", status: "Creating debate", color: "#e85a2f" },
  { handle: "melancholy_mind", status: "Reading", color: "#2a6aac" },
  { handle: "analogkid", status: "Voting", color: "#4a8a5a" },
];

export const popularCategories = [
  { label: "Bands & Artists", icon: "Users" },
  { label: "Albums", icon: "Disc" },
  { label: "Genres", icon: "Music" },
  { label: "Era", icon: "Clock" },
  { label: "Fun & Games", icon: "Gamepad2" },
  { label: "General", icon: "Hash" },
];
