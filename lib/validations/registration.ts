export interface ValidationError {
  field: string;
  message: string;
}

export function validateRegistrationInput(data: {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  attendees: number;
}): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data.eventId || typeof data.eventId !== "string" || data.eventId.trim() === "") {
    errors.push({ field: "eventId", message: "Event selection is required." });
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
    errors.push({ field: "name", message: "Full name must be at least 2 characters." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== "string" || !emailRegex.test(data.email.trim())) {
    errors.push({ field: "email", message: "Please provide a valid email address." });
  }

  const cleanPhone = (data.phone || "").replace(/[^0-9+]/g, "");
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.push({ field: "phone", message: "Please enter a valid contact phone number." });
  }

  const attendeesNum = Number(data.attendees);
  if (!attendeesNum || isNaN(attendeesNum) || attendeesNum < 1 || attendeesNum > 20) {
    errors.push({ field: "attendees", message: "Number of attendees must be between 1 and 20." });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
