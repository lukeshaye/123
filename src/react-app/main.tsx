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
    // ...outras traduções
});

// Define pt-BR como o locale padrão globalmente
locale('pt-BR');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);