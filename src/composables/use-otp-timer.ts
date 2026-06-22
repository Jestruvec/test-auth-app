import { ref, computed } from "vue";
import { useIntervalFn } from "@vueuse/core";

const OTP_EXPIRY_TIME = 300;
const RESEND_COOLDOWN_TIME = 60;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const useOtpTimer = () => {
  const otpTimeRemaining = ref(OTP_EXPIRY_TIME);
  const resendCooldown = ref(0);

  const { pause: pauseOtpTimer, resume: resumeOtpTimer } = useIntervalFn(
    () => {
      if (otpTimeRemaining.value > 0) {
        otpTimeRemaining.value--;
      } else {
        pauseOtpTimer();
      }
    },
    1000,
    { immediate: false }
  );

  const { pause: pauseResendCooldown, resume: resumeResendCooldown } =
    useIntervalFn(
      () => {
        if (resendCooldown.value > 0) {
          resendCooldown.value--;
        } else {
          pauseResendCooldown();
        }
      },
      1000,
      { immediate: false }
    );

  const otpTimeFormatted = computed(() => formatTime(otpTimeRemaining.value));
  const resendCooldownFormatted = computed(() =>
    formatTime(resendCooldown.value)
  );
  const canResendCode = computed(() => resendCooldown.value === 0);

  const startOtpTimer = () => {
    otpTimeRemaining.value = OTP_EXPIRY_TIME;
    pauseOtpTimer();
    resumeOtpTimer();
  };

  const resetForResend = () => {
    otpTimeRemaining.value = OTP_EXPIRY_TIME;
    resendCooldown.value = RESEND_COOLDOWN_TIME;
    pauseOtpTimer();
    pauseResendCooldown();
    resumeResendCooldown();
  };

  return {
    otpTimeRemaining,
    resendCooldown,
    otpTimeFormatted,
    resendCooldownFormatted,
    canResendCode,
    startOtpTimer,
    resetForResend,
    resumeOtpTimer,
    pauseOtpTimer,
    pauseResendCooldown,
  };
};
