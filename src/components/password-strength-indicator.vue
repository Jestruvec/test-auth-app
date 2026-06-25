<script setup lang="ts">
import { ProgressBar } from "@tpc-development/mare-ui-components";
import IconCircle from "@assets/svg/circle.svg";
import IconCircleCheckFilled from "@assets/svg/circle-check-filled-blue.svg";
import type { ui } from "@/i18n/ui";

interface PasswordValidations {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordStrength {
  label: string;
  color: string;
  bgColor: string;
}

interface Properties {
  validations: PasswordValidations;
  progress: number;
  strength: PasswordStrength;
  t: (typeof ui)[keyof typeof ui]["passwordStrength"];
}

defineProps<Properties>();
</script>

<template>
  <div
    class="rounded-tpc-container-s bg-tpc-bg-alternative mt-3 p-4 flex flex-col justify-between mb-6"
  >
    <div>
      <div class="flex justify-between items-center">
        <p class="tpc-typography-label-s text-tpc-fg-default">
          {{ t.chooseLabel }}
        </p>
        <p
          v-if="strength.label"
          class="tpc-typography-body-s"
          :class="strength.color"
        >
          {{ strength.label }}
        </p>
      </div>

      <ProgressBar
        class="mb-6 password-strength-bar"
        mode="determinate"
        :value="progress"
        :style="{
          '--password-strength-color': strength.bgColor,
        }"
      />
    </div>

    <div
      class="flex flex-col gap-1.5 tpc-typography-body-xs text-tpc-fg-default"
    >
      <div class="flex gap-2 items-center">
        <img
          :src="
            validations.minLength ? IconCircleCheckFilled.src : IconCircle.src
          "
          alt="circle check"
        />

        <span>{{ t.minLength }}</span>
      </div>
      <div class="flex gap-2 items-center">
        <img
          :src="
            validations.hasUppercase
              ? IconCircleCheckFilled.src
              : IconCircle.src
          "
          alt="circle check"
        />
        <span>{{ t.uppercase }}</span>
      </div>
      <div class="flex gap-2 items-center">
        <img
          :src="
            validations.hasNumber ? IconCircleCheckFilled.src : IconCircle.src
          "
          alt="circle check"
        />
        <span>{{ t.number }}</span>
      </div>
      <div class="flex gap-2 items-center">
        <img
          :src="
            validations.hasSpecialChar
              ? IconCircleCheckFilled.src
              : IconCircle.src
          "
          alt="circle check"
        />
        <span>{{ t.specialChar }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-strength-bar :deep(.mare\:bg-tpc-bg-accent) {
  background-color: var(--password-strength-color) !important;
}
</style>
