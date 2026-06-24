export type CheckEmailResult = {
  available: boolean;
  reason: "AVAILABLE" | "EXISTS";
};

export interface IEmailAvailabilityRepository {
  checkEmailAvailability(email: string): Promise<CheckEmailResult>;
}
