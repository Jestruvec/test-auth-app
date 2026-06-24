<script setup lang="ts">
import { Password } from "@tpc-development/mare-ui-components";
import IconEye from "@assets/svg/eye.svg";
import IconEyeOff from "@assets/svg/eye-off.svg";

defineProps<{
  id?: string;
  modelValue?: string;
  disabled?: boolean;
  invalid?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <Password
    :id="id"
    :model-value="modelValue"
    toggle-mask
    :disabled="disabled"
    :invalid="invalid"
    :feedback="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #maskicon="{ toggleCallback }">
      <div
        class="h-full flex items-center absolute top-1/2 -translate-y-1/2 group-has-[input[disabled]]:text-tpc-fg-disabled inset-e-3.5"
        @click="toggleCallback"
      >
        <img :src="IconEyeOff.src" alt="hide password" />
      </div>
    </template>
    <template #unmaskicon="{ toggleCallback }">
      <div
        class="h-full flex items-center absolute top-1/2 -translate-y-1/2 group-has-[input[disabled]]:text-tpc-fg-disabled inset-e-3.5"
        @click="toggleCallback"
      >
        <img :src="IconEye.src" alt="show password" />
      </div>
    </template>
  </Password>
</template>
