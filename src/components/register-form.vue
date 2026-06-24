<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import {
  Button,
  Dialog,
  Divider,
  FloatLabel,
  FormField,
  InputLabel,
  InputText,
  Message,
} from "@tpc-development/mare-ui-components";

import { registerDataSchema } from "@domain/schemas/register-data.schema";

import { useAuth } from "@/composables/use-auth";
import { usePasswordValidation } from "@/composables/use-password-validation";

import OtpVerificationStep from "@components/otp-verification-step.vue";
import PasswordStrengthIndicator from "@components/password-strength-indicator.vue";
import PasswordField from "@components/password-field.vue";

import BaglioniLogoSm from "@assets/svg/logos-sm/baglioni-resorts.svg";
import LeBlancLogoSm from "@assets/svg/logos-sm/le-blanc.svg";
import PalaceEliteLogoSm from "@assets/svg/logos-sm/palace-elite.svg";
import PalaceResortsLogoSm from "@assets/svg/logos-sm/palace-resorts.svg";
import IconX from "@assets/svg/x.svg";
import IconKey from "@assets/svg/key.svg";
import IconCalendar from "@assets/svg/calendar-check.svg";
import IconShieldLock from "@assets/svg/shield-lock.svg";
import IconUserCircle from "@assets/svg/user-circle.svg";

import { navigate } from "astro:transitions/client";

import { setPrefillEmail } from "@/stores/auth.store";
import PalaceIdLogo from "@components/palace-id-logo.vue";

type StepType = "email" | "password" | "otp";
const step = ref<StepType>("email");

const { errors } = useForm({
  validationSchema: toTypedSchema(registerDataSchema),
  initialValues: {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    passwordConfirm: "",
  },
  validateOnMount: false,
});

const {
  register,
  confirmEmail,
  resendCode,
  isLoading,
  isOtpError,
  isUsernameExistsError,
  checkEmailAvailability,
} = useAuth();

const email = useField<string>("email", undefined, {
  validateOnValueUpdate: false,
});
const firstName = useField<string>("firstName", undefined, {
  validateOnValueUpdate: false,
});
const lastName = useField<string>("lastName", undefined, {
  validateOnValueUpdate: false,
});
const password = useField<string>("password", undefined, {
  validateOnValueUpdate: false,
});
const passwordConfirm = useField<string>("passwordConfirm");

const { passwordValidations, passwordProgress, passwordStrength } =
  usePasswordValidation(password.value);

const showConfirmationDialog = ref(false);
const showPalaceIdDialog = ref(false);

const brands = [
  { logo: PalaceResortsLogoSm, name: "Palace Resorts" },
  { logo: LeBlancLogoSm, name: "Le Blanc" },
  { logo: BaglioniLogoSm, name: "Baglioni" },
  { logo: PalaceEliteLogoSm, name: "Palace Elite" },
];

const palaceIdFeatures = [
  {
    label: "Universal Access",
    description: "Access and manage all our services from a single account.",
    icon: IconKey,
  },
  {
    label: "Your profile, everywhere",
    description: "Preferences and favorites always with you",
    icon: IconUserCircle,
  },
  {
    label: "All your stays in one place",
    description: "Past, current, and future reservations",
    icon: IconCalendar,
  },
  {
    label: "Secure and private",
    description: "Your data is protected and never shared.",
    icon: IconShieldLock,
  },
];

const isStep1Valid = computed(() => {
  return (
    email.meta.valid &&
    firstName.meta.valid &&
    lastName.meta.valid &&
    email.value.value.trim() !== "" &&
    firstName.value.value.trim() !== "" &&
    lastName.value.value.trim() !== ""
  );
});

const isStep2Valid = computed(() => {
  return password.meta.valid && passwordConfirm.meta.valid;
});

const hasFormData = computed(() => {
  return (
    email.value.value.length > 0 ||
    firstName.value.value.length > 0 ||
    lastName.value.value.length > 0 ||
    password.value.value.length > 0 ||
    passwordConfirm.value.value.length > 0
  );
});

const proceedToPassword = async () => {
  if (!isStep1Valid.value) {
    return;
  }

  const result = await checkEmailAvailability(email.value.value);

  if (!result || result.available) {
    step.value = "password";
    return;
  }
};

const proceedToOtp = async () => {
  if (!isStep2Valid.value) {
    return;
  }

  const registerData = {
    email: email.value.value,
    firstName: firstName.value.value,
    lastName: lastName.value.value,
    password: password.value.value,
  };

  await register(registerData);
  step.value = "otp";
};

const validateOtp = async (code: string) => {
  await confirmEmail(email.value.value, code);
};

