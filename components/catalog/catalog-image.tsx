"use client";
import { useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { BrandMark } from "@/components/site/brand-mark";

export function CatalogImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [originalOnly, setOriginalOnly] = useState(false);
  const [failed, setFailed] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // An SSR image can fail before hydration attaches its error listener.
    if (image.current?.complete && image.current.naturalWidth === 0) {
      if (props.srcSet && !originalOnly) setOriginalOnly(true);
      else setFailed(true);
    }
  }, [originalOnly, props.srcSet]);
  if (failed)
    return (
      <span className="catalog-image-placeholder">
        <BrandMark />
        <span>Image unavailable</span>
      </span>
    );
  return (
    <img
      {...props}
      ref={image}
      srcSet={originalOnly ? undefined : props.srcSet}
      onError={() => {
        if (props.srcSet && !originalOnly) setOriginalOnly(true);
        else setFailed(true);
      }}
    />
  );
}
