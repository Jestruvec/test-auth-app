<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  Button,
  FloatLabel,
  Icon,
  InputLabel,
  InputText,
  FormField,
  Message,
  Banner,
  Password,
} from "@tpc-development/mare-ui-components";
import { recoveryDataSchema } from "@/domain/schemas/recovery-data.schema";
import { useAuth } from "@/composables/use-auth.ts";
import { computed, ref, watch } from "vue";
import { usePasswordValidation } from "@/composables/use-password-validation";
import PasswordStrengthIndicator from "./password-strength-indicator.vue";
import OtpVerificationStep from "./otp-verification-step.vue";
import IconCheckCircleFilled from "@assets/svg/circle-check-filled.svg";

type StepType = "email" | "password" | "otp" | "complete";
const step = ref<StepType>("email");

const {
  resetPassword,
  resendCode,
  confirmResetPassword,
  isLoading,
  isOtpError,
  isInvalidParameterError,
} = useAuth();

const { errors } = useForm({
  validationSchema: toTypedSchema(recoveryDataSchema),
  initialValues: {
    email: "",
    password: "",
    passwordConfirm: "",
  },
  validateOnMount: false,
});

const email = useField<string>("email");
const password = useField<string>("password");
const passwordConfirm = useField<string>("passwordConfirm");

const { passwordValidations, passwordProgress, passwordStrength } =
  usePasswordValidation(password.value);

const isStep1Valid = computed(() => {
  return !email.errorMessage.value && email.value.value.length > 0;
});
const isStep2Valid = computed(() => {
  return !password.errorMessage.value && !passwordConfirm.errorMessage.value;
});

const proceedToPassword = async () => {
  await email.validate();

  if (!isStep1Valid.value) {
    return;
  }

  await resetPassword(email.value.value);
  step.value = "password";
};

const proceedToOtp = async () => {
  await password.validate();
  await passwordConfirm.validate();

  if (!isStep2Valid.value) {
    return;
  }

  step.value = "otp";
};

const validateOtp = async (code: string) => {
  await confirmResetPassword(email.value.value, code, password.value.value);
  step.value = "complete";
};

const goToLogin = () => {
  window.location.assign("/login");
};

watch(step, (newStep) => {
  if (newStep === "password") {
    password.resetField();
  }
});
</script>

<template>
  <div key="recovery" class="flex flex-col h-full max-w-md mx-auto">
    <div
      v-if="step !== 'complete'"
      class="flex justify-between items-center gap-2 h-14 px-6 py-2"
    >
      <a href="/login" class="w-5 h-5 flex items-center justify-center">
        <Icon icon="IconX" />
      </a>
      <h2 class="tpc-typography-label-m bg text-tpc-fg-default">
        Password recovery
      </h2>
      <div />
    </div>

    <div class="px-8 pb-8 flex-1 flex flex-col">
      <Transition name="slide" mode="out-in">
        <!-- Step 1: Email -->
        <article
          v-if="step === 'email'"
          class="flex-1 flex flex-col justify-between"
        >
          <div />

          <div class="flex flex-col gap-8">
            <div class="space-y-2 text-center">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Forgot your password?
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                Enter the email associated with your Palace ID and we will send
                you a code to reset it.
              </p>
            </div>

            <FormField>
              <FloatLabel>
                <InputText
                  id="email"
                  v-model="email.value.value"
                  :invalid="!!email.errorMessage.value"
                />
                <InputLabel label-value="Email address" for="email" />
              </FloatLabel>
              <Message v-if="errors.email" severity="danger">
                {{ errors.email }}
              </Message>
            </FormField>
          </div>

          <div class="flex flex-col gap-4">
            <Banner
              v-if="isInvalidParameterError"
              severity="danger"
              class="text-tpc-fg-danger"
            >
              <div class="flex gap-4 items-center">
                <Icon icon="IconAlertCircle" class="text-tpc-fg-danger" />
                <p class="tpc-typography-body-xs text-tpc-fg-danger">
                  Cannot reset password for the user as there is no
                  registered/verified email.
                </p>
              </div>
            </Banner>

            <Button
              class="rounded-full"
              severity="primary"
              size="large"
              label="Send code"
              :disabled="!isStep1Valid"
              :loading="isLoading"
              @click="proceedToPassword"
            />
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
          title="Enter the code"
        />

        <article
          v-else-if="step === 'complete'"
          class="flex-1 flex flex-col justify-between"
        >
          <div />

          <div
            class="text-center flex flex-col gap-2 justify-center items-center"
          >
            <img :src="IconCheckCircleFilled.src" alt="Icon Check" />
            <h2 class="tpc-typography-title-m text-tpc-fg-default">
              Password reset
            </h2>
            <p class="tpc-typography-body-m text-tpc-fg-default">
              Your password has been updated successfully. You can now log in
              with your new password.
            </p>
          </div>

          <Button
            class="rounded-full"
            severity="primary"
            size="large"
            label="Log in"
            @click="goToLogin"
          />
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
