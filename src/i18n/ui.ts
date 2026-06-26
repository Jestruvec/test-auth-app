export const defaultLang = "en";

export const ui = {
  es: {
    landing: {
      carousel: {
        slide1: "Todo el resort en un solo lugar",
        slide2: "Ahorra tiempo en tu check-in",
        slide3: "Del menú a tu habitación",
        slide4: "Cada día trae algo nuevo",
        slide5: "¿Necesitas algo? Solo pídelo",
      },
      services: {
        tours: "Tours",
        entertainment: "Entretenimiento",
        restaurants: "restaurants",
        roomService: "Servicio a la habitación",
        spa: "Spa",
      },
      buttons: {
        register: "Registrarse",
        login: "Iniciar sesión",
        guest: "Continuar como invitado",
      },
    },
    notification: {
      title: "No te pierdas nada sobre tu viaje.",
      description:
        "Recibe notificaciones sobre ofertas especiales, tus próximos viajes y actividades durante tu estadía.",
      enableButton: "Habilitar notificaciones",
      skipButton: "Omitir por ahora",
    },
    faceId: {
      title: "Inicia sesión más rápido con Face ID",
      description:
        "Puedes iniciar sesión en la app de forma instantánea y segura con datos biométricos.",
      info: "Puedes desactivarlo en cualquier memento desde la configuración.",
      enableButton: "Habilitar Face ID",
      skipButton: "Omitir por ahora",
    },
    complete: {
      welcome: "Bienvenido Jon",
      description:
        "Tu Palace ID ha sido creado, tu cuenta está lista para empezar a disfrutar.",
      features: {
        profile: {
          title: "Tu perfil, en todas partes",
          description: "Preferencias y favoritos siempre contigo.",
        },
        stays: {
          title: "Tus estancias en un solo lugar",
          description: "Reservas pasadas, actuales y futuras",
        },
        security: {
          title: "Seguro y privado",
          description: "Tus datos protegidos y sin compartir.",
        },
      },
      doneButton: "Listo",
    },
    login: {
      title: "Bienvenido de nuevo",
      description:
        "Utiliza tu Palace ID para iniciar sesión. Si eres socio, usa tu cuenta de Palace Elite.",
      emailLabel: "Correo electrónico",
      passwordLabel: "Contraseña",
      forgotPasswordLink: "¿Olvidaste tu contraseña?",
      submitButton: "Iniciar sesión",
      noAccountText: "¿No tienes cuenta?",
      signUpLink: "Regístrarse",
      errorInvalid: "Correo electrónico o contraseña incorrectos.",
      existingAccountBanner:
        "Ya tienes una cuenta. Ingresa tu contraseña para iniciar sesión.",
    },
    register: {
      title: "Crea tu cuenta",
      description:
        "te permite iniciar sesión y administrar los servicios de todas nuestras marcas desde la misma cuenta.",
      palaceIdLink: "Palace ID",
      emailLabel: "Correo electrónico",
      firstNameLabel: "Nombre",
      lastNameLabel: "Apellido(s)",
      continueButton: "Continuar",
      passwordTitle: "Crea tu contraseña",
      passwordDescription:
        "Define una contraseña segura para mantener tu cuenta protegida.",
      passwordLabel: "Contraseña",
      confirmPasswordLabel: "Confirma la contraseña",
      termsText: "Al crear un Palace ID, aceptas nuestros",
      termsLink: "Términos de Uso",
      termsAndPrivacyConnector: "y",
      privacyLink: "Política de Privacidad",
      createButton: "Crear mi cuenta",
      cancelTitle: "¿Cancelar registro?",
      cancelMessage:
        "Tu progreso se perderá. Tendrás que empezar de nuevo si sales.",
      cancelAndExitButton: "Cancelar y salir",
      continueModalButton: "Continuar",
      palaceIdDialogTitle: "¿Qué es Palace ID?",
      palaceIdDialogDescription:
        "Palace ID te permite iniciar sesión y gestionar servicios en todas nuestras marcas con una sola cuenta.",
      palaceIdFeatures: {
        universalAccess: {
          label: "Acceso universal",
          description:
            "Accede y gestiona todos nuestros servicios desde una sola cuenta.",
        },
        profile: {
          label: "Tu perfil, en todas partes",
          description: "Preferencias y favoritos siempre contigo",
        },
        stays: {
          label: "Todas tus estancias en un lugar",
          description: "Reservas pasadas, actuales y futuras",
        },
        security: {
          label: "Seguro y privado",
          description: "Tus datos protegidos y nunca compartidos.",
        },
      },
      understoodButton: "Entendido",
      headerTitle: "Registrarse",
    },
    recovery: {
      headerTitle: "Recuperación de contraseña",
      forgotTitle: "¿Olvidaste tu contraseña?",
      forgotDescription:
        "Ingresa el correo asociado a tu Palace ID y te enviaremos un código para restablecerla.",
      emailLabel: "Correo electrónico",
      sendCodeButton: "Enviar código",
      errorNoEmail:
        "No se puede restablecer la contraseña porque no hay un correo registrado/verificado.",
      checkEmailTitle: "Revisa tu correo",
      checkEmailDescription:
        "Si existe una cuenta asociada con {email}, recibirás un correo con un enlace para restablecer tu contraseña.",
      openEmailButton: "Abrir app de correo",
      newPasswordTitle: "Establece tu nueva contraseña",
      newPasswordDescription:
        "Define tu nueva contraseña, que no hayas usado antes.",
      passwordLabel: "Contraseña",
      confirmPasswordLabel: "Confirma la contraseña",
      savePasswordButton: "Guardar nueva contraseña",
      completeTitle: "Contraseña restablecida",
      completeDescription:
        "Tu contraseña se actualizó exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
      loginButton: "Iniciar sesión",
    },
    otp: {
      title: "Verifica tu email",
      description: "Ingresa el código de 6 dígitos que enviamos a {email}",
      validating: "Validando...",
      errorIncorrect:
        "Código incorrecto. {count} {count, plural, one {intento} other {intentos}} restante(s).",
      errorTooMany:
        "Demasiados intentos. Solicita un nuevo código o intenta más tarde.",
      successResent: "Se envió un nuevo código a tu correo.",
      codeExpired: "Código expirado",
      expiresIn: "El código expira en {time}",
      resendButton: "Reenviar código",
      requestNewButton: "Solicitar un nuevo código",
      resendCooldown: "Puedes solicitar un nuevo código en {time}",
    },
    passwordStrength: {
      chooseLabel: "Elige una contraseña",
      weak: "Débil",
      fair: "Acceptable",
      good: "Buena",
      strong: "Fuerte",
      minLength: "Al menos 8 caracteres",
      uppercase: "Una letra mayúscula",
      number: "Un número",
      specialChar: "Un carácter especial",
    },
  },
  en: {
    landing: {
      carousel: {
        slide1: "The whole resort in one place",
        slide2: "Save time on your check-in",
        slide3: "From the menu to your room",
        slide4: "Every day brings something new",
        slide5: "Need anything? Just ask",
      },
      services: {
        tours: "Tours",
        entertainment: "Entertainment",
        restaurants: "Restaurants",
        roomService: "Room Service",
        spa: "Spa",
      },
      buttons: {
        register: "Register",
        login: "Log in",
        guest: "Continue as guest",
      },
    },
    notification: {
      title: "Don't miss anything about your trip.",
      description:
        "Get notifications about special offers, your upcoming trips, and activities during your stay.",
      enableButton: "Enable notifications",
      skipButton: "Skip for now",
    },
    faceId: {
      title: "Log in faster with Face ID",
      description:
        "You can log in to the app instantly and securely with biometric data.",
      info: "You can disable it at any time from the settings.",
      enableButton: "Enable Face ID",
      skipButton: "Skip for now",
    },
    complete: {
      welcome: "Welcome Jon",
      description:
        "Your Palace ID has been created, your account is ready to start enjoying it.",
      features: {
        profile: {
          title: "Your profile, everywhere",
          description: "Preferences and favorites always with you.",
        },
        stays: {
          title: "Your stays in one place",
          description: "Past, current, and future bookings",
        },
        security: {
          title: "Safe and private",
          description: "Your data protected and not shared.",
        },
      },
      doneButton: "Done",
    },
    login: {
      title: "Welcome back",
      description:
        "Use your Palace ID to log in. If you are a member, use your Palace Elite account.",
      emailLabel: "Email",
      passwordLabel: "Password",
      forgotPasswordLink: "Forgot your password?",
      submitButton: "Log in",
      noAccountText: "Don't have an account?",
      signUpLink: "Sign up",
      errorInvalid: "Incorrect email or password.",
      existingAccountBanner:
        "You already have an account. Enter your password to log in.",
    },
    register: {
      title: "Create your account",
      description:
        "allows you to log in and manage the services of all our brands from the same account.",
      palaceIdLink: "Palace ID",
      emailLabel: "Email",
      firstNameLabel: "First name",
      lastNameLabel: "Last name(s)",
      continueButton: "Continue",
      passwordTitle: "Create your password",
      passwordDescription:
        "Define a secure password to keep your account safe.",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      termsText: "By creating a Palace ID, you agree to our",
      termsLink: "Terms of Use",
      termsAndPrivacyConnector: "and",
      privacyLink: "Privacy Policy",
      createButton: "Create my account",
      cancelTitle: "Cancel Sign Up?",
      cancelMessage:
        "Your progress will be lost. You will have to start over if you exit.",
      cancelAndExitButton: "Cancel and exit",
      continueModalButton: "Continue",
      palaceIdDialogTitle: "What is Palace ID?",
      palaceIdDialogDescription:
        "Palace ID allows you to log in and manage services across all our brands using a single account.",
      palaceIdFeatures: {
        universalAccess: {
          label: "Universal Access",
          description:
            "Access and manage all our services from a single account.",
        },
        profile: {
          label: "Your profile, everywhere",
          description: "Preferences and favorites always with you",
        },
        stays: {
          label: "All your stays in one place",
          description: "Past, current, and future reservations",
        },
        security: {
          label: "Secure and private",
          description: "Your data is protected and never shared.",
        },
      },
      understoodButton: "Understood",
      headerTitle: "Sign up",
    },
    recovery: {
      headerTitle: "Password recovery",
      forgotTitle: "Forgot your password?",
      forgotDescription:
        "Enter the email associated with your Palace ID and we will send you a code to reset it.",
      emailLabel: "Email address",
      sendCodeButton: "Send code",
      errorNoEmail:
        "Cannot reset password for the user as there is no registered/verified email.",
      checkEmailTitle: "Check your email",
      checkEmailDescription:
        "If an account associated with {email} exists, you will receive an email with a link to reset your password.",
      openEmailButton: "Open email App",
      newPasswordTitle: "Set your new password",
      newPasswordDescription:
        "Set your new password, which you have not used before.",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      savePasswordButton: "Save new password",
      completeTitle: "Password reset",
      completeDescription:
        "Your password has been updated successfully. You can now log in with your new password.",
      loginButton: "Log in",
    },
    otp: {
      title: "Verify your email",
      description: "Enter the 6-digit code we sent to {email}",
      validating: "Validating...",
      errorIncorrect:
        "Incorrect code. {count} {count, plural, one {attempt} other {attempts}} remaining.",
      errorTooMany:
        "Too many attempts. Please request a new code or try again later.",
      successResent: "A new code has been sent to your email.",
      codeExpired: "Code expired",
      expiresIn: "The code expires in {time}",
      resendButton: "Resend code",
      requestNewButton: "Request a new code",
      resendCooldown: "You can request a new code in {time}",
    },
    passwordStrength: {
      chooseLabel: "Choose a password",
      weak: "Weak",
      fair: "Fair",
      good: "Good",
      strong: "Strong",
      minLength: "At least 8 characters",
      uppercase: "One uppercase letter",
      number: "One number",
      specialChar: "One special character",
    },
  },
} as const;
