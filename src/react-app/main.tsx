import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

// --- Configuração do moment.js ---
import moment from 'moment';
import 'moment/locale/pt-br'; // Importa o pacote de idioma

// Define 'pt-br' como o idioma global do moment
moment.locale('pt-br');

// --- Configuração Global do PrimeReact ---
import { addLocale, locale } from 'primereact/api';

// Configuração completa em Português Brasileiro
addLocale('pt-BR', {
    firstDayOfWeek: 0, // Domingo = 0 (padrão brasileiro)
    dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Sem',
    weak: 'Fraco',
    medium: 'Médio',
    strong: 'Forte',
    passwordPrompt: 'Digite uma senha',
    emptyMessage: 'Nenhum resultado encontrado',
    emptyFilterMessage: 'Nenhum resultado encontrado',
    apply: 'Aplicar',
    matchAll: 'Corresponder Todos',
    matchAny: 'Corresponder Qualquer',
    addRule: 'Adicionar Regra',
    removeRule: 'Remover Regra',
    accept: 'Sim',
    reject: 'Não',
    choose: 'Escolher',
    upload: 'Enviar',
    cancel: 'Cancelar',
    dayNamesTitle: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    monthNamesTitle: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    chooseYear: 'Escolher Ano',
    chooseMonth: 'Escolher Mês',
    chooseDate: 'Escolher Data',
    prevDecade: 'Década Anterior',
    nextDecade: 'Próxima Década',
    prevYear: 'Ano Anterior',
    nextYear: 'Próximo Ano',
    prevMonth: 'Mês Anterior',
    nextMonth: 'Próximo Mês',
    prevHour: 'Hora Anterior',
    nextHour: 'Próxima Hora',
    prevMinute: 'Minuto Anterior',
    nextMinute: 'Próximo Minuto',
    prevSecond: 'Segundo Anterior',
    nextSecond: 'Próximo Segundo',
    am: 'AM',
    pm: 'PM'
});

// Define pt-BR como o locale padrão globalmente
locale('pt-BR');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);