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
  Password,
  Banner,
} from "@tpc-development/mare-ui-components";
import { loginDataSchema } from "@/domain/schemas/login-data.schema";
import PalaceIdLogo from "./palace-id-logo.vue";
import { computed, ref, watch } from "vue";
import { useSessionStorage } from "@vueuse/core";
import { useAuth } from "@/composables/use-auth.ts";

const loginSchema = toTypedSchema(loginDataSchema);

const { handleSubmit, errors } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: "",
    password: "",
  },
  validateOnMount: false,
});

const email = useField<string>("email");
const password = useField<string>("password");

// Cargar email de sessionStorage si existe
const prefillEmail = useSessionStorage<string | null>("prefill-email", null);
const showExistingAccountBanner = ref(false);
const showAuthError = ref(false);
const otpEmail = useSessionStorage<string | null>("otp-email", null);

const { login, isLoading } = useAuth();

watch(
  prefillEmail,
  (value) => {
    if (!value) return;

    email.value.value = value;
    showExistingAccountBanner.value = true;
    prefillEmail.value = null;
  },
  { immediate: true }
);

const isStep1Valid = computed(() => {
  return (
    !email.errorMessage.value &&
    !password.errorMessage.value &&
    email.value.value.length > 0 &&
    password.value.value.length > 0
  );
});

const onSubmit = handleSubmit(async (values) => {
  showAuthError.value = false;

  try {
    const response = await login(values);
    console.log(response);
  } catch (error) {
    const authError = error as { code?: string; message?: string };

    if (authError.code === "UserNotConfirmedException") {
      otpEmail.value = email.value.value;
      window.location.assign("/register");
    } else if (authError.code === "NotAuthorizedException") {
      showAuthError.value = true;
    } else {
      console.error(error);
    }
  }
});

</script>

<template>
  <div class="flex flex-col h-full max-w-md mx-auto">
    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <a href="/" class="w-5 h-5 flex items-center justify-center">
        <Icon icon="IconX" />
      </a>
    </div>

    <div class="px-8 pb-8 relative flex-1 flex flex-col">
      <article class="pt-8 flex-1 flex flex-col gap-8">
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
          class="flex flex-col flex-1 justify-between"
          @submit.prevent="onSubmit"
        >
          <div class="flex flex-col gap-4">
            <Banner
              v-if="showExistingAccountBanner"
              icon="IconCheckCircle"
              severity="brand"
            >
              <template #default>
                You already have an account. Enter your password to log in.
              </template>
            </Banner>

            <!-- Email -->
            <FormField>
              <FloatLabel>
                <InputText
                  id="email"
                  v-model="email.value.value"
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

            <a
              href="/recovery"
              class="underline tpc-typography-body-s text-tpc-fg-default"
            >
              Forgot your password?
            </a>
          </div>

          <div class="flex flex-col gap-4">
            <Banner
              v-if="showAuthError"
              severity="danger"
              class="text-tpc-fg-danger"
            >
              <div class="flex gap-4 items-center">
                <Icon icon="IconAlertCircle" class="text-tpc-fg-danger" />
                <p class="tpc-typography-body-xs text-tpc-fg-danger">
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
              :disabled="!isStep1Valid"
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
