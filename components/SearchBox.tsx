"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "./searchbox.css";

export interface SearchItem {
  slug: string;
  title: string;
  variants: string[];
  category: string;
}

const MAX_RESULTS = 7;

export default function SearchBox({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const matched: SearchItem[] = [];
    for (const item of items) {
      if (
        item.title.includes(q) ||
        item.variants.some((v) => v.includes(q))
      ) {
        matched.push(item);
        if (matched.length >= MAX_RESULTS) break;
      }
    }
    return matched;
  }, [query, items]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const showList = open && query.trim().length > 0 && results.length > 0;

  return (
    <div className="searchbox" ref={boxRef}>
      <input
        className="searchbox-input"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="꿈 키워드를 검색해 보세요 (예: 뱀, 이빨, 돈)"
        aria-label="꿈 해몽 검색"
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        aria-controls="searchbox-listbox"
      />
      {showList && (
        <ul
          className="searchbox-list"
          id="searchbox-listbox"
          role="listbox"
          aria-label="검색 결과"
        >
          {results.map((item) => (
            <li key={item.slug} role="option" aria-selected={false}>
              <Link href={`/${item.slug}`} onClick={() => setOpen(false)}>
                <span className="sb-title">{item.title}</span>
                <span className="sb-cat">{item.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
