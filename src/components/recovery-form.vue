<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useUrlSearchParams } from "@vueuse/core";

import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { navigate } from "astro:transitions/client";

import {
  Banner,
  Button,
  FloatLabel,
  FormField,
  InputLabel,
  InputText,
  Message,
} from "@tpc-development/mare-ui-components";

import { recoveryDataSchema } from "@domain/schemas/recovery-data.schema";

import { useAuth } from "@/composables/use-auth";
import { usePasswordValidation } from "@/composables/use-password-validation";

import PasswordStrengthIndicator from "@components/password-strength-indicator.vue";
import PasswordField from "@components/password-field.vue";

import IconCheckCircleFilled from "@assets/svg/circle-check-filled.svg";
import IconX from "@assets/svg/x.svg";
import IconArrowLeft from "@assets/svg/arrow-left.svg";
import IconAlertCircle from "@assets/svg/alert-circle.svg";
import IconEmailSent from "@assets/svg/email-sent.svg";

import { maskEmail } from "@/utils/email-mask";

// Si el usuario llega desde el link del correo (/recovery?email=&code=),
// arrancamos directo en el paso de nueva contraseña con email+code precargados.
// No reenviamos código: el del link sigue vigente (Cognito lo valida al guardar).
const parameters = useUrlSearchParams("history");
const linkEmail = typeof parameters.email === "string" ? parameters.email : "";
const linkCode = typeof parameters.code === "string" ? parameters.code : "";
const cameFromLink = ref(Boolean(linkEmail && linkCode));

type StepType = "email" | "email-sent" | "password" | "complete";
const step = ref<StepType>(cameFromLink.value ? "password" : "email");

const {
  resetPassword,
  confirmResetPassword,
  isLoading,
  isInvalidParameterError,
} = useAuth();

const { errors } = useForm({
  validationSchema: toTypedSchema(recoveryDataSchema),
  initialValues: {
    email: linkEmail,
    password: "",
    passwordConfirm: "",
  },
  validateOnMount: false,
});

const email = useField<string>("email", undefined, {
  validateOnValueUpdate: false,
});
const password = useField<string>("password", undefined, {
  validateOnValueUpdate: false,
});
const passwordConfirm = useField<string>("passwordConfirm");
const code = ref(linkCode);

const { passwordValidations, passwordProgress, passwordStrength } =
  usePasswordValidation(password.value);

const isStep1Valid = computed(() => {
  return email.meta.valid;
});
const isStep2Valid = computed(() => {
  return password.meta.valid && passwordConfirm.meta.valid;
});

const maskedEmail = computed(() => maskEmail(email.value.value));

const proceedToEmailSent = async () => {
  if (!isStep1Valid.value) {
    return;
  }

  await resetPassword(email.value.value);
  step.value = "email-sent";
};

const handlePasswordResetConfirmation = async () => {
  await confirmResetPassword(
    email.value.value,
    code.value,
    password.value.value
  );
  step.value = "complete";
};

const goToLogin = async () => {
  await navigate("/login");
};

const handleBack = async () => {
  switch (step.value) {
    case "email": {
      await navigate("/login");
      break;
    }
    case "email-sent": {
      step.value = "email";
      break;
    }
    case "password": {
      step.value = "email-sent";
      break;
    }
  }
};

watch(step, (newStep) => {
  if (newStep === "password") {
    password.resetField();
  }
});

// El code/email del link no deben quedar en el historial ni en logs del browser:
// ya los tenemos en refs, así que limpiamos la URL apenas montamos.
onMounted(() => {
  if (cameFromLink.value) {
    window.history.replaceState({}, "", window.location.pathname);
  }
});
</script>

<template>
  <div
    key="recovery"
    class="flex flex-col h-full max-w-md mx-auto safe-area-inset"
  >
    <div
      v-if="step !== 'complete'"
      class="flex justify-between items-center gap-2 h-14 px-6 py-2"
    >
      <button
        type="button"
        class="w-5 h-5 flex items-center justify-center"
        @click="handleBack"
      >
        <img
          :src="step === 'email' ? IconX.src : IconArrowLeft.src"
          alt="close icon"
        />
      </button>

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
                  type="email"
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
                <img :src="IconAlertCircle.src" alt="alert icon" />
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
              @click="proceedToEmailSent"
            />
          </div>
        </article>

        <!-- Step 2: Email Sent -->
        <article
          v-else-if="step === 'email-sent'"
          class="flex-1 flex flex-col justify-between"
        >
          <div />

          <div class="flex flex-col gap-8 items-center">
            <img :src="IconEmailSent.src" alt="Email Image" />

            <div class="space-y-2 text-center">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Check your email
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                If an account associated with {{ maskedEmail }} exists, you will
                receive an email with a link to reset your password.
              </p>
            </div>

            <div />
          </div>

          <Button
            class="rounded-full"
            severity="secondary"
            size="large"
            label="Open email App"
          />
        </article>

        <!-- Step 3: Password -->
        <article
          v-else-if="step === 'password'"
          key="password"
          class="pt-8 flex-1 flex gap-8 flex-col justify-between"
        >
          <div class="flex-1 flex flex-col justify-center">
            <div class="space-y-2 mb-8 text-center">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Set your new password
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                Set your new password, which you have not used before.
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

          <Button
            class="rounded-full"
            severity="primary"
            size="large"
            label="Save new password"
            :loading="isLoading"
            :disabled="!isStep2Valid"
            @click="handlePasswordResetConfirmation"
          />
        </article>

        <!-- Step 4: Complete -->
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
