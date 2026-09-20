<script setup>
import { ref, onBeforeUnmount, watch, nextTick } from "vue";
import { message, messageType } from "../store";
const dialog = ref(null),
  closing = ref(false),
  error = ref(""),
  errorElement = ref(null);
watch([message, messageType], async () => {
  if (dialog.value?.open && message.value && messageType.value === "error") {
    error.value = message.value;
    await nextTick();
    errorElement.value?.focus();
  }
});
let animation;
function showModal() {
  animation?.cancel();
  closing.value = false;
  error.value = "";
  message.value = "";
  dialog.value.showModal();
}
async function close() {
  if (closing.value || !dialog.value.open) return;
  closing.value = true;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animation = dialog.value.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(6px) scale(.99)" },
      ],
      { duration: 120, easing: "ease-in", fill: "forwards" },
    );
    try {
      await animation.finished;
    } catch {}
  }
  dialog.value?.close();
  animation?.cancel();
  closing.value = false;
}
onBeforeUnmount(() => animation?.cancel());
defineExpose({ showModal, close });
</script>
<template>
  <dialog
    ref="dialog"
    class="motion-dialog"
    :aria-busy="closing"
    @cancel.prevent="close"
  >
    <p
      v-if="error"
      ref="errorElement"
      tabindex="-1"
      role="alert"
      class="form-error"
    >
      {{ error }}
    </p>
    <slot />
  </dialog>
</template>
