import { z } from "zod";

// --- Schemas de Clientes (Sem alterações) ---
export const ClientSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do cliente é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  notes: z.string().optional(),
});
export const CreateClientSchema = ClientSchema.omit({ id: true, user_id: true });

// --- Schemas de Agendamentos (ESTRUTURA ATUALIZADA) ---

// 1. Schema base representando a nova estrutura da tabela
const BaseAppointmentSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  client_id: z.number().min(1, "Cliente é obrigatório"),
  // client_name não é mais necessário aqui, virá da view
  service: z.string().min(1, "Serviço é obrigatório"),
  price: z.number().positive("Preço deve ser positivo"),
  professional_id: z.number().min(1, "Profissional é obrigatório"), // Alterado para número e obrigatório
  appointment_date: z.string(),
  end_date: z.string(),
  attended: z.boolean().default(false),
});

// 2. Validação para garantir que a data de fim seja posterior à de início
const dateRefinement = {
  message: "A data de fim deve ser posterior à data de início",
  path: ["end_date"],
};

// 3. Schema completo para um agendamento (com a validação de data)
export const AppointmentSchema = BaseAppointmentSchema.refine(
  (data) => new Date(data.end_date) > new Date(data.appointment_date),
  dateRefinement
);

// 4. Schema para o formulário de criação/edição de agendamento
export const AppointmentFormSchema = BaseAppointmentSchema.omit({ 
  id: true, 
  user_id: true 
}).refine(
  (data) => new Date(data.end_date) > new Date(data.appointment_date),
  dateRefinement
);


// --- Schemas de Entradas Financeiras (Sem alterações) ---
export const FinancialEntrySchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  type: z.enum(["receita", "despesa"]),
  entry_type: z.enum(["pontual", "fixa"]),
  entry_date: z.string(),
  is_virtual: z.boolean().default(false),
});
export const CreateFinancialEntrySchema = FinancialEntrySchema.omit({ id: true, user_id: true, is_virtual: true });


// --- Schemas de Produtos (Sem alterações) ---
export const ProductSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  quantity: z.number().int().min(0, "Quantidade deve ser positiva").default(0),
  image_url: z.string().url("URL da imagem inválida").optional().or(z.literal('')),
});
export const CreateProductSchema = ProductSchema.omit({ id: true, user_id: true }).extend({
  quantity: z.number().int().min(0, "Quantidade deve ser positiva").optional().default(0),
});


// --- Schemas de Profissionais (Sem alterações) ---
export const ProfessionalSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do profissional é obrigatório"),
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  lunch_start_time: z.string().optional(),
  lunch_end_time: z.string().optional(),
});
export const CreateProfessionalSchema = ProfessionalSchema.omit({ id: true, user_id: true });


// --- Tipos derivados dos esquemas ---
export type AppointmentType = z.infer<typeof AppointmentSchema> & { client_name: string, professional_name: string }; // Adicionando campos da view
export type CreateAppointmentType = z.infer<typeof AppointmentFormSchema>;
export type FinancialEntryType = z.infer<typeof FinancialEntrySchema>;
export type CreateFinancialEntryType = z.infer<typeof CreateFinancialEntrySchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type CreateProductType = z.infer<typeof CreateProductSchema>;
export type ProfessionalType = z.infer<typeof ProfessionalSchema>;
export type CreateProfessionalType = z.infer<typeof CreateProfessionalSchema>;
export type ClientType = z.infer<typeof ClientSchema>;
export type CreateClientType = z.infer<typeof CreateClientSchema>;

// --- Tipos para Configurações e Dashboard (Sem alterações) ---
export const BusinessHoursSchema = z.object({
  day_of_week: z.number(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});
export type BusinessHoursType = z.infer<typeof BusinessHoursSchema>;

export interface DashboardKPIs {
  dailyEarnings: number;
  dailyAppointments: number;
  avgTicket: number;
}
export interface WeeklyEarning {
  entry_date: string;
  earnings: number;
}