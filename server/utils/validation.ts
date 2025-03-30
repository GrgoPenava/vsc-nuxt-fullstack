import { z } from "zod";

// Regularni izraz za provjeru lozinke: najmanje 6 znakova, 1 veliko slovo i 1 poseban znak
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{6,})$/;

export const registerSchema = z
  .object({
    username: z.string().min(3, "Korisničko ime mora imati barem 3 znaka"),
    email: z.string().email("Unesite važeću email adresu"),
    firstName: z.string().min(1, "Ime je obavezno"),
    lastName: z.string().min(1, "Prezime je obavezno"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Lozinka mora imati najmanje 6 znakova, jedno veliko slovo i jedan poseban znak"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Lozinke se ne podudaraju",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Unesite važeću email adresu"),
  password: z.string().min(1, "Lozinka je obavezna"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
