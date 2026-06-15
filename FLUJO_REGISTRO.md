# 🔄 Flujo de Registro - Arquitectura DDD

## Estructura de Capas

```
🎨 Presentación (register-form.vue)
    ↓
🔧 Composable (useAuth.ts)
    ↓
🟨 Aplicación (register-use-case.ts)
    ↓
🟦 Dominio (IAuthRepository.ts - Interfaz)
    ↑
🟩 Infraestructura (amplify-auth-repository.ts)
    ↓
☁️  AWS Cognito
```

---

## Paso 1: Usuario llena formulario y presiona "Continuar"

### 🎨 Capa de Presentación

**Archivo:** `src/components/register-form.vue`

```typescript
const { register, confirmEmail, resendCode, isLoading, error } = useAuth()

const proceedToVerification = async () => {
  await email.validate()
  await firstName.validate()
  await lastName.validate()

  if (hasErrors) return

  const result = await register({
    email: "jondoe@gmail.com",
    password: "Password123!",
    firstName: "Jon",
    lastName: "Doe"
  })

  registeredEmail.value = result.email
  step.value = "otp"
}
```

**Responsabilidad:** Captura input del usuario, valida formulario, actualiza UI

---

### 🔧 Composable

**Archivo:** `src/composables/useAuth.ts`

```typescript
const register = async (data: RegisterData) => {
  isLoading.value = true
  error.value = null

  try {
    const result = await registerUseCase.execute(data)
    return result
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}
```

**Responsabilidad:** Maneja estado reactivo (loading, error), abstrae casos de uso para Vue

---

### 🟨 Capa de Aplicación

**Archivo:** `src/application/auth/register-use-case.ts`

```typescript
export function createRegisterUseCase(authRepository: IAuthRepository) {
  return {
    execute: async (data: RegisterData): Promise<{ userId: string; email: string }> =>
      await authRepository.register(data)
  }
}
```

**Responsabilidad:** Orquesta el caso de uso de negocio (registrar usuario)

---

### 🟦 Capa de Dominio (Puerto)

**Archivo:** `src/domain/repositories/IAuthRepository.ts`

```typescript
export interface IAuthRepository {
  register(data: RegisterData): Promise<{ userId: string; email: string }>;
  confirmEmail(email: string, code: string): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
}
```

**Responsabilidad:** Define el contrato (interfaz) que debe cumplir cualquier proveedor de auth

---

### 🟩 Capa de Infraestructura (Adaptador)

**Archivo:** `src/infrastructure/auth/amplify-auth-repository.ts`

```typescript
export const amplifyAuthRepository: IAuthRepository = {
  async register(data: RegisterData) {
    try {
      const { userId } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            given_name: data.firstName,
            family_name: data.lastName,
          }
        }
      })

      return { userId: userId ?? "", email: data.email }
    } catch (error) {
      throw handleAmplifyError(error)
    }
  }
}
```

**Responsabilidad:** Implementa el contrato usando Amplify, traduce errores de Cognito

---

### ☁️ AWS Cognito

**Acciones:**
1. Crea usuario en User Pool
2. Genera código OTP de 6 dígitos
3. Envía email con código
4. Retorna `userId`

---

## Paso 2: Usuario ingresa código OTP

### 🎨 Capa de Presentación

```typescript
const validateOtp = async () => {
  if (!otp.value || otp.value.length !== 4) return

  isValidatingOtp.value = true
  otpError.value = false

  try {
    await confirmEmail(registeredEmail.value, otp.value)
    step.value = "password"
  } catch {
    otpError.value = true
    otp.value = ""
  } finally {
    isValidatingOtp.value = false
  }
}
```

---

### 🔧 Composable

```typescript
const confirmEmail = async (email: string, code: string) => {
  isLoading.value = true
  error.value = null

  try {
    await registerUseCase.confirmEmail(email, code)
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}
```

---

### 🟨 Capa de Aplicación

```typescript
return {
  confirmEmail: async (email: string, code: string) =>
    await authRepository.confirmEmail(email, code)
}
```

---

### 🟩 Capa de Infraestructura

```typescript
async confirmEmail(email: string, code: string) {
  try {
    await confirmSignUp({
      username: email,
      confirmationCode: code
    })
  } catch (error) {
    throw handleAmplifyError(error)
  }
}
```

---

### ☁️ AWS Cognito

**Acciones:**
1. Valida código OTP
2. Si es correcto: marca email como verificado
3. Si es incorrecto: lanza `CodeMismatchException`

---

## Paso 3: Usuario presiona "Reenviar código"

