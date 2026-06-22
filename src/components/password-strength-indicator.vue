<script setup lang="ts">
import {
  Icon,
  ProgressBar,
} from "@tpc-development/mare-ui-components";

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

interface Props {
  validations: PasswordValidations;
  progress: number;
  strength: PasswordStrength;
}

defineProps<Props>();
</script>

<template>
  <div
    class="rounded-tpc-container-s bg-tpc-bg-alternative mt-3 p-4 flex flex-col justify-between mb-6"
  >
    <div>
      <div class="flex justify-between items-center">
        <p class="tpc-typography-label-s text-tpc-fg-default">
          Choose a password
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
        <Icon
          :icon="
            validations.minLength
              ? 'IconCircleCheckFilled'
              : 'IconCircleCheck'
          "
        />
        <span>At least 8 characters</span>
      </div>
      <div class="flex gap-2 items-center">
        <Icon
          :icon="
            validations.hasUppercase
              ? 'IconCircleCheckFilled'
              : 'IconCircleCheck'
          "
        />
        <span>One uppercase letter</span>
      </div>
      <div class="flex gap-2 items-center">
        <Icon
          :icon="
            validations.hasNumber
              ? 'IconCircleCheckFilled'
              : 'IconCircleCheck'
          "
        />
        <span>One number</span>
      </div>
      <div class="flex gap-2 items-center">
        <Icon
          :icon="
            validations.hasSpecialChar
              ? 'IconCircleCheckFilled'
              : 'IconCircleCheck'
          "
        />
        <span>One special character</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-strength-bar :deep(.mare\:bg-tpc-bg-accent) {
  background-color: var(--password-strength-color) !important;
}
</style>
