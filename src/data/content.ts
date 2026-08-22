export const personDetails = {
  bride: {
    role: "The bride",
    name: "Bride",
    fullName: "Full name placeholder",
    parents: "Daughter of Mr. & Mrs. Placeholder",
  },
  groom: {
    role: "The groom",
    name: "Groom",
    fullName: "Full name placeholder",
    parents: "Son of Mr. & Mrs. Placeholder",
  },
} as const;

export const verse = {
  label: "A verse",
  text: "Love is patient, love is kind.",
  source: "1 Corinthians 13:4",
} as const;

export const families = {
  bride: {
    title: "The bride's family",
    names: "Mr. & Mrs. Placeholder",
  },
  groom: {
    title: "The groom's family",
    names: "Mr. & Mrs. Placeholder",
  },
} as const;

export const loveStory = [
  {
    year: "2019",
    title: "We met",
    text: "A short story beat goes here.",
  },
  {
    year: "2022",
    title: "We dated",
    text: "A short story beat goes here.",
  },
  {
    year: "2025",
    title: "We said yes",
    text: "A short story beat goes here.",
  },
] as const;

export const weddingParty = [
  { name: "Name", role: "Maid of honor" },
  { name: "Name", role: "Best man" },
  { name: "Name", role: "Bridesmaid" },
  { name: "Name", role: "Groomsman" },
] as const;

export const events = [
  {
    title: "Ceremony",
    time: "TBD",
    place: "Venue placeholder",
    mapsUrl: "https://maps.google.com/?q=Jakarta",
    wazeUrl: "https://waze.com/ul?q=Jakarta",
  },
  {
    title: "Reception",
    time: "TBD",
    place: "Venue placeholder",
    mapsUrl: "https://maps.google.com/?q=Jakarta",
    wazeUrl: "https://waze.com/ul?q=Jakarta",
  },
] as const;

export const rundown = [
  { time: "08:00", title: "Guest arrival" },
  { time: "09:00", title: "Ceremony" },
  { time: "12:00", title: "Photos" },
  { time: "18:00", title: "Reception" },
] as const;

export const dressCode = {
  label: "Formal / batik",
  note: "Please wear these colors.",
  colors: [
    { name: "Ivory", hex: "#f7f1e8" },
    { name: "Champagne", hex: "#d4b896" },
    { name: "Sage", hex: "#8a9a7b" },
    { name: "Espresso", hex: "#3f3a34" },
  ],
} as const;

export const stay = {
  name: "Hotel placeholder",
  detail: "Room block / parking notes go here.",
  mapsUrl: "https://maps.google.com/?q=Jakarta",
} as const;

export const liveStream = {
  label: "Watch with us",
  url: "https://youtube.com",
} as const;

export const instagram = {
  hashtag: "#BrideAndGroom",
  filterUrl: "https://instagram.com",
} as const;

export const faq = [
  {
    question: "May we bring children?",
    answer: "Yes. Add any note here.",
  },
  {
    question: "Is there parking?",
    answer: "Yes. Add any note here.",
  },
  {
    question: "What should we wear?",
    answer: "See the dress code section.",
  },
] as const;

/** Add or remove accounts (2 or 3). */
export const bankAccounts = [
  {
    bank: "BCA",
    holder: "Bride Name",
    number: "0000000000",
  },
  {
    bank: "Mandiri",
    holder: "Groom Name",
    number: "1111111111",
  },
  {
    bank: "BRI",
    holder: "Family Name",
    number: "2222222222",
  },
] as const;
