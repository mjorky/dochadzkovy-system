import { z } from "zod"

export const projectFormSchema = z.object({
  // Backend očakáva max 12 znakov
  number: z.string().min(1, "Project number is required").max(12, "Project number must be 12 characters or less"),
  
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  
  // 👇👇👇 TOTO JE OPRAVA: Odstránili sme `.optional()` 👇👇👇
  // Metóda `.default("")` už sama zabezpečuje, že pole je na vstupe voliteľné.
  description: z.string().max(255, "Description is too long").default(""),
  
  countryCode: z.string().min(1, "Country is required"),
  
  // GraphQL ID je string, preto používame string aj tu.
  managerId: z.string().min(1, "Manager is required"),
  
  // Zjednotené na `active`, aby to sedelo s backend DTO
  active: z.boolean().default(true),
})

export type ProjectFormData = z.infer<typeof projectFormSchema>