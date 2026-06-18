<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  Button,
  FloatLabel,
  Icon,
  InputLabel,
  InputText,
  ProgressBar,
  Divider,
  FormField,
  Message,
  InputOtp,
  ProgressSpinner,
  Password,
  Banner,
} from "@tpc-development/mare-ui-components";
import { registerDataSchema } from "@/domain/schemas/register-data.schema";
import { computed, ref, watch } from "vue";
import { z } from "zod";
import PalaceIdLogo from "./palace-id-logo.vue";
import BaglioniLogoSm from "@assets/svg/logos-sm/baglioni-resorts.svg";
import PalaceEliteLogoSm from "@assets/svg/logos-sm/palace-elite.svg";
import LeBlancLogoSm from "@assets/svg/logos-sm/le-blanc.svg";
import PalaceResortsLogoSm from "@assets/svg/logos-sm/palace-resorts.svg";
import { useAuth } from "@/composables/use-auth.ts";
import { useSessionStorage, useIntervalFn, useTimeoutFn } from "@vueuse/core";

const brands = [
  { logo: PalaceResortsLogoSm, name: "Palace Resorts" },
  { logo: LeBlancLogoSm, name: "Le Blanc" },
  { logo: BaglioniLogoSm, name: "Baglioni" },
  { logo: PalaceEliteLogoSm, name: "Palace Elite" },
];

const registerFormSchema = registerDataSchema
  .extend({
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirm"],
  });

const registerSchema = toTypedSchema(registerFormSchema);

const { errors } = useForm({
  validationSchema: registerSchema,
  initialValues: {
    email: "jondoe@test.com",
    password: "Password123!",
    firstName: "Jon",
    lastName: "Doe",
    passwordConfirm: "Password123!",
  },
  validateOnMount: false,
});

const { register, confirmEmail, resendCode, isLoading } = useAuth();

type StepType = "email" | "password" | "otp";
const step = ref<StepType>("email");

const prefillEmail = useSessionStorage<string | null>("prefill-email", null);
const otpEmail = useSessionStorage<string | null>("otp-email", null);

const MAX_OTP_ATTEMPTS = 3;
const OTP_EXPIRY_TIME = 300;
const RESEND_COOLDOWN_TIME = 60; // 1 minuto de espera

const otp = ref();
const otpInput = ref();
const isValidatingOtp = ref(false);
const otpError = ref(false);
const otpAttempts = ref(0);
const otpTimeRemaining = ref(OTP_EXPIRY_TIME);
const resendCooldown = ref(0);
const showResendSuccess = ref(false);

// OTP timer interval
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

// Resend cooldown interval
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

const email = useField<string>("email");
const firstName = useField<string>("firstName");
const lastName = useField<string>("lastName");
const password = useField<string>("password");
const passwordConfirm = useField<string>("passwordConfirm");

const isStep1Valid = computed(() => {
  return (
    !email.errorMessage.value &&
    !firstName.errorMessage.value &&
    !lastName.errorMessage.value &&
    email.value.value.length > 0 &&
    firstName.value.value.length > 0 &&
    lastName.value.value.length > 0
  );
});

const isStep2Valid = computed(() => {
  return !password.errorMessage.value && !passwordConfirm.errorMessage.value;
});

const passwordValidations = computed(() => {
  const pwd = password.value.value;
  return {
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };
});

const passwordProgress = computed(() => {
  const validations = Object.values(passwordValidations.value);
  const completed = validations.filter(Boolean).length;
  return (completed / validations.length) * 100;
});

const passwordStrength = computed(() => {
  const validations = Object.values(passwordValidations.value);
  const completed = validations.filter(Boolean).length;

  if (completed === 0) {
    return { label: "", color: "", bgColor: "" };
  }
  if (completed <= 1) {
    return {
      label: "Weak",
      color: "text-tpc-fg-danger",
      bgColor: "var(--color-bg-danger)",
    };
  }
  if (completed === 2) {
    return {
      label: "Regular",
      color: "text-tpc-fg-warning",
      bgColor: "var(--color-bg-warning)",
    };
  }
  if (completed === 3) {
    return {
      label: "Regular",
      color: "text-tpc-fg-warning",
      bgColor: "var(--color-bg-warning)",
    };
  }
  return {
    label: "Strong",
    color: "text-tpc-fg-positive",
    bgColor: "var(--color-bg-positive)",
  };
});

