<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  Button,
  FloatLabel,
  Icon,
  InputLabel,
  InputText,
  Divider,
  FormField,
  Message,
  Password,
  Dialog,
} from "@tpc-development/mare-ui-components";
import { registerDataSchema } from "@/domain/schemas/register-data.schema";
import { computed, ref, watch } from "vue";
import PalaceIdLogo from "./palace-id-logo.vue";
import BaglioniLogoSm from "@assets/svg/logos-sm/baglioni-resorts.svg";
import PalaceEliteLogoSm from "@assets/svg/logos-sm/palace-elite.svg";
import LeBlancLogoSm from "@assets/svg/logos-sm/le-blanc.svg";
import PalaceResortsLogoSm from "@assets/svg/logos-sm/palace-resorts.svg";
import { useAuth } from "@/composables/use-auth.ts";
import { useSessionStorage } from "@vueuse/core";
import { usePasswordValidation } from "@/composables/use-password-validation";
import PasswordStrengthIndicator from "./password-strength-indicator.vue";
import OtpVerificationStep from "./otp-verification-step.vue";

type StepType = "email" | "password" | "otp";
const step = ref<StepType>("email");

const prefillEmail = useSessionStorage<string | null>("prefill-email", null);

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
} = useAuth();

const email = useField<string>("email");
const firstName = useField<string>("firstName");
const lastName = useField<string>("lastName");
const password = useField<string>("password");
const passwordConfirm = useField<string>("passwordConfirm");

const { passwordValidations, passwordProgress, passwordStrength } =
  usePasswordValidation(password.value);

const showModal = ref(false);

const brands = [
  { logo: PalaceResortsLogoSm, name: "Palace Resorts" },
  { logo: LeBlancLogoSm, name: "Le Blanc" },
  { logo: BaglioniLogoSm, name: "Baglioni" },
  { logo: PalaceEliteLogoSm, name: "Palace Elite" },
];

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
  } catch {
    // Error handling is done in the watch(errorState) above
  }
};

const validateOtp = async (code: string) => {
  await confirmEmail(email.value.value, code);
};

const onOtpSuccess = () => {
  window.PalaceApp.emit("registration-complete");
};

const handleCloseClick = () => {
  if (hasFormData.value) {
    showModal.value = true;
  } else {
    window.location.assign("/");
  }
};

const confirmCancel = () => {
  window.location.assign("/");
};

// Redirect to login if email already exists
watch(isUsernameExistsError, (isError) => {
  if (!isError) return;

  prefillEmail.value = email.value.value;
  window.location.assign("/login");
});

// Reset password field when navigating to password step
watch(step, (newStep) => {
  if (newStep === "password") {
    password.resetField();
  }
});
</script>

<template>
  <div key="register" class="flex flex-col h-full max-w-md mx-auto">
    <Dialog v-model:visible="showModal" size="small" :closable="false">
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
            @click="showModal = false"
          />
        </div>
      </div>
    </Dialog>

    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <button
        type="button"
        class="w-5 h-5 flex items-center justify-center"
        @click="handleCloseClick"
      >
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

            <PasswordStrengthIndicator
              :validations="passwordValidations"
              :progress="passwordProgress"
              :strength="passwordStrength"
            />

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
