import { create } from 'zustand';
import { supabase } from '../react-app/supabaseClient';
import type {
  ClientType,
  ProductType,
  AppointmentType,
  FinancialEntryType,
  ProfessionalType,
  BusinessHoursType,
  CreateAppointmentType,
  CreateClientType,
  CreateFinancialEntryType,
  CreateProductType,
  CreateProfessionalType,
} from './types';

// --- Estrutura do Estado Global (State) ---
interface AppState {
  // Estado para Clientes
  clients: ClientType[];
  fetchClients: (userId: string) => Promise<void>;
  addClient: (client: CreateClientType, userId: string) => Promise<void>;
  updateClient: (client: ClientType) => Promise<void>;
  deleteClient: (clientId: number) => Promise<void>;

  // Estado para Produtos
  products: ProductType[];
  fetchProducts: (userId: string) => Promise<void>;
  addProduct: (product: CreateProductType, userId: string) => Promise<void>;
  updateProduct: (product: ProductType) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;

  // Estado para Profissionais
  professionals: ProfessionalType[];
  fetchProfessionals: (userId: string) => Promise<void>;
  addProfessional: (professional: CreateProfessionalType, userId: string) => Promise<void>;
  updateProfessional: (professional: ProfessionalType) => Promise<void>;
  deleteProfessional: (professionalId: number) => Promise<void>;

  // Estado para Agendamentos
  appointments: AppointmentType[];
  fetchAppointments: (userId: string) => Promise<void>;
  addAppointment: (appointment: CreateAppointmentType, userId: string) => Promise<void>;
  updateAppointment: (appointment: AppointmentType) => Promise<void>;
  deleteAppointment: (appointmentId: number) => Promise<void>;

  // Estado para Entradas Financeiras
  financialEntries: FinancialEntryType[];
  fetchFinancialEntries: (userId: string) => Promise<void>;
  addFinancialEntry: (entry: CreateFinancialEntryType, userId: string) => Promise<void>;
  updateFinancialEntry: (entry: FinancialEntryType) => Promise<void>;
  deleteFinancialEntry: (entryId: number) => Promise<void>;

  // Estado para Configurações de Horário
  businessHours: BusinessHoursType[];
  fetchBusinessHours: (userId: string) => Promise<void>;

