/**
 * Drop compressed files using these names, then refresh.
 * Camera originals go in /originals (gitignored), not here.
 *
 * Images: WebP, ~1200–1600px wide
 * Videos: short muted loops, ~720p, a few MB — or a CDN URL below
 */
export const invitationMedia = {
  cover: {
    image: "/media/images/cover.webp",
    video: "/media/videos/cover.mp4",
  },
  couple: {
    background: "/media/images/couple-bg.webp",
    bride: "/media/images/bride.webp",
    groom: "/media/images/groom.webp",
  },
  verse: {
    background: "/media/images/verse.webp",
  },
  parents: {
    background: "/media/images/parents.webp",
  },
  countdown: {
    background: "/media/images/countdown.webp",
  },
  bride: {
    background: "/media/images/bride-detail.webp",
  },
  groom: {
    background: "/media/images/groom-detail.webp",
  },
  story: {
    background: "/media/images/story.webp",
  },
  party: {
    background: "/media/images/party.webp",
    portraits: [
      "/media/images/party-01.webp",
      "/media/images/party-02.webp",
      "/media/images/party-03.webp",
      "/media/images/party-04.webp",
    ],
  },
  events: {
    background: "/media/images/events.webp",
  },
  location: {
    background: "/media/images/location.webp",
  },
  rundown: {
    background: "/media/images/rundown.webp",
  },
  dressCode: {
    background: "/media/images/dress-code.webp",
  },
  stay: {
    background: "/media/images/stay.webp",
  },
  liveStream: {
    background: "/media/images/live-stream.webp",
  },
  instagram: {
    background: "/media/images/instagram.webp",
  },
  rsvp: {
    background: "/media/images/rsvp.webp",
  },
  gallery: [
    "/media/images/gallery-01.webp",
    "/media/images/gallery-02.webp",
    "/media/images/gallery-03.webp",
    "/media/images/gallery-04.webp",
  ],
  gift: {
    background: "/media/images/gift.webp",
  },
  faq: {
    background: "/media/images/faq.webp",
  },
  comments: {
    background: "/media/images/comments.webp",
  },
  closing: {
    image: "/media/images/closing.webp",
    video: "/media/videos/closing.mp4",
  },
} as const;
