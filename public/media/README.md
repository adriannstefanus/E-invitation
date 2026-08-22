# Web-ready media

Drop compressed files here using the names in `src/data/media.ts`.
If a file is missing, that slot stays a placeholder.

## Images (`public/media/images/`)

| File                                  | Used on                    |
| ------------------------------------- | -------------------------- |
| `cover.webp`                          | Cover background           |
| `couple-bg.webp`                      | Couple section background  |
| `verse.webp`                          | Verse / quote              |
| `parents.webp`                        | Parents / turut mengundang |
| `bride.webp`                          | Bride portrait             |
| `groom.webp`                          | Groom portrait             |
| `countdown.webp`                      | Countdown background       |
| `bride-detail.webp`                   | Bride detail background    |
| `groom-detail.webp`                   | Groom detail background    |
| `story.webp`                          | Love story                 |
| `party.webp`                          | Wedding party background   |
| `party-01.webp` … `party-04.webp`     | Wedding party portraits    |
| `events.webp`                         | Events background          |
| `location.webp`                       | Maps / location            |
| `rundown.webp`                        | Day rundown                |
| `dress-code.webp`                     | Dress code                 |
| `stay.webp`                           | Stay & travel              |
| `live-stream.webp`                    | Live stream                |
| `instagram.webp`                      | Hashtag / filter           |
| `rsvp.webp`                           | RSVP                       |
| `gallery-01.webp` … `gallery-04.webp` | Gallery tiles              |
| `gift.webp`                           | Angpao / gift background   |
| `faq.webp`                            | FAQ                        |
| `comments.webp`                       | Guest book background      |
| `closing.webp`                        | Closing background         |

Export as WebP, about 1200–1600px on the long edge.

## Videos (`public/media/videos/`)

| File          | Used on                 |
| ------------- | ----------------------- |
| `cover.mp4`   | Cover background loop   |
| `closing.mp4` | Closing background loop |

Keep these short, muted, ~720p, a few MB. Videos in this folder are gitignored; for production a CDN URL in `src/data/media.ts` is better.

Camera originals belong in `/originals`, not here.
