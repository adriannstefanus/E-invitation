import { invitationMedia } from "@/data/media";
import {
  INVITE_SECTIONS,
  type InviteMedia,
  type InviteSectionId,
  type SiteSettings,
} from "@/lib/site-settings";

export type InviteBackdrop = {
  image: string;
  video: string;
};

export type InviteVisuals = {
  coverImage: string;
  coverVideo: string;
  closingImage: string;
  closingVideo: string;
  bride: string;
  groom: string;
  gallery: string[];
  party: string[];
  backdrops: Record<InviteSectionId, InviteBackdrop>;
};

export const SECTION_BACKDROP_IDS = INVITE_SECTIONS.map((section) => section.id).filter(
  (id) => id !== "qr",
);

const BUNDLED_BACKDROPS: Record<InviteSectionId, InviteBackdrop> = {
  qr: { image: invitationMedia.cover.image, video: "" },
  couple: { image: invitationMedia.couple.background, video: "" },
  verse: { image: invitationMedia.verse.background, video: "" },
  parents: { image: invitationMedia.parents.background, video: "" },
  countdown: { image: invitationMedia.countdown.background, video: "" },
  bride: { image: invitationMedia.bride.background, video: "" },
  groom: { image: invitationMedia.groom.background, video: "" },
  loveStory: { image: invitationMedia.story.background, video: "" },
  weddingParty: { image: invitationMedia.party.background, video: "" },
  events: { image: invitationMedia.events.background, video: "" },
  location: { image: invitationMedia.location.background, video: "" },
  rundown: { image: invitationMedia.rundown.background, video: "" },
  dressCode: { image: invitationMedia.dressCode.background, video: "" },
  stay: { image: invitationMedia.stay.background, video: "" },
  liveStream: { image: invitationMedia.liveStream.background, video: "" },
  instagram: { image: invitationMedia.instagram.background, video: "" },
  rsvp: { image: invitationMedia.rsvp.background, video: "" },
  gallery: { image: "", video: "" },
  gifts: { image: invitationMedia.gift.background, video: "" },
  faq: { image: invitationMedia.faq.background, video: "" },
  comments: { image: invitationMedia.comments.background, video: "" },
  closing: {
    image: invitationMedia.closing.image,
    video: invitationMedia.closing.video,
  },
};

export function uploadedBackdrop(
  media: InviteMedia,
  id: InviteSectionId,
): InviteBackdrop {
  const uploaded = media.backdrops[id];
  if (id === "closing") {
    return {
      image: uploaded?.image || media.closingImage,
      video: uploaded?.video || media.closingVideo,
    };
  }
  return {
    image: uploaded?.image ?? "",
    video: uploaded?.video ?? "",
  };
}

export function inviteVisuals(settings: SiteSettings): InviteVisuals {
  const media = settings.media;
  const coverImage = media.coverImage || invitationMedia.cover.image;
  const coverVideo = media.coverVideo || invitationMedia.cover.video;
  const closingImage =
    media.backdrops.closing?.image ||
    media.closingImage ||
    invitationMedia.closing.image;
  const closingVideo =
    media.backdrops.closing?.video ||
    media.closingVideo ||
    invitationMedia.closing.video;

  const backdrops = Object.fromEntries(
    INVITE_SECTIONS.map((section) => {
      const id = section.id;
      const bundled = BUNDLED_BACKDROPS[id];
      const uploaded = media.backdrops[id];
      if (id === "qr") {
        return [id, { image: coverImage, video: "" }];
      }
      if (id === "closing") {
        return [id, { image: closingImage, video: closingVideo }];
      }
      return [
        id,
        {
          image: uploaded?.image || bundled.image,
          video: uploaded?.video || bundled.video,
        },
      ];
    }),
  ) as Record<InviteSectionId, InviteBackdrop>;

  return {
    coverImage,
    coverVideo,
    closingImage,
    closingVideo,
    bride: media.bride || invitationMedia.couple.bride,
    groom: media.groom || invitationMedia.couple.groom,
    gallery:
      media.gallery.length > 0 ? media.gallery : [...invitationMedia.gallery],
    party: settings.copy.weddingParty.map(
      (_, index) =>
        media.party[index] || invitationMedia.party.portraits[index] || "",
    ),
    backdrops,
  };
}
