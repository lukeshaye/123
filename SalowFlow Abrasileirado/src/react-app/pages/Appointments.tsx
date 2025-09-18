import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider';
import { useAppStore } from '../../shared/store';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, X, User, Edit, Trash2 } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';
import type { AppointmentType, ClientType, BusinessHoursType, ProfessionalType, ServiceType } from '../../shared/types';
import { AppointmentFormSchema } from '../../shared/types';
import { useToastHelpers } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Configuração do Localizer (Completo em PT-BR) ---
moment.locale('pt-br');
moment.updateLocale('pt-br', {
  months: 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
  monthsShort: 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
  weekdays: 'Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado'.split('_'),
  weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_'),
  weekdaysMin: 'Do_Se_Te_Qa_Qi_Se_Sa'.split('_'),
});
const localizer = momentLocalizer(moment);


// --- Tipos e Valores Padrão ---
interface AppointmentFormData {
  client_id: number;
  professional_id: number;
  service_id: number;
  price: number;
  appointment_date: string;
  end_date: string;
  attended?: boolean;
}

const defaultFormValues: Partial<AppointmentFormData> = {
    client_id: undefined,
    professional_id: undefined,
    service_id: undefined,
    price: undefined,
    appointment_date: '',
    end_date: '',
    attended: false,
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentType;
}

// --- Paletas de Cores Padrão (Fallback) ---
const DEFAULT_PROFESSIONAL_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ef4444'];
const DEFAULT_SERVICE_COLORS = ['#ec4899', '#6366f1', '#22c55e', '#f59e0b', '#d946ef'];

