<script setup>
defineProps({ name: String });
const paths = {
  search: "m21 21-5-5 M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16",
  bag: "M5 7h14l1 14H4L5 7 M8 8V6a4 4 0 0 1 8 0v2",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8",
  user: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2 M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
  close: "m6 6 12 12 M6 18 18 6",
  check: "m4 12 5 5L20 6",
  truck:
    "M1 4h14v13H1z M15 9h4l4 5v3h-8 M7 19a2 2 0 1 0-4 0 2 2 0 0 0 4 0 M21 19a2 2 0 1 0-4 0 2 2 0 0 0 4 0",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
};
</script>
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.bag" />
  </svg>
</template>
