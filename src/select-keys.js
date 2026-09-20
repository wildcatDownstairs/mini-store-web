// Keep keyboard highlight separate from the committed value until Enter/Space/Tab.
export function optionIndex(options, index, key, search = "") {
  const last = options.length - 1;
  if (last < 0) return -1;
  if (key === "ArrowDown") return Math.min(last, index + 1);
  if (key === "ArrowUp") return Math.max(0, index - 1);
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (search) {
    for (let offset = 1; offset <= options.length; offset++) {
      const next = (index + offset + options.length) % options.length;
      if (
        options[next].label
          .toLocaleLowerCase()
          .startsWith(search.toLocaleLowerCase())
      )
        return next;
    }
  }
  return index;
}
