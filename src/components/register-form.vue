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
import MoonPalaceLogo from "@assets/images/moon-palace.png";
import PalaceResortsLogo from "@assets/images/palace-resorts.png";
import BaglioniResortsLogo from "@assets/images/baglioni-resorts.png";
import LeBlancLogo from "@assets/images/le-blanc.png";
import { computed, ref, watch, onUnmounted } from "vue";
import { z } from "zod";

const registerFormSchema = registerDataSchema
  .extend({
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirm"],
  });

const registerSchema = toTypedSchema(registerFormSchema);

const { handleSubmit, errors } = useForm({
  validationSchema: registerSchema,
  initialValues: {
    email: "jondoe@gmail.com",
    password: "Password123!",
    firstName: "Jon",
    lastName: "Doe",
    passwordConfirm: "Password123!",
  },
  validateOnMount: false,
});

type StepType = "email" | "otp" | "password";
const step = ref<StepType>("email");

const otp = ref();
const otpInput = ref();
const isValidatingOtp = ref(false);
const otpError = ref(false);
const otpTimeRemaining = ref(300);
let otpTimerInterval: ReturnType<typeof setInterval> | null = null;

const email = useField<string>("email");
const firstName = useField<string>("firstName");
const lastName = useField<string>("lastName");
const password = useField<string>("password");
const passwordConfirm = useField<string>("passwordConfirm");

const registerProgress = computed(() => {
  if (step.value === "email") return 25;
  if (step.value === "otp") return 50;
  return 75;
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
    return { label: "", color: "" };
  }
  if (completed <= 1) {
    return { label: "Débil", color: "text-tpc-fg-negative" };
  }
  if (completed === 2) {
    return { label: "Media", color: "text-tpc-fg-warning" };
  }
  if (completed === 3) {
    return { label: "Buena", color: "text-tpc-fg-info" };
  }
  return { label: "Fuerte", color: "text-tpc-fg-positive" };
});

const otpTimeFormatted = computed(() => {
  const minutes = Math.floor(otpTimeRemaining.value / 60);
  const seconds = otpTimeRemaining.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

// Start OTP timer when step changes to 'otp'
watch(step, (newStep) => {
  if (newStep === "otp") {
    otpTimeRemaining.value = 300;
    if (otpTimerInterval) {
      clearInterval(otpTimerInterval);
    }
    otpTimerInterval = setInterval(() => {
      if (otpTimeRemaining.value > 0) {
        otpTimeRemaining.value--;
      } else {
        if (otpTimerInterval) {
          clearInterval(otpTimerInterval);
        }
      }
    }, 1000);
  } else if (newStep === "password") {
    // Clear password validation error when entering password step
    password.resetField();
  }

  if (newStep !== "otp" && otpTimerInterval) {
    clearInterval(otpTimerInterval);
  }
});

onUnmounted(() => {
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
  }
});

const onSubmit = handleSubmit((values) => {
  // Remove passwordConfirm before sending to API (it's UI-only)
  //const { passwordConfirm: _, ...registerData } = values;
  //register(registerData);
  console.log(values);
});

const proceedToVerification = async () => {
  // Validate only step 1 fields
  await email.validate();
  await firstName.validate();
  await lastName.validate();

  // Check if any step 1 field has errors
  const hasErrors =
    !!email.errorMessage.value ||
    !!firstName.errorMessage.value ||
    !!lastName.errorMessage.value;

  if (hasErrors) {
    return;
  }

  step.value = "otp";
};

const validateOtp = async () => {
  if (!otp.value?.length || otp.value.length !== 4) {
    return;
  }

  otpError.value = false;
  isValidatingOtp.value = true;

  // Simulate OTP validation with 2 second delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  isValidatingOtp.value = false;

  // 50% chance of failure
  const isValid = Math.random() > 0.1;

  if (!isValid) {
    otpError.value = true;
    otp.value = "";
    return;
  }

  step.value = "password";
};

const resendOtp = () => {
  otp.value = "";
  otpError.value = false;
  otpTimeRemaining.value = 300;

  // Clear and restart timer
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
  }
  otpTimerInterval = setInterval(() => {
    if (otpTimeRemaining.value > 0) {
      otpTimeRemaining.value--;
    } else {
      if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
      }
    }
  }, 1000);
};
</script>

