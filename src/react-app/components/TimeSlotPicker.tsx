// TimeSlotPicker.tsx CORRIGIDO

import { useMemo } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import moment from 'moment';
import type { AppointmentType } from '../../shared/types';

interface TimeSlotPickerProps {
  selectedDate: Date;
  appointments: AppointmentType[];
  professionalId: number | null;
  serviceDuration: number;
  value: Date | null;
  onChange: (date: Date) => void;
}

export function TimeSlotPicker({ selectedDate, appointments, professionalId, serviceDuration, value, onChange }: TimeSlotPickerProps) {
  
  const timeSlots = useMemo(() => {
    if (!professionalId) return [];

    const slots = [];
    const workDayStart = moment(selectedDate).startOf('day').hour(8);
    const workDayEnd = moment(selectedDate).startOf('day').hour(18);
    const slotInterval = 30;

    const professionalAppointments = appointments.filter(
      app => app.professional_id === professionalId && moment(app.appointment_date).isSame(selectedDate, 'day')
    );

    let currentTime = workDayStart;

    while (currentTime.isBefore(workDayEnd)) {
      const slotEnd = currentTime.clone().add(serviceDuration, 'minutes');
      
      const isOccupied = professionalAppointments.some(app => {
        const existingStart = moment(app.appointment_date);
        const existingEnd = moment(app.end_date);
        return currentTime.isBefore(existingEnd) && slotEnd.isAfter(existingStart);
      });

      if (!isOccupied) {
        slots.push({
          label: currentTime.format('HH:mm'),
          value: currentTime.toDate(),
        });
      }
      
      currentTime.add(slotInterval, 'minutes');
    }

    return slots;
  }, [selectedDate, appointments, professionalId, serviceDuration]);

  const selectedTimeValue = value ? moment(value).toDate() : null;

  const handleSelect = (e: { value: Date | null }) => {
      if (e.value) {
          const newDate = moment(selectedDate)
              .hour(moment(e.value).hour())
              .minute(moment(e.value).minute())
              .second(0)
              .millisecond(0)
              .toDate();
          onChange(newDate);
      }
  }

  if (!professionalId) {
      return <div className="text-center p-4 bg-gray-100 rounded-md text-sm text-gray-600">Selecione um profissional para ver os horários.</div>
  }
  
  // CORREÇÃO: A variável aqui é "timeSlots", e não "slots"
  if (timeSlots.length === 0) {
      return <div className="text-center p-4 bg-gray-100 rounded-md text-sm text-gray-600">Nenhum horário disponível para este profissional no dia selecionado.</div>
  }

  return (
    <SelectButton 
      value={selectedTimeValue} 
      options={timeSlots} 
      onChange={handleSelect}
      optionLabel="label"
      optionValue="value"
      itemTemplate={(option) => <span>{option.label}</span>}
      className="time-slot-selector"
    />
  );
}