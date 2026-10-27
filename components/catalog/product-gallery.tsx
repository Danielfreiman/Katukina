"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { ProductImage } from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";
import { BrandMark } from "@/components/site/brand-mark";
import { CatalogImage } from "./catalog-image";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[index] ?? images[0];
  const move = (offset: number) =>
    setIndex((value) => (value + offset + images.length) % images.length);
  return (
    <section
      className="product-gallery"
      aria-label="Product gallery"
      onKeyDown={(event) => {
        if (
          images.length > 1 &&
          ["ArrowLeft", "ArrowRight"].includes(event.key)
        ) {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      {current ? (
        <>
          <button
            className="gallery-main"
            aria-label="Enlarge product image"
            onClick={() => {
              setZoomed(true);
              dialog.current?.showModal();
            }}
          >
            <CatalogImage
              key={current.id}
              src={current.src}
              srcSet={current.srcset || undefined}
              sizes="(max-width: 850px) 90vw, 50vw"
              alt={plainText(current.alt) || name}
              width={800}
              height={800}
              fetchPriority="high"
            />
            <span className="gallery-expand">
              <Expand size={18} /> Zoom
            </span>
          </button>
          <div className="gallery-navigation">
            <button
              type="button"
              aria-label="Previous image"
              disabled={images.length < 2}
              onClick={() => move(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span aria-live="polite">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label="Next image"
              disabled={images.length < 2}
              onClick={() => move(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="gallery-thumbnails" aria-label="Image thumbnails">
            {images.map((image, position) => (
              <button
                type="button"
                key={image.id}
                aria-label={`Show image ${position + 1}`}
                aria-pressed={position === index}
                onClick={() => setIndex(position)}
              >
                <CatalogImage
                  src={image.thumbnail || image.src}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <dialog
            ref={dialog}
            className="gallery-dialog"
            aria-label={`${name} enlarged image`}
            onClose={() => setZoomed(false)}
          >
            <button
              type="button"
              className="dialog-close"
              aria-label="Close enlarged image"
              onClick={() => dialog.current?.close()}
            >
              <X size={22} />
            </button>
            {zoomed && (
              <CatalogImage
                key={current.id}
                src={current.src}
                alt={plainText(current.alt) || name}
                width={1200}
                height={1200}
              />
            )}
            <div className="gallery-navigation">
              <button
                type="button"
                aria-label="Previous enlarged image"
                disabled={images.length < 2}
                onClick={() => move(-1)}
              >
                <ChevronLeft />
              </button>
              <span>
                {index + 1} / {images.length}
              </span>
              <button
                type="button"
                aria-label="Next enlarged image"
                disabled={images.length < 2}
                onClick={() => move(1)}
              >
                <ChevronRight />
              </button>
            </div>
          </dialog>
        </>
      ) : (
        <div className="gallery-placeholder">
          <BrandMark />
          <p>Image coming soon</p>
        </div>
      )}
    </section>
  );
}