  // Estados de loading
  loading: {
    clients: boolean;
    products: boolean;
    professionals: boolean;
    appointments: boolean;
    financialEntries: boolean;
    businessHours: boolean;
  };
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // --- CLIENTES ---
  clients: [],
  fetchClients: async (userId) => {
    set(state => ({ loading: { ...state.loading, clients: true } }));
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    if (error) {
      console.error("Erro ao buscar clientes:", error);
      set(state => ({ loading: { ...state.loading, clients: false } }));
      return;
    }
    set({ clients: data || [], loading: { ...get().loading, clients: false } });
  },
  addClient: async (client, userId) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...client, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({ clients: [...state.clients, data] }));
    }
  },
  updateClient: async (client) => {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', client.id)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({
        clients: state.clients.map((c) => (c.id === client.id ? data : c)),
      }));
    }
  },
  deleteClient: async (clientId) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) throw error;
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== clientId),
    }));
  },

  // --- PRODUTOS ---
  products: [],
  fetchProducts: async (userId) => {
    set(state => ({ loading: { ...state.loading, products: true } }));
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    if (error) {
      console.error("Erro ao buscar produtos:", error);
      set(state => ({ loading: { ...state.loading, products: false } }));
      return;
    }
    set({ products: data || [], loading: { ...get().loading, products: false } });
  },
  addProduct: async (product, userId) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({ products: [...state.products, data] }));
    }
  },
  updateProduct: async (product) => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? data : p)),
      }));
    }
  },
  deleteProduct: async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    }));
  },

  // --- PROFISSIONAIS ---
  professionals: [],
  fetchProfessionals: async (userId) => {
    set(state => ({ loading: { ...state.loading, professionals: true } }));
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    if (error) {
      console.error("Erro ao buscar profissionais:", error);
      set(state => ({ loading: { ...state.loading, professionals: false } }));
      return;
    }
    set({ professionals: data || [], loading: { ...get().loading, professionals: false } });
  },
  addProfessional: async (professional, userId) => {
    const { data, error } = await supabase
      .from('professionals')
      .insert([{ ...professional, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({ professionals: [...state.professionals, data] }));
    }
  },
  updateProfessional: async (professional) => {
    const { data, error } = await supabase
      .from('professionals')
      .update(professional)
      .eq('id', professional.id)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({
        professionals: state.professionals.map((p) => (p.id === professional.id ? data : p)),
      }));
    }
  },
  deleteProfessional: async (professionalId) => {
    const { error } = await supabase.from('professionals').delete().eq('id', professionalId);
    if (error) throw error;
    set((state) => ({
      professionals: state.professionals.filter((p) => p.id !== professionalId),
    }));
  },

  // --- AGENDAMENTOS (Refatorado para usar professional_id) ---
  appointments: [],
  fetchAppointments: async (userId) => {
    set(state => ({ loading: { ...state.loading, appointments: true } }));
    // A query agora busca todos os campos, incluindo o novo 'professional_id'.
    // O frontend será responsável por usar esse ID para encontrar o nome do profissional.
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
      set(state => ({ loading: { ...state.loading, appointments: false } }));
      return;
    }
    set({ appointments: data || [], loading: { ...get().loading, appointments: false } });
  },
  addAppointment: async (appointment, userId) => {
    // Busca o nome do cliente para manter a consistência dos dados.
    const client = get().clients.find(c => c.id === appointment.client_id);
    if (!client) throw new Error("Cliente não encontrado.");

    const newAppointmentData = {
      ...appointment,
      user_id: userId,
      client_name: client.name,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([newAppointmentData])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      set((state) => ({ 
        appointments: [...state.appointments, data].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()) 
      }));
    }
  },
  updateAppointment: async (appointment) => {
    const client = get().clients.find(c => c.id === appointment.client_id);
    if (!client) throw new Error("Cliente não encontrado.");
  
    const updatedAppointmentData = {
      ...appointment,
      client_name: client.name,
    };

    const { data, error } = await supabase
      .from('appointments')
      .update(updatedAppointmentData)
      .eq('id', appointment.id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === appointment.id ? data : a)),
      }));
    }
  },
  deleteAppointment: async (appointmentId) => {
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
    if (error) throw error;
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== appointmentId),
    }));
  },

  // --- ENTRADAS FINANCEIRAS ---
  financialEntries: [],
  fetchFinancialEntries: async (userId) => {
    set(state => ({ loading: { ...state.loading, financialEntries: true } }));
    const { data, error } = await supabase
      .from('financial_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    if (error) {
      console.error("Erro ao buscar entradas financeiras:", error);
      set(state => ({ loading: { ...state.loading, financialEntries: false } }));
      return;
    }
    set({ financialEntries: data || [], loading: { ...get().loading, financialEntries: false } });
  },
  addFinancialEntry: async (entry, userId) => {
    const { data, error } = await supabase
      .from('financial_entries')
      .insert([{ ...entry, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({ financialEntries: [...state.financialEntries, data] }));
    }
  },
  updateFinancialEntry: async (entry) => {
    const { data, error } = await supabase
      .from('financial_entries')
      .update(entry)
      .eq('id', entry.id)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      set((state) => ({
        financialEntries: state.financialEntries.map((e) => (e.id === entry.id ? data : e)),
      }));
    }
  },
  deleteFinancialEntry: async (entryId) => {
    const { error } = await supabase.from('financial_entries').delete().eq('id', entryId);
    if (error) throw error;
    set((state) => ({
      financialEntries: state.financialEntries.filter((e) => e.id !== entryId),
    }));
  },

  // --- CONFIGURAÇÕES DE HORÁRIO ---
  businessHours: [],
  fetchBusinessHours: async (userId) => {
    set(state => ({ loading: { ...state.loading, businessHours: true } }));
    const { data, error } = await supabase
      .from('business_settings')
      .select('day_of_week, start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null);
      
    if (error) {
      console.error("Erro ao buscar horários de funcionamento:", error);
      set(state => ({ loading: { ...state.loading, businessHours: false } }));
      return;
    }
    set({ businessHours: data || [], loading: { ...get().loading, businessHours: false } });
  },

  // --- ESTADOS DE LOADING ---
  loading: {
    clients: false,
    products: false,
    professionals: false,
    appointments: false,
    financialEntries: false,
    businessHours: false,
  },
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),
}));