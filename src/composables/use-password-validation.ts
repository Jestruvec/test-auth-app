import { computed, type Ref } from "vue";

interface PasswordValidations {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordStrength {
  label: string;
  color: string;
  bgColor: string;
}

export const usePasswordValidation = (password: Ref<string>) => {
  const passwordValidations = computed<PasswordValidations>(() => {
    const pwd = password.value;
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

  const passwordStrength = computed<PasswordStrength>(() => {
    const validations = Object.values(passwordValidations.value);
    const completed = validations.filter(Boolean).length;

    if (completed === 0) {
      return { label: "", color: "", bgColor: "" };
    }
    if (completed <= 1) {
      return {
        label: "Weak",
        color: "text-tpc-fg-danger",
        bgColor: "var(--color-bg-danger)",
      };
    }
    if (completed === 2 || completed === 3) {
      return {
        label: "Regular",
        color: "text-tpc-fg-warning",
        bgColor: "var(--color-bg-warning)",
      };
    }
    return {
      label: "Strong",
      color: "text-tpc-fg-positive",
      bgColor: "var(--color-bg-positive)",
    };
  });

  return {
    passwordValidations,
    passwordProgress,
    passwordStrength,
  };
};
