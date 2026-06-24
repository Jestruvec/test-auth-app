import type {
  CheckEmailResult,
  IEmailAvailabilityRepository,
} from "@/domain/repositories/email-availability.repository";

const AVAILABLE: CheckEmailResult = { available: true, reason: "AVAILABLE" };

export const httpEmailAvailabilityRepository: IEmailAvailabilityRepository = {
  async checkEmailAvailability(email: string): Promise<CheckEmailResult> {
    const baseUrl = import.meta.env.PUBLIC_TRIGGERS_API_URL;
    if (!baseUrl) return AVAILABLE;

    try {
      const res = await fetch(`${baseUrl}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) return AVAILABLE;

      const data = await res.json();
      return data.reason === "EXISTS"
        ? { available: false, reason: "EXISTS" }
        : AVAILABLE;
    } catch {
      return AVAILABLE;
    }
  },
};
