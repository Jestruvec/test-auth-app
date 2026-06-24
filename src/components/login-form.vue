<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useStore } from "@nanostores/vue";
import {
  Banner,
  Button,
  FloatLabel,
  FormField,
  InputLabel,
  InputText,
  Message,
} from "@tpc-development/mare-ui-components";
import { loginDataSchema } from "@domain/schemas/login-data.schema";
import { useAuth } from "@/composables/use-auth";
import OtpVerificationStep from "@components/otp-verification-step.vue";
import PalaceIdLogo from "@components/palace-id-logo.vue";
import PasswordField from "@components/password-field.vue";
import type { AuthSession } from "@domain/types/auth-session";
import IconX from "@assets/svg/x.svg";
import IconAlertCircle from "@assets/svg/alert-circle.svg";
import IconCircleCheck from "@assets/svg/circle-check.svg";

import { prefillEmailStore, clearPrefillEmail } from "@/stores/auth.store";

type StepType = "login" | "otp";
const step = ref<StepType>("login");

const prefillEmail = useStore(prefillEmailStore);

const {
  login,
  confirmEmail,
  resendCode,
  isLoading,
  isNotAuthorizedError,
  isUserNotConfirmedError,
  isOtpError,
} = useAuth();

const { handleSubmit, errors, meta } = useForm({
  validationSchema: toTypedSchema(loginDataSchema),
  initialValues: {
    email: "",
    password: "",
  },
  validateOnMount: false,
});

const email = useField<string>("email", undefined, {
  validateOnValueUpdate: false,
});
const password = useField<string>("password");

const showExistingAccountBanner = ref(false);

const isFormValid = computed(
  () =>
    meta.value.valid &&
    email.value.value.trim() !== "" &&
    password.value.value.trim() !== ""
);

const onSubmit = handleSubmit(async (loginData) => {
  const session = await login(loginData);
  handleNativeNavigation(session);
});

const handleNativeNavigation = (session: AuthSession) => {
  console.log("[DEBUG] handleNativeNavigation called");
  console.log("[DEBUG] session:", session);
  console.log("[DEBUG] window.AndroidInterface:", window.AndroidInterface);
  console.log("[DEBUG] window.ReactNativeWebView:", window.ReactNativeWebView);

  if (window.AndroidInterface) {
    console.log("[DEBUG] Using AndroidInterface.goToHome()");
    window.AndroidInterface.goToHome();
  } else if (window.ReactNativeWebView) {
    const messageData = {
      action: "login_success" as const,
      payload: {
        NameId: session.user.userId,
        Email: session.user.email ?? "",
        PhoneNumber: "",
        FirstName: session.user.firstName ?? "",
        LastName: session.user.lastName ?? "",
        Token: session.tokens.accessToken,
        ActiveReservation: "00000000", // TODO: Replace with actual data
        ActiveResort: "TEMP", // TODO: Replace with actual data
        GuestIdentifier: session.user.userId,
        ProfileImage: "",
        ProfileGuestType: "R", // TODO: Replace with actual data
      },
    };
    console.log("[DEBUG] Sending message to ReactNativeWebView:", messageData);
    window.ReactNativeWebView.postMessage(JSON.stringify(messageData));
  } else {
    console.warn("[DEBUG] No native interface detected");
  }
};

const validateOtp = async (code: string) => {
  await confirmEmail(email.value.value, code);
};

const onOtpSuccess = async () => {
  const loginData = {
    email: email.value.value,
    password: password.value.value,
  };

  const session = await login(loginData);
  handleNativeNavigation(session);
};

// Switch to OTP step if user is not confirmed
watch(isUserNotConfirmedError, (isError) => {
  if (!isError) return;

  step.value = "otp";
});

// Load email from store if exists
watch(
  prefillEmail,
  (value) => {
    if (!value) return;

    email.value.value = value;
    showExistingAccountBanner.value = true;
    clearPrefillEmail();
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex flex-col h-full max-w-md mx-auto safe-area-inset">
    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <a href="/" class="w-5 h-5 flex items-center justify-center">
        <img :src="IconX.src" alt="close icon" />
      </a>
    </div>

    <div class="px-8 pb-8 relative flex-1 flex flex-col">
      <Transition name="slide" mode="out-in">
        <!-- Step 1: Login -->
        <article
          v-if="step === 'login'"
          key="login"
          class="pt-8 flex-1 flex flex-col gap-8"
        >
          <PalaceIdLogo />

          <div class="space-y-2 text-center">
            <h2 class="tpc-typography-title-m text-tpc-fg-default">
              Welcome back
            </h2>
            <p class="tpc-typography-body-m text-tpc-fg-default">
              Use your Palace ID to log in. If you are a member, use your Palace
              Elite account.
            </p>
          </div>

          <form
            class="flex flex-col gap-8 flex-1 justify-between"
            @submit.prevent="onSubmit"
          >
            <div class="flex flex-col gap-4">
              <Banner v-if="showExistingAccountBanner" severity="brand">
                <div class="flex gap-4 items-center">
                  <img :src="IconCircleCheck.src" alt="check icon" />

                  <p class="tpc-typography-body-s text-tpc-fg-default">
                    You already have an account. Enter your password to log in.
                  </p>
                </div>
              </Banner>

              <!-- Email -->
              <FormField>
                <FloatLabel>
                  <InputText
                    id="email"
                    v-model="email.value.value"
                    type="email"
                    :invalid="!!email.errorMessage.value"
                    :disabled="isLoading"
                  />
                  <InputLabel label-value="Email" for="Correo electronico" />
                </FloatLabel>
                <Message v-if="errors.email" severity="danger">
                  {{ errors.email }}
                </Message>
              </FormField>

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

              <a
                href="/recovery"
                class="underline tpc-typography-body-s text-tpc-fg-default"
              >
                Forgot your password?
              </a>
            </div>

            <div class="flex flex-col gap-4">
              <Banner
                v-if="isNotAuthorizedError"
                severity="danger"
                class="text-tpc-fg-danger"
              >
                <div class="flex gap-4 items-center">
                  <img :src="IconAlertCircle.src" alt="alert icon" />

                  <p class="tpc-typography-body-s text-tpc-fg-danger">
                    Incorrect email or password.
                  </p>
                </div>
              </Banner>

              <Button
                class="rounded-full"
                type="submit"
                severity="primary"
                size="large"
                label="Log in"
                :loading="isLoading"
                :disabled="!isFormValid"
              />

              <p
                class="tpc-typography-body-s text-tpc-fg-default text-center px-4"
              >
                Don't have an account?
                <a href="/register" class="underline">Sign up</a>
              </p>
            </div>
          </form>
        </article>

        <!-- Step 2: OTP Verification -->
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
</style>
