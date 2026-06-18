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
} from "@tpc-development/mare-ui-components";
import { recoveryDataSchema } from "@/domain/schemas/recovery-data.schema";
import { useAuth } from "@/composables/use-auth.ts";
import { computed } from "vue";

const { errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(recoveryDataSchema),
  initialValues: {
    email: "",
  },
  validateOnMount: false,
});

const { isLoading: _ } = useAuth();

const email = useField<string>("email");

const isValidEmail = computed(() => {
  return !email.errorMessage.value && email.value.value.length > 0;
});

const onSubmit = handleSubmit((values) => {
  console.log(values);
});
</script>

<template>
  <div key="register" class="flex flex-col h-full max-w-md mx-auto">
    <div class="flex justify-between items-center gap-2 h-14 px-6 py-2">
      <a href="/login" class="w-5 h-5 flex items-center justify-center">
        <Icon icon="IconX" />
      </a>
      <h2 class="tpc-typography-label-m bg text-tpc-fg-default">
        Password recovery
      </h2>
      <div />
    </div>

    <form
      class="flex-1 flex flex-col justify-between p-8"
      @submit.prevent="onSubmit"
    >
      <div />

      <div class="flex flex-col gap-8">
        <div class="space-y-2 text-center">
          <h2 class="tpc-typography-title-m text-tpc-fg-default">
            Forgot your password?
          </h2>
          <p class="tpc-typography-body-m text-tpc-fg-default">
            Enter the email associated with your Palace ID and we will send you
            a code to reset it.
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

      <Button
        class="rounded-full"
        severity="primary"
        size="large"
        :disabled="!isValidEmail"
      >
        Send code
      </Button>
    </form>
  </div>
</template>
