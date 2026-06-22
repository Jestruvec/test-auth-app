import { ref, computed } from "vue";

const MAX_OTP_ATTEMPTS = 3;

export const useOtpValidation = () => {
  const otp = ref();
  const isValidatingOtp = ref(false);
  const otpAttempts = ref(0);

  const hasMaxAttemptsReached = computed(
    () => otpAttempts.value >= MAX_OTP_ATTEMPTS
  );
  const remainingAttempts = computed(
    () => MAX_OTP_ATTEMPTS - otpAttempts.value
  );

  const resetOtp = () => {
    otp.value = "";
    otpAttempts.value = 0;
  };

  const incrementAttempts = () => {
    otpAttempts.value++;
    otp.value = "";
  };

  return {
    otp,
    isValidatingOtp,
    otpAttempts,
    hasMaxAttemptsReached,
    remainingAttempts,
    resetOtp,
    incrementAttempts,
    MAX_OTP_ATTEMPTS,
  };
};
