<script setup lang="ts">
import { computed, onMounted } from "vue";

import {
  Button,
  InputOtp,
  ProgressSpinner,
  Banner,
} from "@tpc-development/mare-ui-components";

import { useOtp } from "@/composables/use-otp";
import IconAlertCircle from "@assets/svg/alert-circle.svg";
import IconCircleCheckFilled from "@assets/svg/circle-check-filled.svg";
import type { ui } from "@/i18n/ui";

import { maskEmail } from "@/utils/email-mask";

interface Properties {
  email: string;
  validateOtpFn: (code: string) => Promise<void>;
  resendCodeFn: (email: string) => Promise<void>;
  isOtpError: boolean;
  t: (typeof ui)[keyof typeof ui]["otp"];
}

type Emits = (event: "success") => void;

const properties = defineProps<Properties>();
const emit = defineEmits<Emits>();

const {
  otp,
  isValidatingOtp,
  hasMaxAttemptsReached,
  remainingAttempts,
  otpTimeRemaining,
  otpTimeFormatted,
  resendCooldownFormatted,
  canResendCode,
  showResendSuccess,
  startOtpTimer,
  incrementAttempts,
  resendOtp,
} = useOtp({ resendCodeFn: properties.resendCodeFn });

const maskedEmail = computed(() => maskEmail(properties.email));

const validateOtp = async () => {
  if (!otp.value?.length || otp.value.length !== 6) {
    return;
  }

  if (hasMaxAttemptsReached.value) {
    return;
  }

  isValidatingOtp.value = true;

  try {
    await properties.validateOtpFn(otp.value);
    emit("success");
  } catch (error) {
    console.log(error);
    incrementAttempts();
  } finally {
    isValidatingOtp.value = false;
  }
};

// Start timer when component is mounted
onMounted(startOtpTimer);
</script>

<template>
  <article class="pt-8 flex-1 flex flex-col justify-between">
    <div>
      <div class="space-y-2 mb-8 text-center px-4">
        <h2 class="tpc-typography-title-m text-tpc-fg-default">
          {{ properties.t.title }}
        </h2>
        <p
          class="tpc-typography-body-m text-tpc-fg-default"
          style="text-wrap: balance"
        >
          {{ properties.t.description.replace("{email}", maskedEmail) }}
        </p>
      </div>

      <div class="flex flex-col items-center justify-center py-6 gap-6">
        <InputOtp
          v-model="otp"
          integer-only
          :length="6"
          :disabled="hasMaxAttemptsReached"
          @update:model-value="validateOtp"
        />

        <div
          v-if="isValidatingOtp"
          class="flex items-center gap-2 tpc-typography-body-m text-tpc-fg-default"
        >
          <ProgressSpinner
            class="mare:w-5 mare:h-5"
            style="
              color: var(--color-fg-accent);
              stroke: var(--color-fg-accent);
            "
          />
          {{ properties.t.validating }}
        </div>

        <Transition name="fade">
          <Banner
            v-if="isOtpError && !hasMaxAttemptsReached"
            severity="danger"
            class="text-tpc-fg-danger"
          >
            <div class="flex gap-4 items-center">
              <img :src="IconAlertCircle.src" alt="alert icon" />
              <p class="tpc-typography-body-xs text-tpc-fg-danger">
                {{
                  properties.t.errorIncorrect.replace(
                    "{count}",
                    String(remainingAttempts)
                  )
                }}
              </p>
            </div>
          </Banner>
        </Transition>

        <Transition name="fade">
          <Banner
            v-if="hasMaxAttemptsReached"
            severity="danger"
            class="text-tpc-fg-danger"
          >
            <div class="flex gap-4 items-center">
              <img :src="IconAlertCircle.src" alt="alert icon" />
              <p class="tpc-typography-body-xs text-tpc-fg-danger">
                {{ properties.t.errorTooMany }}
              </p>
            </div>
          </Banner>
        </Transition>

        <Transition name="fade">
          <Banner
            v-if="showResendSuccess"
            severity="positive"
            class="text-tpc-fg-positive"
          >
            <div class="flex gap-4 items-center">
              <img
                :src="IconCircleCheckFilled.src"
                alt="alert icon"
                class="h-5 w-5"
              />

              <p class="tpc-typography-body-xs text-tpc-fg-positive">
                {{ properties.t.successResent }}
              </p>
            </div>
          </Banner>
        </Transition>

        <p
          v-if="otpTimeRemaining === 0 && !isValidatingOtp"
          class="tpc-typography-body-xs text-tpc-fg-danger"
        >
          {{ properties.t.codeExpired }}
        </p>

        <p
          v-else-if="!isValidatingOtp && !hasMaxAttemptsReached"
          class="tpc-typography-body-m text-tpc-fg-default"
        >
          {{ properties.t.expiresIn.replace("{time}", otpTimeFormatted) }}
        </p>
      </div>
    </div>

    <div class="flex justify-center">
      <Button
        v-if="canResendCode"
        :label="
          otpTimeRemaining === 0
            ? properties.t.requestNewButton
            : properties.t.resendButton
        "
        link
        @click="resendOtp(properties.email)"
      />
      <p v-else class="tpc-typography-body-m text-tpc-fg-default">
        {{
          properties.t.resendCooldown.replace("{time}", resendCooldownFormatted)
        }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