### 🎨 Capa de Presentación

```typescript
const handleResendOtp = async () => {
  try {
    await resendCode(registeredEmail.value)
    otp.value = ""
    otpTimeRemaining.value = 300
  } catch {
    // Error manejado por composable
  }
}
```

---

### 🔧 Composable

```typescript
const resendCode = async (email: string) => {
  isLoading.value = true
  error.value = null

  try {
    await registerUseCase.resendCode(email)
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}
```

---

### 🟨 Capa de Aplicación

```typescript
return {
  resendCode: async (email: string) =>
    await authRepository.resendConfirmationCode(email)
}
```

---

### 🟩 Capa de Infraestructura

```typescript
async resendConfirmationCode(email: string) {
  try {
    await resendSignUpCode({
      username: email
    })
  } catch (error) {
    throw handleAmplifyError(error)
  }
}
```

---

### ☁️ AWS Cognito

**Acciones:**
1. Genera nuevo código OTP
2. Envía nuevo email con código

---

## Responsabilidades por Capa

| Capa | Responsabilidad | Archivos |
|------|----------------|----------|
| **🎨 Presentación** | Captura input, muestra UI, validaciones | `register-form.vue` |
| **🔧 Composable** | Estado reactivo (loading, error), abstracción Vue | `useAuth.ts` |
| **🟨 Aplicación** | Orquesta casos de uso de negocio | `register-use-case.ts`, `login-use-case.ts` |
| **🟦 Dominio** | Define contratos (interfaces), entidades, tipos | `IAuthRepository.ts`, `User.ts`, `RegisterData.ts` |
| **🟩 Infraestructura** | Implementa detalles técnicos (Amplify, HTTP, DB) | `amplify-auth-repository.ts` |
| **☁️ Externos** | Provee funcionalidad real | AWS Cognito |

---

## Ventajas de esta Arquitectura

### ✅ Testeable

```typescript
const mockRepo: IAuthRepository = {
  register: vi.fn().mockResolvedValue({ userId: "123", email: "test@test.com" })
}
const useCase = createRegisterUseCase(mockRepo)
```

### ✅ Desacoplada

Cambiar de Amplify a Firebase solo requiere:
1. Crear `firebaseAuthRepository` que implemente `IAuthRepository`
2. Cambiar la instancia en `useAuth.ts`
3. El dominio y casos de uso **no se tocan**

### ✅ Type-safe

TypeScript en todas las capas garantiza consistencia

### ✅ Escalable

Agregar nuevos casos de uso es directo:

```typescript
export function createResetPasswordUseCase(authRepository: IAuthRepository) {
  return {
    execute: async (email: string) =>
      await authRepository.resetPassword(email)
  }
}
```

---

## Manejo de Errores

### Errores de Cognito traducidos a mensajes amigables

```typescript
function handleAmplifyError(error: unknown): Error {
  switch (errorName) {
    case "UsernameExistsException":
      return new Error("Este email ya está registrado")
    case "CodeMismatchException":
      return new Error("Código de verificación incorrecto")
    case "ExpiredCodeException":
      return new Error("El código de verificación ha expirado")
    // ... más casos
  }
}
```

Los errores se propagan desde Infrastructure → Application → Composable → Presentation

---

## Instalación

```bash
pnpm install aws-amplify
```

## Configuración

**Archivo:** `.env`

```env
PUBLIC_AWS_REGION=us-east-1
PUBLIC_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
PUBLIC_AWS_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Inicialización

**Archivo:** `src/app.ts` o layout principal

```typescript
import { initializeAmplify } from "@/infrastructure/auth";

initializeAmplify();
```

---

## Uso Completo en Componente

```vue
<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";
import type { RegisterData } from "@/domain/types/RegisterData";

const { register, confirmEmail, resendCode, isLoading, error } = useAuth();

const registeredEmail = ref("");
const otp = ref("");
const step = ref<"email" | "otp" | "password">("email");

const handleRegister = async (data: RegisterData) => {
  const result = await register(data);
  registeredEmail.value = result.email;
  step.value = "otp";
};

const handleConfirmOtp = async () => {
  await confirmEmail(registeredEmail.value, otp.value);
  step.value = "password";
};

const handleResendCode = async () => {
  await resendCode(registeredEmail.value);
};
</script>

<template>
  <div>
    <p v-if="error" class="error">{{ error }}</p>
    <button :disabled="isLoading">
      {{ isLoading ? "Cargando..." : "Registrar" }}
    </button>
  </div>
</template>
```
