import { useEffect } from "react";

const SUFFIX = " | BLV Play";

/** Sets a unique <title> and meta description for the current page. */
export function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title.includes("BLV Play") ? title : title + SUFFIX;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);
}