const otpTimeFormatted = computed(() => {
  const minutes = Math.floor(otpTimeRemaining.value / 60);
  const seconds = otpTimeRemaining.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const resendCooldownFormatted = computed(() => {
  const minutes = Math.floor(resendCooldown.value / 60);
  const seconds = resendCooldown.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const canResendCode = computed(() => {
  return resendCooldown.value === 0;
});

const maskedEmail = computed(() => {
  const emailValue = email.value.value;
  if (!emailValue) return "";

  const [localPart, domain] = emailValue.split("@");
  if (!domain) return emailValue;

  const visibleChars = Math.min(1, localPart.length);
  const masked = localPart.slice(0, visibleChars) + "***";

  return `${masked}@${domain}`;
});

const hasMaxAttemptsReached = computed(() => {
  return otpAttempts.value >= MAX_OTP_ATTEMPTS;
});

const remainingAttempts = computed(() => {
  return MAX_OTP_ATTEMPTS - otpAttempts.value;
});

const proceedToPassword = async () => {
  await email.validate();
  await firstName.validate();
  await lastName.validate();

  if (!isStep1Valid.value) {
    return;
  }

  step.value = "password";
};

const proceedToOtp = async () => {
  await password.validate();
  await passwordConfirm.validate();

  if (!isStep2Valid.value) {
    return;
  }

  const registerData = {
    email: email.value.value,
    firstName: firstName.value.value,
    lastName: lastName.value.value,
    password: password.value.value,
  };

  try {
    const response = await register(registerData);
    console.log(response);
    step.value = "otp";
  } catch (error: unknown) {
    const authError = error as { code?: string; message?: string };

    if (authError.code === "UsernameExistsException") {
      prefillEmail.value = email.value.value;
      window.location.assign("/login");
    } else {
      console.error(error);
    }
  }
};

const validateOtp = async () => {
  if (!otp.value?.length || otp.value.length !== 6) {
    return;
  }

  // Check if max attempts reached
  if (otpAttempts.value >= MAX_OTP_ATTEMPTS) {
    return;
  }

  otpError.value = false;
  isValidatingOtp.value = true;

  try {
    await confirmEmail(email.value.value, otp.value);
    // Notify parent to show complete screen
    window.PalaceApp.emit("registration-complete");
  } catch (error) {
    console.log(error);

    otpAttempts.value++;
    otpError.value = true;
    otp.value = "";
    return;
  } finally {
    isValidatingOtp.value = false;
  }
};

const resendOtp = async () => {
  if (!canResendCode.value) {
    return;
  }

  otp.value = "";
  otpError.value = false;
  otpAttempts.value = 0;
  otpTimeRemaining.value = OTP_EXPIRY_TIME;

  pauseOtpTimer();

  try {
    await resendCode(email.value.value);
    showResendSuccess.value = true;

    useTimeoutFn(() => {
      showResendSuccess.value = false;
    }, 5000);

    resendCooldown.value = RESEND_COOLDOWN_TIME;
    pauseResendCooldown();
    resumeResendCooldown();
  } catch (error) {
    console.log(error);
  }

  resumeOtpTimer();
};

const closeRegistration = () => {
  if (isLoading.value) {
    return;
  }
  window.location.assign("/");
};

const startOtpTimer = () => {
  otpTimeRemaining.value = OTP_EXPIRY_TIME;
  otpAttempts.value = 0;
  pauseOtpTimer();
  resumeOtpTimer();
};

// Detectar si viene del login con cuenta no confirmada
watch(
  otpEmail,
  (value) => {
    if (!value) return;

    email.value.value = value;
    step.value = "otp";
    startOtpTimer();
    otpEmail.value = null;
  },
  { immediate: true }
);

// Start OTP timer when step changes to 'otp'
watch(step, (newStep) => {
  if (newStep === "otp") {
    startOtpTimer();
  } else if (newStep === "password") {
    // Clear password validation error when entering password step
    password.resetField();
  }

  if (newStep !== "otp") {
    pauseOtpTimer();
  }
});
</script>

<template>
  <div key="register" class="flex flex-col h-full max-w-md mx-auto">
    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <button class="w-5 h-5" @click="closeRegistration">
        <Icon icon="IconX" />
      </button>
      <h2 class="tpc-typography-label-m bg text-tpc-fg-default">Sign up</h2>
      <div />
    </div>

    <div class="px-8 pb-8 relative flex-1 flex flex-col">
      <div class="flex justify-center gap-2 mb-6">
        <div
          class="rounded-full h-1.5 w-17"
          :class="
            step === 'email' ? 'bg-tpc-bg-accent' : 'bg-tpc-bg-neutral-weak'
          "
        />
        <div
          class="rounded-full h-1.5 w-17"
          :class="
            step === 'password' ? 'bg-tpc-bg-accent' : 'bg-tpc-bg-neutral-weak'
          "
        />
        <div
          class="rounded-full h-1.5 w-17"
          :class="
            step === 'otp' ? 'bg-tpc-bg-accent' : 'bg-tpc-bg-neutral-weak'
          "
        />
      </div>

      <Transition name="slide" mode="out-in">
        <!-- Step 1: Email & Names -->
        <article
          v-if="step === 'email'"
          key="email"
          class="pt-8 flex-1 flex flex-col gap-8"
        >
          <PalaceIdLogo />

          <div class="space-y-2 mb-8 text-center">
            <h2 class="tpc-typography-title-m text-tpc-fg-default">
              Create your account
            </h2>
            <p class="tpc-typography-body-m text-tpc-fg-default">
              Palace ID allows you to log in and manage the services of all our
              brands from the same account.
            </p>
          </div>

          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <!-- Email -->
              <FormField>
                <FloatLabel>
                  <InputText
                    id="email"
                    v-model="email.value.value"
                    :invalid="!!email.errorMessage.value"
                  />
                  <InputLabel label-value="Email" for="Correo electronico" />
                </FloatLabel>
                <Message v-if="errors.email" severity="danger">
                  {{ errors.email }}
                </Message>
              </FormField>

              <!-- Name -->
              <FormField>
                <FloatLabel>
                  <InputText
                    id="firstName"
                    v-model="firstName.value.value"
                    :invalid="!!firstName.errorMessage.value"
                  />
                  <InputLabel label-value="Full name" for="firstName" />
                </FloatLabel>
                <Message v-if="errors.firstName" severity="danger">
                  {{ errors.firstName }}
                </Message>
              </FormField>

              <!-- Lastname -->
              <FormField>
                <FloatLabel>
                  <InputText
                    id="lastName"
                    v-model="lastName.value.value"
                    :invalid="!!lastName.errorMessage.value"
                  />
                  <InputLabel label-value="Last name(s)" for="lastName" />
                </FloatLabel>
                <Message v-if="errors.lastName" severity="danger">
                  {{ errors.lastName }}
                </Message>
              </FormField>
            </div>

            <Button
              class="rounded-full"
              severity="primary"
              size="large"
              :disabled="!isStep1Valid"
              @click="proceedToPassword"
            >
              Continue
            </Button>
          </div>

          <Divider layout="horizontal" />

          <div class="flex mx-auto gap-5">
            <div
              v-for="brand in brands"
              :key="brand.name"
              class="flex flex-col items-center text-center gap-2"
            >
              <div class="w-10 h-10 flex items-center justify-center">
                <img :src="brand.logo.src" :alt="`${brand.name} logo`" />
              </div>
              <span class="tpc-typography-body-xs text-tpc-fg-default">
                {{ brand.name }}
              </span>
            </div>
          </div>
        </article>

        <!-- Step 2: Password -->
        <article
          v-else-if="step === 'password'"
          key="password"
          class="pt-8 flex-1 flex flex-col justify-between"
        >
          <div class="flex flex-col">
            <div class="space-y-2 mb-8 text-center">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Create your password
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                Define a secure password to keep your account safe.
              </p>
            </div>

            <!-- Password -->
            <FormField>
              <FloatLabel>
                <Password
                  id="password"
                  v-model="password.value.value"
                  toggle-mask
                  :disabled="isLoading"
                  :invalid="!!password.errorMessage.value"
                  :feedback="false"
                />

                <InputLabel label-value="Contraseña" for="password" />
              </FloatLabel>
            </FormField>

            <div
              class="rounded-tpc-container-s bg-tpc-bg-alternative mt-3 p-4 flex flex-col justify-between mb-6"
            >
              <div>
                <div class="flex justify-between items-center">
                  <p class="tpc-typography-label-s text-tpc-fg-default">
                    Choose a password
                  </p>
                  <p
                    v-if="passwordStrength.label"
                    class="tpc-typography-body-s"
                    :class="passwordStrength.color"
                  >
                    {{ passwordStrength.label }}
                  </p>
                </div>

                <ProgressBar
                  class="mb-6 password-strength-bar"
                  mode="determinate"
                  :value="passwordProgress"
                  :style="{
                    '--password-strength-color': passwordStrength.bgColor,
                  }"
                />
              </div>

              <div
                class="flex flex-col gap-1.5 tpc-typography-body-xs text-tpc-fg-default"
              >
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.minLength
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>At least 8 characters</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.hasUppercase
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>One uppercase letter</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.hasNumber
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>One number</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.hasSpecialChar
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>One special character</span>
                </div>
              </div>
            </div>

            <!-- Password Confirmation -->
            <FormField>
              <FloatLabel>
                <Password
                  id="password-confirm"
                  v-model="passwordConfirm.value.value"
                  toggle-mask
                  :disabled="isLoading"
                  :invalid="!!passwordConfirm.errorMessage.value"
                  :feedback="false"
                />

                <InputLabel
                  label-value="Confirma la contraseña"
                  for="password-confirm"
                />
              </FloatLabel>
              <Message
                v-if="passwordConfirm.errorMessage.value"
                severity="danger"
              >
                {{ passwordConfirm.errorMessage.value }}
              </Message>
            </FormField>
          </div>

          <div class="flex flex-col gap-5">
            <p
              class="tpc-typography-body-s text-tpc-fg-default text-center px-4"
            >
              By creating a Palace ID, you agree to our
              <span class="underline">Terms of Use</span> and
              <span class="underline">Privacy Policy</span>
            </p>
            <Button
              class="rounded-full"
              severity="primary"
              size="large"
              label="Create my palace ID"
              :loading="isLoading"
              :disabled="!isStep2Valid"
              @click="proceedToOtp"
            />
          </div>
        </article>

        <!-- Step 3: OTP -->
        <article
          v-else-if="step === 'otp'"
          key="otp"
          class="pt-8 flex-1 flex flex-col justify-between"
        >
          <div>
            <div class="space-y-2 mb-8 text-center px-4">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Verify your email
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                Enter the 6-digit code we sent to {{ maskedEmail }}
              </p>
            </div>

            <div class="flex flex-col items-center justify-center py-6 gap-6">
              <InputOtp
                ref="otpInput"
                v-model="otp"
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
                v-if="otpError && !hasMaxAttemptsReached"
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
                    Too many attempts. Please request a new code or try again
                    later.
                  </p>
                </div>
              </Banner>

              <Banner
                v-if="showResendSuccess"
                severity="positive"
                class="text-tpc-fg-positive"
              >
                <div class="flex gap-4 items-center">
                  <Icon
                    icon="IconCircleCheckFilled"
                    class="text-tpc-fg-positive"
                  />
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
                v-else-if="!isValidatingOtp"
                class="tpc-typography-body-m text-tpc-fg-default"
              >
                The code expires in
                {{ otpTimeFormatted }}
              </p>
            </div>
          </div>

          <div class="flex justify-center">
            <Button
              v-if="canResendCode"
              :label="
                otpTimeRemaining === 0 ? 'Request a new code' : 'Resend code'
              "
              link
              @click="resendOtp"
            />
            <p v-else class="tpc-typography-body-m text-tpc-fg-default">
              You can request a new code in {{ resendCooldownFormatted }}
            </p>
          </div>
        </article>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.password-strength-bar :deep(.mare\:bg-tpc-bg-accent) {
  background-color: var(--password-strength-color) !important;
}
</style>
