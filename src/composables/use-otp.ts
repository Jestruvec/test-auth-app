import { ref } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import { useOtpTimer } from "./use-otp-timer";
import { useOtpValidation } from "./use-otp-validation";

interface UseOtpOptions {
  resendCodeFn: (email: string) => Promise<void>;
}

export const useOtp = ({ resendCodeFn }: UseOtpOptions) => {
  const showResendSuccess = ref(false);

  const {
    otpTimeRemaining,
    otpTimeFormatted,
    resendCooldownFormatted,
    canResendCode,
    startOtpTimer,
    resetForResend,
    resumeOtpTimer,
    pauseOtpTimer,
  } = useOtpTimer();

  const {
    otp,
    isValidatingOtp,
    hasMaxAttemptsReached,
    remainingAttempts,
    resetOtp,
    incrementAttempts,
  } = useOtpValidation();

  const resendOtp = async (email: string) => {
    if (!canResendCode.value) {
      return;
    }

    resetOtp();
    resetForResend();

    try {
      await resendCodeFn(email);
      showResendSuccess.value = true;

      useTimeoutFn(() => {
        showResendSuccess.value = false;
      }, 5000);
    } catch (error) {
      console.log(error);
    }

    resumeOtpTimer();
  };

  return {
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
    resetOtp,
    incrementAttempts,
    pauseOtpTimer,
    resumeOtpTimer,
    resendOtp,
  };
};