const onOtpSuccess = () => {
  window.PalaceApp.emit("registration-complete");
};

const handleCloseClick = async () => {
  if (hasFormData.value) {
    showConfirmationDialog.value = true;
  } else {
    await navigate("/");
  }
};

const confirmCancel = async () => {
  await navigate("/");
};

// Redirect to login if email already exists
watch(isUsernameExistsError, async (isError) => {
  if (!isError) return;

  setPrefillEmail(email.value.value);
  await navigate("/login");
});

// Reset password field when navigating to password step
watch(step, (newStep) => {
  if (newStep === "password") {
    password.resetField();
  }
});
</script>

<template>
  <div
    key="register"
    class="flex flex-col h-full max-w-md mx-auto safe-area-inset"
  >
    <Dialog
      v-model:visible="showConfirmationDialog"
      size="small"
      :closable="false"
    >
      <div class="flex flex-col gap-8 pt-8">
        <div class="space-y-3 text-center">
          <p class="tpc-typography-title-s text-tpc-fg-default">
            Cancel Sign Up?
          </p>
          <p class="tpc-typography-body-m text-tpc-fg-default text-center">
            Your progress will be lost. You will have to start over if you exit.
          </p>
        </div>

        <div class="flex flex-col gap-3 pt-2">
          <Button
            severity="danger"
            size="large"
            label="Cancel and exit"
            class="rounded-full"
            @click="confirmCancel"
          />
          <Button
            severity="secondary"
            size="large"
            label="Continue"
            class="rounded-full"
            @click="showConfirmationDialog = false"
          />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="showPalaceIdDialog" size="small" :closable="false">
      <div class="flex flex-col gap-8 pb-2 pt-12">
        <PalaceIdLogo />

        <div class="space-y-3 text-center" style="text-wrap: balance">
          <p class="tpc-typography-title-s text-tpc-fg-default">
            What is Palace ID?
          </p>
          <p class="tpc-typography-body-m text-tpc-fg-default">
            Palace ID allows you to log in and manage services across all our
            brands using a single account.
          </p>
        </div>

        <div class="flex flex-col">
          <div
            v-for="(feature, index) in palaceIdFeatures"
            :key="index"
            class="flex gap-4 py-3 h-18"
          >
            <div
              class="bg-tpc-bg-accent-weak rounded-full h-12 w-12 flex justify-center items-center"
            >
              <img :src="feature.icon.src" :alt="`${feature.label} icon`" />
            </div>
            <div class="flex-1 flex flex-col">
              <p class="tpc-typography-label-m text-tpc-fg-default">
                {{ feature.label }}
              </p>
              <p class="tpc-typography-body-s text-tpc-fg-weak">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>

        <Button
          class="rounded-full"
          type="submit"
          severity="secondary"
          size="large"
          label="Understood"
          @click="showPalaceIdDialog = false"
        />
      </div>
    </Dialog>

    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <button
        type="button"
        class="w-5 h-5 flex items-center justify-center"
        @click="handleCloseClick"
      >
        <img :src="IconX.src" alt="close icon" />
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
              <button class="underline" @click="showPalaceIdDialog = true">
                Palace ID
              </button>
              allows you to log in and manage the services of all our brands
              from the same account.
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
                    type="email"
                    :invalid="!!email.errorMessage.value"
                  />
                  <InputLabel label-value="Email" for="email" />
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
                  <InputLabel label-value="First name" for="firstName" />
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
              label="Continue"
              :disabled="!isStep1Valid"
              :loading="isLoading"
              @click="proceedToPassword"
            />
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
          class="pt-8 flex-1 flex flex-col gap-8 justify-between"
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
                <PasswordField
                  id="password"
                  v-model="password.value.value"
                  :disabled="isLoading"
                  :invalid="!!password.errorMessage.value"
                />

                <InputLabel label-value="Contraseña" for="password" />
              </FloatLabel>
            </FormField>

            <PasswordStrengthIndicator
              :validations="passwordValidations"
              :progress="passwordProgress"
              :strength="passwordStrength"
            />

            <!-- Password Confirmation -->
            <FormField>
              <FloatLabel>
                <PasswordField
                  id="password-confirm"
                  v-model="passwordConfirm.value.value"
                  :disabled="isLoading"
                  :invalid="!!passwordConfirm.errorMessage.value"
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
        <OtpVerificationStep
          v-else-if="step === 'otp'"
          key="otp"
          :email="email.value.value"
          :validate-otp-fn="validateOtp"
          :resend-code-fn="resendCode"
          :is-otp-error="isOtpError"
          @success="onOtpSuccess"
        />
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
