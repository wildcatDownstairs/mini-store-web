<script setup>
import {
  computed,
  ref,
  useId,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { optionIndex, filterOptions } from "../select-keys";
import Icon from "./Icon.vue";
const props = defineProps({
  modelValue: [String, Number],
  options: { type: Array, required: true },
  label: { type: String, required: true },
  inline: Boolean,
  hideLabel: Boolean,
  searchable: Boolean,
});
const emit = defineEmits(["update:modelValue"]);
const id = useId(),
  root = ref(null),
  trigger = ref(null),
  list = ref(null),
  open = ref(false),
  active = ref(0),
  above = ref(false),
  maxHeight = ref(280),
  query = ref(""),
  searchInput = ref(null);
const choices = computed(() =>
  filterOptions(props.options, props.searchable ? query.value : ""),
);
const selected = computed(() =>
  props.options.findIndex((o) => o.value === props.modelValue),
);
const text = computed(() => props.options[selected.value]?.label || "请选择");
let search = "",
  lastKey = 0;
function place() {
  const box = trigger.value.getBoundingClientRect(),
    dialog = root.value.closest("dialog")?.getBoundingClientRect();
  const bottom = Math.min(innerHeight, dialog?.bottom ?? innerHeight) - 16,
    top = Math.max(0, dialog?.top ?? 0) + 16;
  const below = bottom - box.bottom,
    up = box.top - top;
  above.value = below < 230 && up > below;
  maxHeight.value = Math.max(72, Math.min(280, (above.value ? up : below) - 8));
}
async function reveal() {
  if (!props.options.length) return;
  place();
  query.value = "";
  active.value = Math.max(0, selected.value);
  open.value = true;
  await nextTick();
  if (props.searchable) searchInput.value?.focus({ preventScroll: true });
  scrollActive();
}
function scrollActive() {
  list.value?.children[active.value]?.scrollIntoView({ block: "nearest" });
}
function choose(index) {
  const option = choices.value[index];
  if (!option) return;
  emit("update:modelValue", option.value);
  open.value = false;
  trigger.value.focus({ preventScroll: true });
}
function onKey(event) {
  const key = event.key;
  if (key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    open.value = false;
    return;
  }
  if (key === "Tab") {
    if (open.value) choose(active.value);
    return;
  }
  if (["Enter", " "].includes(key)) {
    event.preventDefault();
    open.value ? choose(active.value) : reveal();
    return;
  }
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
    event.preventDefault();
    if (!open.value) {
      reveal();
      if (key === "Home" || key === "End")
        active.value = optionIndex(choices.value, active.value, key);
    } else active.value = optionIndex(choices.value, active.value, key);
    nextTick(scrollActive);
    return;
  }
  if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    if (!open.value) reveal();
    const now = Date.now();
    search = now - lastKey < 700 ? search + key : key;
    lastKey = now;
    active.value = optionIndex(choices.value, active.value, "", search);
    nextTick(scrollActive);
  }
}
// 搜索框内空格、Home/End 和 Tab 保留原生编辑行为，方向键选择结果。
function onSearchKey(event) {
  if (event.isComposing) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    open.value = false;
    trigger.value.focus({ preventScroll: true });
  } else if (event.key === "Enter") {
    event.preventDefault();
    choose(active.value);
  } else if (["ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    active.value = optionIndex(choices.value, active.value, event.key);
    nextTick(scrollActive);
  }
}
watch(query, () => {
  active.value = 0;
  nextTick(scrollActive);
});
function outside(e) {
  if (!root.value?.contains(e.target)) open.value = false;
}
watch(
  () => props.modelValue,
  () => {
    active.value = Math.max(0, selected.value);
  },
);
onMounted(() => {
  document.addEventListener("pointerdown", outside);
  window.addEventListener("resize", placeIfOpen);
});
function placeIfOpen() {
  if (open.value) place();
}
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", outside);
  window.removeEventListener("resize", placeIfOpen);
});
</script>
<template>
  <div
    ref="root"
    class="store-select"
    :class="{ 'select-inline': inline, 'is-open': open }"
    @focusout="
      (e) => {
        if (!root.contains(e.relatedTarget)) open = false;
      }
    "
  >
    <label
      :id="id + '-label'"
      :for="id + '-trigger'"
      :class="{ 'visually-hidden': hideLabel }"
      >{{ label }}</label
    >
    <div class="select-anchor">
      <button
        :id="id + '-trigger'"
        ref="trigger"
        type="button"
        role="combobox"
        class="select-trigger"
        :aria-labelledby="id + '-label'"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="id + '-list'"
        :aria-activedescendant="
          open && !searchable && choices.length
            ? id + '-option-' + active
            : undefined
        "
        @click="open ? (open = false) : reveal()"
        @keydown="onKey"
      >
        <span>{{ text }}</span
        ><Icon name="arrow" /></button
      ><Transition name="select-menu">
        <div v-if="open" class="select-popover" :class="{ 'opens-above': above }">
          <div v-if="searchable" class="select-search">
            <input
              ref="searchInput"
              v-model="query"
              type="search"
              :aria-label="'搜索' + label"
              :placeholder="'输入' + label + '名称'"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              :aria-controls="id + '-list'"
              :aria-activedescendant="
                choices.length ? id + '-option-' + active : undefined
              "
              @keydown="onSearchKey"
            />
          </div>
          <p v-if="!choices.length" class="select-no-results" role="status">
            没有匹配的{{ label }}
          </p>
          <ul
            :id="id + '-list'"
            ref="list"
            role="listbox"
            :aria-labelledby="id + '-label'"
            class="select-menu"
            :style="{
              maxHeight: Math.max(72, maxHeight - (searchable ? 64 : 0)) + 'px',
            }"
          >
            <li
              v-for="(option, i) in choices"
              :id="id + '-option-' + i"
              :key="option.value"
              role="option"
              :aria-selected="modelValue === option.value"
              :class="{
                'is-highlighted': active === i,
                'is-selected': modelValue === option.value,
              }"
              @pointermove="active = i"
              @pointerdown.prevent
              @click="choose(i)"
            >
              <span>{{ option.label }}</span>
              <Icon v-if="modelValue === option.value" name="check" />
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </div>
</template>