<template>
  <div key="register" class="flex flex-col h-full max-w-md mx-auto">
    <div class="flex justify-between items-center gap-2 px-6 py-2">
      <Icon icon="IconX" />
      <h2 class="tpc-typography-label-m text-tpc-fg-default">Registrarse</h2>
      <div />
    </div>

    <div class="px-8 pb-8 pt-2 relative flex-1 flex flex-col">
      <ProgressBar class="mb-6" mode="determinate" :value="registerProgress" />

      <Transition name="slide" mode="out-in">
        <!-- Step 1: Email & Names -->
        <article
          v-if="step === 'email'"
          key="email"
          class="pt-3 flex-1 flex flex-col"
        >
          <div class="space-y-2 mb-8">
            <h2 class="tpc-typography-title-m text-tpc-fg-default">
              Crea tu Palace ID
            </h2>
            <p class="tpc-typography-body-m text-tpc-fg-default">
              Inicia sesión y administra los servicios de nuestras marcas desde
              la misma cuenta.
            </p>
          </div>

          <div class="flex justify-between mb-8">
            <img
              :src="PalaceResortsLogo.src"
              alt="Palace Resorts Logo"
              class="w-auto h-auto max-w-[22%] object-contain"
            />
            <img
              :src="MoonPalaceLogo.src"
              alt="Moon Palace Logo"
              class="w-auto h-auto max-w-[22%] object-contain"
            />
            <img
              :src="LeBlancLogo.src"
              alt="Le Blanc Logo"
              class="w-auto h-auto max-w-[22%] object-contain"
            />
            <img
              :src="BaglioniResortsLogo.src"
              alt="Baglioni Resorts Logo"
              class="w-auto h-auto max-w-[22%] object-contain"
            />
          </div>

          <div class="mb-8">
            <Divider layout="horizontal" />
          </div>

          <div
            class="flex flex-col gap-4 flex-1 justify-between"
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
                  <InputLabel label-value="email" for="Correo electronico" />
                </FloatLabel>
                <Message v-if="errors.email" severity="neutral">
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
                  <InputLabel label-value="Nombre" for="firstName" />
                </FloatLabel>
                <Message v-if="errors.firstName" severity="neutral">
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
                  <InputLabel label-value="Apellido/s" for="lastName" />
                </FloatLabel>
                <Message v-if="errors.lastName" severity="neutral">
                  {{ errors.lastName }}
                </Message>
              </FormField>
            </div>

            <Button
              class="rounded-full"
              type="button"
              severity="primary"
              size="large"
              @click="proceedToVerification"
            >
              Continuar
            </Button>
          </div>
        </article>

        <!-- Step 2: OTP -->
        <article
          v-else-if="step === 'otp'"
          key="otp"
          class="pt-3 flex-1 flex flex-col justify-between"
        >
          <div>
            <div class="space-y-2 mb-8">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Verifica tu email
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                Ingresa el código de 4 dígitos que enviamos a j***doe@gmail.com
              </p>
            </div>

            <div class="flex flex-col items-center justify-center py-6 gap-6">
              <InputOtp
                ref="otpInput"
                v-model="otp"
                @update:model-value="validateOtp"
              />

              <div
                v-if="isValidatingOtp"
                class="flex items-center gap-2 tpc-typography-body-m text-tpc-fg-default"
              >
                <ProgressSpinner class="mare:w-5 mare:h-5" />
                Validando...
              </div>

              <Banner
                v-if="otpError"
                severity="danger"
                class="text-tpc-fg-danger"
              >
                <div class="flex gap-4 items-center">
                  <Icon icon="IconAlertCircle" class="text-tpc-fg-danger" />
                  <p class="tpc-typography-body-xs text-tpc-fg-danger">
                    Codigo incorrecto. 3 intentos restantes.
                  </p>
                </div>
              </Banner>

              <p class="tpc-typography-body-m text-tpc-fg-default">
                El codigo expira en
                {{ otpTimeFormatted }}
              </p>
            </div>
          </div>

          <div class="flex justify-center">
            <Button label="Reenviar codigo" link @click="resendOtp" />
          </div>
        </article>

        <!-- Step 3: Password -->
        <article
          v-else-if="step === 'password'"
          key="password"
          class="pt-3 flex-1 flex flex-col justify-between"
        >
          <div class="flex flex-col">
            <div class="space-y-2 mb-8">
              <h2 class="tpc-typography-title-m text-tpc-fg-default">
                Crea tu contraseña
              </h2>
              <p class="tpc-typography-body-m text-tpc-fg-default">
                Define una contraseña segura para mantener tu cuenta segura.
              </p>
            </div>

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

            <div
              class="rounded-tpc-container-s bg-tpc-bg-alternative mt-3 p-4 flex flex-col justify-between mb-8"
            >
              <div>
                <div class="flex justify-between items-center">
                  <p class="tpc-typography-label-s text-tpc-fg-default">
                    Elige una contraseña
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
                  class="mb-6"
                  mode="determinate"
                  :value="passwordProgress"
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
                  <span>Al menos 8 caracteres</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.hasUppercase
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>Una letra mayúscula</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.hasNumber
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>Un número</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Icon
                    :icon="
                      passwordValidations.hasSpecialChar
                        ? 'IconCircleCheckFilled'
                        : 'IconCircleCheck'
                    "
                  />
                  <span>Un carácter especial</span>
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
                severity="neutral"
              >
                {{ passwordConfirm.errorMessage.value }}
              </Message>
            </FormField>
          </div>

          <div class="flex flex-col gap-5">
            <p class="tpc-typography-body-s text-tpc-fg-default text-center">
              Al crear un ID de Palace, aceptas nuestros Términos de uso y
              Política de privacidad
            </p>
            <Button
              class="rounded-full"
              severity="primary"
              size="large"
              @click="onSubmit"
            >
              Crear mi Palace ID
            </Button>
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
</style>
