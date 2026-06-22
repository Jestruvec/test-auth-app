<script setup lang="ts">
import {
  Button,
  Icon,
  InputOtp,
  ProgressSpinner,
  Banner,
} from "@tpc-development/mare-ui-components";
import { computed, onMounted } from "vue";
import { useOtp } from "@/composables/use-otp";
import { maskEmail } from "@/utils/email-mask";

interface Properties {
  email: string;
  validateOtpFn: (code: string) => Promise<void>;
  resendCodeFn: (email: string) => Promise<void>;
  isOtpError: boolean;
  title?: string;
}

type Emits = (event: "success") => void;

const properties = withDefaults(defineProps<Properties>(), {
  title: "Verify your email",
});
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
          {{ properties.title }}
        </h2>
        <p class="tpc-typography-body-m text-tpc-fg-default">
          Enter the 6-digit code we sent to {{ maskedEmail }}
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
          Validating...
        </div>

        <Banner
          v-if="isOtpError && !hasMaxAttemptsReached"
          severity="danger"
          class="text-tpc-fg-danger"
        >
          <div class="flex gap-4 items-center">
            <Icon icon="IconAlertCircle" class="text-tpc-fg-danger" />
            <p class="tpc-typography-body-xs text-tpc-fg-danger">
              Incorrect code. {{ remainingAttempts }}
              {{ remainingAttempts === 1 ? "attempt" : "attempts" }}
              remaining.
            </p>
          </div>
        </Banner>

        <Banner
          v-if="hasMaxAttemptsReached"
          severity="danger"
          class="text-tpc-fg-danger"
        >
          <div class="flex gap-4 items-center">
            <Icon icon="IconAlertCircle" class="text-tpc-fg-danger" />
            <p class="tpc-typography-body-xs text-tpc-fg-danger">
              Too many attempts. Please request a new code or try again later.
            </p>
          </div>
        </Banner>

        <Banner
          v-if="showResendSuccess"
          severity="positive"
          class="text-tpc-fg-positive"
        >
          <div class="flex gap-4 items-center">
            <Icon icon="IconCircleCheckFilled" class="text-tpc-fg-positive" />
            <p class="tpc-typography-body-xs text-tpc-fg-positive">
              A new code has been sent to your email.
            </p>
          </div>
        </Banner>

        <p
          v-if="otpTimeRemaining === 0 && !isValidatingOtp"
          class="tpc-typography-body-xs text-tpc-fg-danger"
        >
          Code expired
        </p>

        <p
          v-else-if="!isValidatingOtp && !hasMaxAttemptsReached"
          class="tpc-typography-body-m text-tpc-fg-default"
        >
          The code expires in {{ otpTimeFormatted }}
        </p>
      </div>
    </div>

    <div class="flex justify-center">
      <Button
        v-if="canResendCode"
        :label="otpTimeRemaining === 0 ? 'Request a new code' : 'Resend code'"
        link
        @click="resendOtp(properties.email)"
      />
      <p v-else class="tpc-typography-body-m text-tpc-fg-default">
        You can request a new code in {{ resendCooldownFormatted }}
      </p>
    </div>
  </article>
</template>
