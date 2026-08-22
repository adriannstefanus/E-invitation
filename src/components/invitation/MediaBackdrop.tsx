"use client";

import Image from "next/image";
import { useState } from "react";

type MediaBackdropProps = {
  image?: string;
  video?: string;
  alt: string;
  priority?: boolean;
};

export function MediaBackdrop({
  image,
  video,
  alt,
  priority = false,
}: MediaBackdropProps) {
  const [imageReady, setImageReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  if (!image && !video) {
    return null;
  }

  return (
    <div className="absolute inset-0">
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes="430px"
          className={`object-cover ${imageReady ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageReady(true)}
          onError={() => setImageReady(false)}
          priority={priority}
        />
      ) : null}
      {video ? (
        <video
          className={`absolute inset-0 h-full w-full object-cover ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          poster={imageReady ? image : undefined}
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
        />
      ) : null}
      {imageReady || videoReady ? (
        <div className="absolute inset-0 bg-background/45" />
      ) : null}
    </div>
  );
}
