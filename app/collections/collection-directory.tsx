"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import styles from "./collections.module.css";

type Entry = { id: number; name: string; slug: string; photo: string; hasBanner: boolean };

function searchText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function CollectionDirectory({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const term = searchText(query);
  const matches = entries.filter(({ name }) => searchText(name).includes(term));

  return (
    <section
      id="all-collections"
      tabIndex={-1}
      className={styles.directory}
      aria-label="All collections"
    >
      <header className={styles.toolbar}>
        <div>
          <h1>Collections</h1>
          <p role="status">
            {matches.length}{" "}
            {matches.length === 1 ? "collection" : "collections"}
          </p>
        </div>
        <div className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <input
            ref={field}
            type="text"
            role="searchbox"
            aria-label="Find a collection"
            placeholder="Find a collection"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear collection search"
              onClick={() => {
                setQuery("");
                field.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>
      {matches.length ? (
        <ul className={styles.list}>
          {matches.map(({ id, slug, name, photo, hasBanner }, index) => (
            <li key={id}>
              <Link href={`/collections/${slug}`}>
                <img
                  src={photo}
                  alt=""
                  className={hasBanner ? undefined : styles.fallbackPhoto}
                  width={hasBanner ? 2880 : undefined}
                  height={hasBanner ? 640 : undefined}
                  loading={index < 4 ? "eager" : "lazy"}
                />
                <span>{name.replace(/^(\S+)\s+(\S+)$/, "$1\n$2")}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No collections match “{query}”. Try another name.
        </p>
      )}
    </section>
  );
}