// --- Componente Principal ---
export default function Appointments() {
  const { user } = useSupabaseAuth();
  const { showSuccess, showError } = useToastHelpers();

  const {
    appointments,
    clients,
    professionals,
    services,
    businessHours,
    loading,
    fetchAppointments,
    fetchClients,
    fetchProfessionals,
    fetchServices,
    fetchBusinessHours,
    addAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppStore();

  // --- Estados do Componente ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentType | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentFormSchema) as any,
    defaultValues: defaultFormValues
  });

  const watchedServiceId = useWatch({ control, name: 'service_id' });
  const watchedStartDate = useWatch({ control, name: 'appointment_date' });

  // --- Efeitos ---
  useEffect(() => {
    if (user) {
      fetchClients(user.id);
      fetchProfessionals(user.id);
      fetchServices(user.id);
      fetchBusinessHours(user.id);
      fetchAppointments(user.id);
    }
  }, [user, fetchClients, fetchProfessionals, fetchServices, fetchBusinessHours, fetchAppointments]);

  useEffect(() => {
    if (watchedServiceId && services.length > 0) {
      const selectedService = services.find(s => s.id === Number(watchedServiceId));
      if (selectedService) {
        setValue('price', selectedService.price / 100);
        if (watchedStartDate) {
          const newEndDate = moment(watchedStartDate).add(selectedService.duration, 'minutes').format('YYYY-MM-DDTHH:mm');
          setValue('end_date', newEndDate);
        }
      }
    }
  }, [watchedServiceId, watchedStartDate, services, setValue]);

  // --- Cálculos e Memos ---
  const { minTime, maxTime } = useMemo(() => {
    if (!businessHours || businessHours.length === 0) {
      return {
        minTime: moment().startOf('day').add(8, 'hours').toDate(),
        maxTime: moment().startOf('day').add(20, 'hours').toDate(),
      };
    }
    let min = '23:59';
    let max = '00:00';
    businessHours.forEach((hour: BusinessHoursType) => {
      if (hour.start_time && hour.start_time < min) min = hour.start_time;
      if (hour.end_time && hour.end_time > max) max = hour.end_time;
    });
    return {
      minTime: moment().startOf('day').add(moment.duration(min)).toDate(),
      maxTime: moment().startOf('day').add(moment.duration(max)).toDate(),
    };
  }, [businessHours]);

  const filteredAppointments = useMemo(() => {
    if (selectedProfessionalId === null) {
      return appointments;
    }
    return appointments.filter(app => app.professional_id === selectedProfessionalId);
  }, [appointments, selectedProfessionalId]);

  const calendarEvents: CalendarEvent[] = useMemo(() => filteredAppointments.map((appointment: AppointmentType) => {
    const start = new Date(appointment.appointment_date);
    const end = new Date(appointment.end_date);
    const clientName = clients.find(c => c.id === appointment.client_id)?.name || appointment.client_name;
    const serviceName = services.find(s => s.id === appointment.service_id)?.name || appointment.service;
    const professionalName = professionals.find(p => p.id === appointment.professional_id)?.name || appointment.professional;

    return {
      id: appointment.id!,
      title: `${clientName}&&${serviceName}&&${professionalName}`, // Usando separador para o componente customizado
      start,
      end,
      resource: appointment,
    };
  }), [filteredAppointments, clients, services, professionals]);

  // --- Lógica para Cores Dinâmicas ---
  const eventPropGetter = useCallback((event: CalendarEvent) => {
    // Se a visualização for 'agenda', retorna um objeto de estilo vazio para usar o CSS padrão.
    if (view === Views.AGENDA) {
      return { style: {} };
    }

    const { resource: appointment } = event;
    const professional = professionals.find(p => p.id === appointment.professional_id);
    const service = services.find(s => s.id === appointment.service_id);

    const professionalColor = professional?.color || DEFAULT_PROFESSIONAL_COLORS[professional?.id! % DEFAULT_PROFESSIONAL_COLORS.length];
    const serviceColor = service?.color || DEFAULT_SERVICE_COLORS[service?.id! % DEFAULT_SERVICE_COLORS.length];

    const style = {
      backgroundColor: professionalColor,
      borderRadius: '4px',
      color: 'white',
      border: '0px',
      borderLeft: `5px solid ${serviceColor}`,
      paddingLeft: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      opacity: 0.9,
      display: 'block'
    };
    
    return { style };
  }, [professionals, services, view]);


  // --- Componente Customizado para o Evento ---
  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const [clientName, serviceName, professionalName] = event.title.split('&&');
    return (
      <div className="text-xs p-1 overflow-hidden">
        <strong className="font-semibold block truncate">{clientName}</strong>
        <span className="block truncate">{serviceName}</span>
        <em className="block truncate opacity-80">{professionalName}</em>
      </div>
    );
  };

  // --- Manipuladores de Eventos ---
  const onSubmit = async (data: AppointmentFormData) => {
    if (!user) return;
    
    const newStart = moment(data.appointment_date);
    const newEnd = moment(data.end_date);
    const professionalId = Number(data.professional_id);

    const conflictingAppointment = appointments.find(app => {
        if (editingAppointment && app.id === editingAppointment.id) return false;
        if (app.professional_id !== professionalId) return false;
        const existingStart = moment(app.appointment_date);
        const existingEnd = moment(app.end_date);
        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    });

    if (conflictingAppointment) {
        showError("Conflito de Horário", "O profissional já tem um agendamento neste horário.");
        return;
    }
    
    const client = clients.find(c => c.id === Number(data.client_id));
    const professional = professionals.find(p => p.id === professionalId);
    const service = services.find(s => s.id === Number(data.service_id));

    if (!client || !professional || !service) {
        showError("Dados inválidos.", "Cliente, profissional ou serviço não encontrado.");
        return;
    }
    
    const appointmentData = {
      ...data,
      price: Math.round(Number(data.price) * 100),
      client_id: Number(data.client_id),
      professional_id: professionalId,
      service_id: Number(data.service_id),
      client_name: client.name,
      professional: professional.name,
      service: service.name,
      attended: data.attended ?? false,
    };

    try {
      if (editingAppointment) {
        await updateAppointment({ ...editingAppointment, ...appointmentData });
        showSuccess("Agendamento atualizado!");
      } else {
        await addAppointment(appointmentData, user.id);
        showSuccess("Agendamento criado com sucesso!");
      }
      handleCloseModal();
    } catch (error) {
      showError("Não foi possível salvar", "Verifique os dados e tente novamente.");
    }
  };

  const handleDeleteClick = (appointment: AppointmentType) => {
    setAppointmentToDelete(appointment);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !appointmentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAppointment(appointmentToDelete.id!);
      showSuccess("Agendamento removido!");
      setIsConfirmModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err: any) {
      showError("Falha ao remover agendamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    reset(defaultFormValues);
  };

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const appointmentDateTime = moment(start).format('YYYY-MM-DDTHH:mm');
    const endDateTime = moment(start).add(30, 'minutes').format('YYYY-MM-DDTHH:mm'); // Duração padrão
    reset({ 
      ...defaultFormValues, 
      appointment_date: appointmentDateTime, 
      end_date: endDateTime,
      professional_id: selectedProfessionalId ?? undefined
    });
    setEditingAppointment(null);
    setIsModalOpen(true);
  }, [reset, selectedProfessionalId]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEditingAppointment(event.resource);
    reset({
      client_id: event.resource.client_id,
      professional_id: event.resource.professional_id,
      service_id: event.resource.service_id,
      price: event.resource.price / 100,
      appointment_date: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end_date: moment(event.end).format('YYYY-MM-DDTHH:mm'),
      attended: event.resource.attended,
    });
    setIsModalOpen(true);
  }, [reset]);
  
  const isLoadingData = loading.clients || loading.professionals || loading.services || loading.businessHours || loading.appointments;

  if (isLoadingData) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="mt-2 text-gray-600">Gerencie todos os seus agendamentos</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="professional_filter"
                  value={selectedProfessionalId ?? ''}
                  onChange={(e) => setSelectedProfessionalId(e.target.value ? Number(e.target.value) : null)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-sm"
                >
                  <option value="">Todos os Profissionais</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
             </div>
            <button
              type="button"
              onClick={() => handleSelectSlot({ start: new Date() })}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
          <div style={{ height: '600px' }}>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              culture='pt-br'
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Nenhum agendamento neste período.',
                showMore: (total: number) => `+ Ver mais (${total})`,
              }}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: 'ddd, DD/MM',
              }}
              min={minTime}
              max={maxTime}
              step={60}
              timeslots={1}
              eventPropGetter={eventPropGetter}
              components={{
                event: CustomEvent
              }}
            />
          </div>
        </div>

        {isModalOpen && (
           <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
                      <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-4">
                       <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Cliente *</label>
                        <select
                          {...register('client_id', { valueAsNumber: true })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        >
                          <option value="">Selecione um cliente</option>
                          {clients.map((client) => ( <option key={client.id} value={client.id}>{client.name}</option> ))}
                        </select>
                        {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>}
                      </div>
                       <div>
                        <label htmlFor="professional_id" className="block text-sm font-medium text-gray-700">Profissional *</label>
                        <select
                          {...register('professional_id', { valueAsNumber: true })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        >
                          <option value="">Selecione um profissional</option>
                          {professionals.map((prof) => (<option key={prof.id} value={prof.id}>{prof.name}</option>))}
                        </select>
                        {errors.professional_id && <p className="mt-1 text-sm text-red-600">{errors.professional_id.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">Serviço *</label>
                         <select
                          {...register('service_id', { valueAsNumber: true })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        >
                          <option value="">Selecione um serviço</option>
                          {services.map((service) => (<option key={service.id} value={service.id}>{service.name}</option>))}
                        </select>
                        {errors.service_id && <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (R$) *</label>
                        <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="50,00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                          <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700">Início *</label>
                          <input type="datetime-local" {...register('appointment_date')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                          {errors.appointment_date && <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Fim *</label>
                          <input type="datetime-local" {...register('end_date')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                          {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center">
                     <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-base font-medium text-white hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {isSubmitting ? 'Salvando...' : (editingAppointment ? 'Atualizar' : 'Criar')}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:w-auto sm:text-sm">
                      Cancelar
                    </button>
                     {editingAppointment && (
                        <button
                        type="button"
                        onClick={() => handleDeleteClick(editingAppointment)}
                        className="mt-3 sm:mt-0 mr-auto w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                        >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                        </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Excluir Agendamento"
          message={`Tem certeza que deseja excluir o agendamento? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}
