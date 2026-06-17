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
} from "@tpc-development/mare-ui-components";
import { loginDataSchema } from "@/domain/schemas/login-data.schema";
import PalaceIdLogo from "./palace-id-logo.vue";
import { computed } from "vue";

const loginSchema = toTypedSchema(loginDataSchema);

const { handleSubmit, errors } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: "jondoe@gmail.com",
    password: "Password123!",
  },
  validateOnMount: false,
});

const email = useField<string>("email");
const password = useField<string>("password");

const isStep1Valid = computed(() => {
  return (
    !email.errorMessage.value &&
    !password.errorMessage.value &&
    email.value.value.length > 0 &&
    password.value.value.length > 0
  );
});

const onSubmit = handleSubmit(async (values) => {
  await email.validate();
  await password.validate();

  console.log(values);
});

const closeLogin = () => {
  window.location.assign("/");
};
</script>

<template>
  <div class="flex flex-col h-full max-w-md mx-auto">
    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <button class="w-5 h-5" @click="closeLogin">
        <Icon icon="IconX" />
      </button>
    </div>

    <div class="px-8 pb-8 relative flex-1 flex flex-col">
      <article class="pt-8 flex-1 flex flex-col gap-8">
        <PalaceIdLogo />

        <div class="space-y-2 mb-8 text-center">
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

            <!-- Password -->
            <FormField>
              <FloatLabel>
                <Password
                  id="password"
                  v-model="password.value.value"
                  toggle-mask
                  :invalid="!!password.errorMessage.value"
                  :feedback="false"
                />

                <InputLabel label-value="Contraseña" for="password" />
              </FloatLabel>
            </FormField>

            <span class="underline tpc-typography-body-s text-tpc-fg-default"
              >Forgot your password?</span
            >
          </div>

          <div class="flex flex-col gap-4">
            <Button
              class="rounded-full"
              type="submit"
              severity="primary"
              size="large"
              label="Log in"
              :disabled="!isStep1Valid"
            />

            <p
              class="tpc-typography-body-s text-tpc-fg-default text-center px-4"
            >
              Don't have an account?
              <span class="underline">Sign up</span>
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
