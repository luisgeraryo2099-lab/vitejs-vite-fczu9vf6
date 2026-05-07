import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  User, Lock, Eye, EyeOff, Shield, Users, LineChart as ChartIcon, Image, LogOut, 
  UserCheck, Download, Upload, ClipboardList, PlayCircle, PieChart, Activity, 
  Stethoscope, CheckCircle, AlertCircle, Trash2, ExternalLink, Youtube, 
  Award, Star, HeartPulse, Dumbbell, BookOpen, Crown, Info, Flame, Zap, Trophy, 
  Target, TrendingUp, Medal, ChevronRight, X, Search, FileText
} from 'lucide-react';

type Role = 'admin' | 'student';

interface Usuario {
  id: string;
  name: string;
  password?: string;
  unidad?: string;
  role: Role;
  surveyEnabled?: boolean;
  viewedContent?: string[];
}

interface Evaluacion {
  _fecha: string;
  sexo: string;
  edad: string;
  peso: string;
  talla: string;
  cintura: string;
  cadera: string;
  grasa: string;
  visceral: string;
  musculo: string;
  p0: string;
  p1: string;
  p2: string;
  trensup: string;
  treninf: string;
}

interface ContentItem {
  id: string;
  titulo: string;
  url: string;
  estado: 'activo' | 'oculto';
}

const UNIDADES_ACADEMICAS = [
  "Dirección de Atención Estudiantil",
  "Bachillerato Internacional \"5 de mayo\"",
  "Complejo Regional Centro",
  "Complejo Regional Mixteca",
  "Complejo Regional Nororiental",
  "Complejo Regional Norte",
  "Complejo Regional Sur",
  "Facultad de Administración",
  "Facultad de Arquitectura",
  "Facultad de Artes",
  "Facultad de Artes Plásticas y Audiovisuales",
  "Facultad de Ciencias Agrícolas y Pecuarias",
  "Facultad de Ciencias Biológicas",
  "Facultad de Ciencias de la Computación",
  "Facultad de Ciencias de la Comunicación",
  "Facultad de Ciencias de la Electrónica",
  "Facultad de Ciencias Físico Matemáticas",
  "Facultad de Ciencias Políticas y Sociales",
  "Facultad de Ciencias Químicas",
  "Facultad de Contaduría Pública",
  "Facultad de Cultura Física",
  "Facultad de Derecho",
  "Facultad de Economía",
  "Facultad de Enfermería",
  "Facultad de Estomatología",
  "Facultad de Filosofía y Letras",
  "Facultad de Ingeniería",
  "Facultad de Ingeniería Química",
  "Facultad de Lenguas",
  "Facultad de Medicina",
  "Facultad de Medicina Veterinaria y Zootecnia",
  "Facultad de Psicología",
  "Instituto de Ciencias",
  "Instituto de Ciencias de Gobierno y Desarrollo Estratégico",
  "Instituto de Ciencias Sociales y Humanidades \"Alfonso Vélez Pliego\"",
  "Instituto de Física \"Luis Rivera Terrazas\"",
  "Instituto de Fisiología",
  "Preparatoria \"2 de Octubre de 1968\"",
  "Preparatoria \"Alfonso Calderón Moreno\"",
  "Preparatoria \"Emiliano Zapata\"",
  "Preparatoria \"Gral. Lázaro Cárdenas del Río\"",
  "Preparatoria \"Lic. Benito Juárez García\"",
  "Preparatoria Regional \"Enrique Cabrera Barroso\"",
  "Preparatoria Regional \"Simón Bolívar\"",
  "Preparatoria Urbana \"Enrique Cabrera Barroso\""
];

const DEFAULT_DB = {
  users: [
    { id: "ADMIN", password: "RETO2024", role: "admin", name: "Administrador del Sistema" } as Usuario
  ],
  content: {
    mes1: { cultura_fisica: [] as ContentItem[], nutricion: [] as ContentItem[] },
    mes2: { cultura_fisica: [] as ContentItem[], nutricion: [] as ContentItem[] },
    mes3: { cultura_fisica: [] as ContentItem[], nutricion: [] as ContentItem[] }
  },
  evaluations: {} as Record<string, Record<string, Evaluacion>>,
  surveys: {} as Record<string, any>
};

const num = (val: string | number) => parseFloat(val as string) || 0;

// === FUNCIONES DE CÁLCULO CLÍNICO ===
function clasificarIMC(peso: number, tallaCm: number) {
  if (!peso || !tallaCm) return { valor: '-', clasificacion: 'Ingresa peso y talla' };
  const tallaM = tallaCm / 100;
  const imc = peso / (tallaM * tallaM);
  let clasificacion = "";
  if (imc < 18.5) clasificacion = "Bajo Peso (Aumento sugerido)";
  else if (imc <= 24.9) clasificacion = "Saludable (Peso óptimo)";
  else if (imc <= 29.9) clasificacion = "Sobrepeso (Riesgo moderado)";
  else clasificacion = "Obesidad (Riesgo alto)";
  return { valor: imc.toFixed(1), clasificacion };
}

function clasificarICC(cintura: number, cadera: number, sexo: string) {
  if (!cintura || !cadera || !sexo) return { valor: '-', clasificacion: 'Faltan datos' };
  const icc = cintura / cadera;
  let clasificacion = "";
  if (sexo === 'femenino') {
    if (icc < 0.80) clasificacion = "Bajo Riesgo (Sano)";
    else if (icc <= 0.85) clasificacion = "Riesgo Medio (Precaución)";
    else clasificacion = "Riesgo Alto (Peligro)";
  } else {
    if (icc < 0.95) clasificacion = "Bajo Riesgo (Sano)";
    else if (icc <= 1.00) clasificacion = "Riesgo Medio (Precaución)";
    else clasificacion = "Riesgo Alto (Peligro)";
  }
  return { valor: icc.toFixed(2), clasificacion };
}

function clasificarGrasa(grasa: number, sexo: string, edad: number) {
  if (!grasa || !sexo || !edad) return "Faltan datos";
  if (sexo === 'femenino') {
    if (edad < 40) {
      if (grasa < 21) return "Bajo"; if (grasa <= 32.9) return "Normal"; if (grasa <= 38.9) return "Elevado"; return "Muy Elevado";
    } else if (edad <= 59) {
      if (grasa < 23) return "Bajo"; if (grasa <= 33.9) return "Normal"; if (grasa <= 39.9) return "Elevado"; return "Muy Elevado";
    } else {
      if (grasa < 24) return "Bajo"; if (grasa <= 35.9) return "Normal"; if (grasa <= 41.9) return "Elevado"; return "Muy Elevado";
    }
  } else {
    if (edad < 40) {
      if (grasa < 8) return "Bajo"; if (grasa <= 19.9) return "Normal"; if (grasa <= 24.9) return "Elevado"; return "Muy Elevado";
    } else if (edad <= 59) {
      if (grasa < 11) return "Bajo"; if (grasa <= 21.9) return "Normal"; if (grasa <= 27.9) return "Elevado"; return "Muy Elevado";
    } else {
      if (grasa < 13) return "Bajo"; if (grasa <= 24.9) return "Normal"; if (grasa <= 29.9) return "Elevado"; return "Muy Elevado";
    }
  }
}

function clasificarVisceral(nivel: number) {
  if (!nivel) return "Faltan datos";
  if (nivel <= 9) return "Normal (Saludable)";
  if (nivel <= 14) return "Alto (Riesgo)";
  return "Muy Alto (Peligro)";
}

function clasificarMusculo(musculo: number, sexo: string, edad: number) {
  if (!musculo || !sexo || !edad) return "Faltan datos";
  if (sexo === 'femenino') {
    if (edad < 40) {
      if (musculo < 24.3) return "Bajo"; if (musculo <= 30.3) return "Normal"; if (musculo <= 35.3) return "Atleta"; return "Exceso";
    } else if (edad <= 59) {
      if (musculo < 24.1) return "Bajo"; if (musculo <= 30.1) return "Normal"; if (musculo <= 35.1) return "Atleta"; return "Exceso";
    } else {
      if (musculo < 23.9) return "Bajo"; if (musculo <= 29.9) return "Normal"; if (musculo <= 34.9) return "Atleta"; return "Exceso";
    }
  } else {
    if (edad < 40) {
      if (musculo < 33.3) return "Bajo"; if (musculo <= 39.3) return "Normal"; if (musculo <= 44.0) return "Atleta"; return "Exceso";
    } else if (edad <= 59) {
      if (musculo < 33.1) return "Bajo"; if (musculo <= 39.1) return "Normal"; if (musculo <= 43.8) return "Atleta"; return "Exceso";
    } else {
      if (musculo < 32.9) return "Bajo"; if (musculo <= 38.9) return "Normal"; if (musculo <= 43.6) return "Atleta"; return "Exceso";
    }
  }
}

function calcularRuffier(p0: number, p1: number, p2: number) {
  if (!p0 || !p1 || !p2) return { valor: '-', clasificacion: 'Faltan pulsaciones' };
  const index = ((p0 + p1 + p2) - 200) / 10;
  let clasificacion = "";
  if (index <= 0) clasificacion = "Excelente (Corazón Atleta)";
  else if (index <= 5.0) clasificacion = "Bueno (Óptimo)";
  else if (index <= 10.0) clasificacion = "Regular (Mejora Sugerida)";
  else clasificacion = "Malo (Atención Necesaria)";
  return { valor: index.toFixed(1), clasificacion };
}

function clasificarTrenSuperior(reps: number, sexo: string, edad: number) {
  if (!reps || !sexo || !edad) return "Faltan datos";
  if (sexo === 'femenino') {
    if (edad < 29) {
      if (reps >= 30) return "Excelente"; if (reps >= 15) return "Bueno"; if (reps >= 12) return "Promedio"; return "Pobre";
    } else {
      if (reps >= 27) return "Excelente"; if (reps >= 13) return "Bueno"; if (reps >= 10) return "Promedio"; return "Pobre";
    }
  } else {
    if (edad < 29) {
      if (reps >= 36) return "Excelente"; if (reps >= 22) return "Bueno"; if (reps >= 17) return "Promedio"; return "Pobre";
    } else {
      if (reps >= 30) return "Excelente"; if (reps >= 17) return "Bueno"; if (reps >= 11) return "Promedio"; return "Pobre";
    }
  }
}

function clasificarTrenInferior(reps: number, sexo: string) {
  if (!reps || !sexo) return "Faltan datos";
  if (sexo === 'femenino') {
    if (reps > 44) return "Excelente (Élite)"; if (reps >= 39) return "Bueno (Óptimo)"; if (reps >= 33) return "Promedio (Estándar)"; if (reps >= 29) return "Regular (Bajo)"; return "Malo (Deficiente)";
  } else {
    if (reps > 48) return "Excelente (Élite)"; if (reps >= 43) return "Bueno (Óptimo)"; if (reps >= 37) return "Promedio (Estándar)"; if (reps >= 33) return "Regular (Bajo)"; return "Malo (Deficiente)";
  }
}

function analizarEvaluacionCompleta(datos: any) {
  const n = num;
  return {
    imc: clasificarIMC(n(datos.peso), n(datos.talla)),
    icc: clasificarICC(n(datos.cintura), n(datos.cadera), datos.sexo),
    grasa: clasificarGrasa(n(datos.grasa), datos.sexo, n(datos.edad)),
    visceral: clasificarVisceral(n(datos.visceral)),
    musculo: clasificarMusculo(n(datos.musculo), datos.sexo, n(datos.edad)),
    ruffier: calcularRuffier(n(datos.p0), n(datos.p1), n(datos.p2)),
    superior: clasificarTrenSuperior(n(datos.trensup), datos.sexo, n(datos.edad)),
    inferior: clasificarTrenInferior(n(datos.treninf), datos.sexo)
  };
}

const colorClass = (text: string) => {
  if (text.includes('Falta')) return 'text-gray-500';
  if (/Excelente|Sano|Atleta|Óptimo/.test(text)) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';
  if (/Promedio|Normal/.test(text)) return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]';
  if (/Regular|Elevado|Riesgo Medio|Sobrepeso/.test(text)) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]';
  return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]';
};

// --- INFO DE LAS GRÁFICAS PARA EL MODAL ---
const CHART_INFO: Record<string, {desc: string, obj: string}> = {
  "EVOLUCIÓN IMC VS PESO": { desc: "Relación entre tu peso total (kg) y tu estatura al cuadrado.", obj: "Identificar tu categoría general de composición corporal (Normal, Sobrepeso, etc.) para establecer una línea base de salud." },
  "MEDIDAS CORPORALES (CM)": { desc: "Historial de las circunferencias de tu cintura y cadera.", obj: "Evaluar la distribución de grasa. Una menor relación cintura-cadera reduce drásticamente los riesgos cardiovasculares." },
  "COMPOSICIÓN CORPORAL (%)": { desc: "Porcentajes estimados de masa grasa, masa muscular esquelética y nivel de grasa visceral.", obj: "Mejorar la calidad de tu peso. El objetivo no es solo pesar menos, sino perder grasa y ganar músculo." },
  "RENDIMIENTO CARDIOVASCULAR": { desc: "Registro del Índice de Ruffier Dickson y tus pulsaciones en reposo (P0), post-ejercicio (P1) y recuperación (P2).", obj: "Medir la capacidad de tu corazón para adaptarse y recuperarse de un esfuerzo físico intenso." },
  "FUERZA MUSCULAR (REPS)": { desc: "Repeticiones máximas logradas en 1 minuto para tren superior (lagartijas) e inferior (sentadillas).", obj: "Evaluar la fuerza resistencia, fundamental para la funcionalidad diaria y la protección de tus articulaciones." }
};

// --- CSS ESTILOS GLOBALES (INLINE) ---
const globalStyles = `
  @keyframes gradientBg {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-bg {
    background-size: 200% 200%;
    animation: gradientBg 15s ease infinite;
  }
  .scanlines {
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.15));
    background-size: 100% 4px;
    pointer-events: none;
  }
  .glass-panel {
    background: rgba(5, 10, 20, 0.65);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  }
  .glass-input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }
  .glass-input:focus {
    background: rgba(0, 0, 0, 0.5);
    border-color: #00e5ff;
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
    outline: none;
  }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #060e1a; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #ffcc00; }
`;

export default function App() {
  const [db, setDb] = useState<typeof DEFAULT_DB>(DEFAULT_DB);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const local = localStorage.getItem('retoActivateDB_v4');
    if (local) {
      try { setDb(JSON.parse(local)); } catch (e) { console.error("Error parsing DB", e); }
    }
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); }
  }, []);

  const saveDB = (newDb: typeof DEFAULT_DB) => {
    setDb(newDb);
    localStorage.setItem('retoActivateDB_v4', JSON.stringify(newDb));
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const currentUser = db.users.find(u => u.id === currentUserId) || null;

  return (
    <div className="h-screen w-full font-sans text-gray-200 antialiased overflow-hidden flex bg-[#030712] animate-gradient-bg bg-gradient-to-br from-[#020b18] via-[#001f3f] to-[#011222] relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 scanlines z-0"></div>
      
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center space-x-3 text-white transition-all transform duration-300 animate-bounce backdrop-blur-md border
          ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : toast.type === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
          <span className="font-bold tracking-wide">{toast.msg}</span>
        </div>
      )}

      {!currentUser ? (
        <LoginView db={db} onLogin={(user) => { setCurrentUserId(user.id); showToast(`¡Bienvenido ${user.name}!`); }} />
      ) : currentUser.role === 'admin' ? (
        <AdminView db={db} saveDB={saveDB} onLogout={() => setCurrentUserId(null)} showToast={showToast} />
      ) : (
        <StudentView db={db} saveDB={saveDB} user={currentUser} onLogout={() => setCurrentUserId(null)} showToast={showToast} />
      )}
    </div>
  );
}

function LoginView({ db, onLogin }: { db: typeof DEFAULT_DB, onLogin: (u: Usuario) => void }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.users.find(u => 
      (u.id === id && u.password === password) || 
      (u.id === 'ADMIN' && id.toUpperCase() === 'ADMIN' && password === 'RETO2024')
    );
    if (user) onLogin(user);
    else alert("Credenciales incorrectas"); 
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative z-50">
      <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] w-[90%] max-w-md text-center transform transition-all relative z-10 border-t border-l border-white/10 before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-[#003b5c]/50 before:to-transparent before:rounded-[2.5rem]">
        <div className="mb-8 flex justify-center relative">
          <div className="absolute inset-0 bg-[#ffcc00] blur-[40px] opacity-20 rounded-full animate-pulse"></div>
          <div className="w-32 h-32 bg-gradient-to-tr from-[#ffcc00] to-[#fff0a8] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,204,0,0.4)] border-4 border-[#001f3f] relative z-10">
            <Zap className="text-[#001f3f] w-16 h-16 fill-current" strokeWidth={1} />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-2 tracking-tight drop-shadow-md uppercase italic">RETO ACTÍVATE ESTUDIANTIL</h1>
        <h2 className="text-sm text-[#ffcc00] mb-10 font-bold tracking-[0.3em] uppercase">Plataforma Oficial</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#00e5ff] transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input type="text" required placeholder="Matrícula / ID Institucional" value={id} onChange={e => setId(e.target.value)}
              className="glass-input block w-full pl-14 pr-4 py-4 rounded-2xl transition-all placeholder-gray-500 font-medium tracking-wide" />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#00e5ff] transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input type={showPwd ? "text" : "password"} required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
              className="glass-input block w-full pl-14 pr-12 py-4 rounded-2xl transition-all placeholder-gray-500 font-medium tracking-wide" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-[#00e5ff] focus:outline-none transition-colors">
              {showPwd ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
            </button>
          </div>
          
          <button type="submit" className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-[0_0_20px_rgba(0,180,216,0.3)] text-lg font-black text-[#001f3f] bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6] hover:text-white transition-all transform hover:scale-[1.02] uppercase tracking-widest mt-4">
            Ingresar al Sistema <ChevronRight className="ml-2 w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminView({ db, saveDB, onLogout, showToast }: any) {
  const [tab, setTab] = useState<'usuarios' | 'historial' | 'contenido'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');

  const [alta, setAlta] = useState({ nombre: '', matricula: '', password: '', unidad: '' });
  const [cont, setCont] = useState({ mes: 'mes1', categoria: 'cultura_fisica', estado: 'activo', titulo: '', url: '' });

  const handleAlta = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.users.find((u: any) => u.id === alta.matricula)) return showToast("Matrícula existente", "error");
    const newDb = { ...db, users: [...db.users, { id: alta.matricula, name: alta.nombre, password: alta.password, unidad: alta.unidad, role: 'student', surveyEnabled: false, viewedContent: [] }] };
    saveDB(newDb);
    setAlta({ nombre: '', matricula: '', password: '', unidad: '' });
    showToast("Alumno registrado exitosamente");
  };

  const handleBorrarUsuario = (id: string) => {
    if(!window.confirm(`¿Seguro que quieres borrar a este usuario (Matrícula: ${id})?`)) return;
    const newDb = { ...db, users: db.users.filter((u:any) => u.id !== id) };
    delete newDb.evaluations[id];
    delete newDb.surveys[id];
    saveDB(newDb);
    showToast("Usuario borrado");
  };

  const handleAgregarContenido = (e: React.FormEvent) => {
    e.preventDefault();
    const newDb = { ...db };
    newDb.content[cont.mes as keyof typeof db.content][cont.categoria as 'cultura_fisica'|'nutricion'].push({ id: Date.now().toString(), titulo: cont.titulo, url: cont.url, estado: cont.estado as 'activo'|'oculto' });
    saveDB(newDb);
    setCont({ ...cont, titulo: '', url: '' });
    showToast("Contenido agregado exitosamente");
  };

  const toggleEncuestaIndividual = (userId: string) => {
    const newDb = { ...db };
    const user = newDb.users.find((u:any) => u.id === userId);
    if(user) {
      user.surveyEnabled = !user.surveyEnabled;
      saveDB(newDb);
      showToast(user.surveyEnabled ? `Encuesta habilitada para ${user.name}` : `Encuesta deshabilitada para ${user.name}`, "info");
    }
  };

  const descargarHistorial = () => {
    let csv = "Matricula,Nombre,Fase,Fecha,Sexo,Edad,Peso,Talla,Cintura,Cadera,IMC,Grasa_%,Grasa_Visceral,Musculo_%,P0,P1,P2,Ruffier_Index,Tren_Sup_Reps,Tren_Inf_Reps\n";
    db.users.filter((u:any)=>u.role==='student').forEach((student:any) => {
      if(db.evaluations[student.id]) {
        Object.keys(db.evaluations[student.id]).forEach(fase => {
          const d = db.evaluations[student.id][fase];
          if(d) {
            const res = analizarEvaluacionCompleta(d);
            csv += `${student.id},${student.name},${fase},${d._fecha},${d.sexo},${d.edad},${d.peso},${d.talla},${d.cintura},${d.cadera},${res.imc.valor},${d.grasa},${d.visceral},${d.musculo},${d.p0},${d.p1},${d.p2},${res.ruffier.valor},${d.trensup},${d.treninf}\n`;
          }
        });
      }
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "historial_global_buap.csv";
    a.click();
  };

  const descargarWordUsuario = (student: any) => {
    const evalData = db.evaluations[student.id] || {};
    const surveyData = db.surveys[student.id];
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Reporte de ${student.name}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
          h1 { color: #003b5c; text-align: center; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; }
          h2 { color: #005587; text-align: center; margin-top: 30px; }
          h3 { color: #ffffff; background-color: #003b5c; padding: 10px; border-radius: 5px; text-transform: uppercase; margin-top: 20px; font-size: 14px; }
          .info-box { background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px; }
          th { background-color: #e0e0e0; width: 30%; }
        </style>
      </head>
      <body>
        <h1>RETO ACTÍVATE ESTUDIANTIL</h1>
        <h2>Reporte Individual de Evaluación</h2>
        
        <div class="info-box">
          <p><strong>Estudiante:</strong> ${student.name}</p>
          <p><strong>Matrícula/ID:</strong> ${student.id}</p>
          <p><strong>Unidad Académica:</strong> ${student.unidad}</p>
        </div>
    `;

    const fases = ['inicial', 'mes1', 'mes2', 'mes3'];
    let hasData = false;

    fases.forEach(fase => {
      if (evalData[fase]) {
        hasData = true;
        const d = evalData[fase];
        const res = analizarEvaluacionCompleta(d);
        htmlContent += `
          <div>
            <h3>Fase: ${fase.toUpperCase()} (Registrado: ${d._fecha})</h3>
            <table>
              <tr><th>Edad</th><td>${d.edad} años</td><th>Sexo</th><td>${d.sexo.toUpperCase()}</td></tr>
              <tr><th>Peso Corporal</th><td>${d.peso} kg</td><th>Estatura / Talla</th><td>${d.talla} cm</td></tr>
              <tr><th>Cintura</th><td>${d.cintura} cm</td><th>Cadera</th><td>${d.cadera} cm</td></tr>
              <tr><th>Índice Masa Corporal (IMC)</th><td>${res.imc.valor} - <em>${res.imc.clasificacion}</em></td><th>Índice Cintura Cadera (ICC)</th><td>${res.icc.valor} - <em>${res.icc.clasificacion}</em></td></tr>
              <tr><th>% Grasa Corporal</th><td>${d.grasa}% - <em>${res.grasa}</em></td><th>% Músculo Esquelético</th><td>${d.musculo}% - <em>${res.musculo}</em></td></tr>
              <tr><th>Nivel Grasa Visceral</th><td>${d.visceral} - <em>${res.visceral}</em></td><th>Índice Ruffier Dickson</th><td>${res.ruffier.valor} - <em>${res.ruffier.clasificacion}</em></td></tr>
              <tr><th>Fuerza Tren Superior</th><td>${d.trensup} reps - <em>${res.superior}</em></td><th>Fuerza Tren Inferior</th><td>${d.treninf} reps - <em>${res.inferior}</em></td></tr>
            </table>
          </div>
        `;
      }
    });

    if (!hasData) {
      htmlContent += `<p style="text-align: center; color: #777;"><em>El estudiante aún no cuenta con datos de evaluación física registrados.</em></p>`;
    }

    htmlContent += `<h2>Expediente Clínico (Encuesta de Salud)</h2>`;

    if (surveyData) {
      htmlContent += `
        <div>
          <h3>I. Salud Física y Clínica</h3>
          <table>
            <tr><th>Condición Crónica</th><td>${surveyData.cronica || 'N/A'}</td></tr>
            <tr><th>Dolor Crónico / Lesiones</th><td>${surveyData.dolor || 'N/A'}</td></tr>
            <tr><th>Limitación Específica</th><td>${surveyData.limitacion || 'N/A'}</td></tr>
            <tr><th>Medicamentos Actuales</th><td>${surveyData.meds || 'N/A'}</td></tr>
            <tr><th>Defectos de Postura</th><td>${surveyData.postura || 'N/A'}</td></tr>
            <tr><th>Antecedentes Familiares</th><td>${surveyData.familia || 'N/A'}</td></tr>
          </table>

          <h3>II. Objetivos y Actividad</h3>
          <table>
            <tr><th>Objetivo principal</th><td>${surveyData.objetivo || 'N/A'}</td></tr>
            <tr><th>Nivel de actividad actual</th><td>${surveyData.actividad || 'N/A'}</td></tr>
            <tr><th>Deporte en el pasado</th><td>${surveyData.pasado || 'N/A'}</td></tr>
            <tr><th>Actividades atractivas</th><td>${surveyData.atractivas || 'N/A'}</td></tr>
          </table>

          <h3>III. Logística de Entrenamiento</h3>
          <table>
            <tr><th>Tiempo disponible</th><td>${surveyData.tiempo || 'N/A'}</td></tr>
            <tr><th>Lugar de entreno</th><td>${surveyData.lugar || 'N/A'}</td></tr>
            <tr><th>Implementos en casa</th><td>${surveyData.implementos || 'N/A'}</td></tr>
            <tr><th>Cardio y Fuerza</th><td>${surveyData.preferencia || 'N/A'}</td></tr>
            <tr><th>Mayor obstáculo</th><td>${surveyData.obstaculo || 'N/A'}</td></tr>
          </table>

          <h3>IV. Bienestar y Estilo de Vida</h3>
          <table>
            <tr><th>Calidad de sueño</th><td>${surveyData.sueno || 'N/A'}</td></tr>
            <tr><th>Nivel de energía</th><td>${surveyData.energia || 'N/A'}</td></tr>
            <tr><th>Tipo de motivación</th><td>${surveyData.motivacion || 'N/A'}</td></tr>
          </table>

          <h3>V. Contacto Institucional</h3>
          <table>
            <tr><th>Correo Institucional</th><td>${surveyData.correo || 'N/A'}</td></tr>
            <tr><th>Teléfono de contacto</th><td>${surveyData.telefono || 'N/A'}</td></tr>
            <tr><th>Horario de contacto</th><td>${surveyData.horario || 'N/A'}</td></tr>
          </table>
        </div>
      `;
    } else {
      htmlContent += `<p style="text-align: center; color: #777;"><em>El estudiante no ha completado el Expediente Clínico de salud.</em></p>`;
    }

    htmlContent += `</body></html>`;

    // Truco de formato y descarga
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${student.id}_${student.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Reporte generado para ${student.name}`);
  };

  const descargarPlantilla = () => {
    // Se agrega \uFEFF para que Excel detecte la codificación UTF-8 (Acentos y Ñ)
    const csvContent = "\uFEFFNombre,Matricula,Contraseña,Unidad_Academica\nEjemplo Estudiante,202612345,Clave123,Facultad de Cultura Física\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_carga_masiva.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Plantilla descargada exitosamente");
  };

  const filteredStudents = db.users.filter((u:any) => 
    u.role === 'student' && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex w-full h-full relative z-10">
      <aside className="w-72 glass-panel border-r border-white/10 flex flex-col shadow-2xl flex-shrink-0 z-20">
        <div className="p-8 flex items-center space-x-4 border-b border-white/10">
          <div className="bg-gradient-to-br from-[#00e5ff] to-[#0077b6] text-[#001f3f] p-3 rounded-2xl shadow-[0_0_15px_rgba(0,229,255,0.4)]"><Shield className="w-7 h-7"/></div>
          <div><h2 className="text-xl font-black text-white italic">ADMIN</h2><p className="text-xs text-[#ffcc00] font-bold tracking-widest">SISTEMA CENTRAL</p></div>
        </div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          <SidebarBtn active={tab === 'usuarios'} onClick={() => setTab('usuarios')} icon={<Users/>} label="Gestión Usuarios" />
          <SidebarBtn active={tab === 'historial'} onClick={() => setTab('historial')} icon={<ChartIcon/>} label="Historial Global" />
          <SidebarBtn active={tab === 'contenido'} onClick={() => setTab('contenido')} icon={<Image/>} label="Contenido Edu." />
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-4 bg-rose-500/10 border border-rose-500/50 text-rose-400 rounded-2xl hover:bg-rose-500/20 hover:text-rose-300 transition-all font-bold tracking-wide">
            <LogOut className="w-5 h-5"/> <span>Salir del Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="glass-panel border-b border-white/10 px-10 py-6 flex justify-between items-center flex-shrink-0 shadow-md z-10">
          <h1 className="text-2xl font-black text-white italic tracking-wide">
            {tab === 'usuarios' ? 'Gestión de Accesos' : tab === 'historial' ? 'Historial Analítico' : 'Gestor de Contenidos'}
          </h1>
          <span className="text-xs font-black bg-[#ffcc00]/10 text-[#ffcc00] px-4 py-2 rounded-full border border-[#ffcc00]/30 tracking-widest">PANEL ADMINISTRATIVO</span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* ===================== TAB USUARIOS ===================== */}
          {tab === 'usuarios' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-panel p-8 rounded-3xl lg:col-span-2 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                  <h3 className="text-xl font-black mb-6 text-white border-b border-white/10 pb-4 flex items-center"><UserCheck className="mr-3 text-cyan-400"/> Alta Manual Estudiante</h3>
                  <form onSubmit={handleAlta} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" required placeholder="Nombre Completo" value={alta.nombre} onChange={e=>setAlta({...alta, nombre: e.target.value})} className="glass-input p-4 rounded-xl" />
                    <input type="text" required placeholder="Matrícula" value={alta.matricula} onChange={e=>setAlta({...alta, matricula: e.target.value})} className="glass-input p-4 rounded-xl" />
                    <input type="text" required placeholder="Contraseña" value={alta.password} onChange={e=>setAlta({...alta, password: e.target.value})} className="glass-input p-4 rounded-xl" />
                    <select required value={alta.unidad} onChange={e=>setAlta({...alta, unidad: e.target.value})} className="glass-input p-4 rounded-xl [&>option]:bg-[#001f3f] [&>option]:text-white">
                      <option value="">Seleccione Unidad Académica...</option>
                      {UNIDADES_ACADEMICAS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <div className="md:col-span-2 flex justify-end mt-4">
                      <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] font-black transition-all transform hover:-translate-y-1 uppercase tracking-widest text-sm">Registrar Alumno</button>
                    </div>
                  </form>
                </div>

                <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden text-center border border-emerald-500/20">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
                  <h3 className="text-xl font-black mb-6 text-white border-b border-white/10 pb-4 flex items-center justify-center"><Upload className="mr-3 text-emerald-400"/> Carga Masiva</h3>
                  <div className="flex flex-col space-y-6">
                    <button type="button" onClick={descargarPlantilla} className="text-emerald-400 font-bold text-sm flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/20 transition-colors"><Download className="w-5 h-5 mr-3"/> Descargar Plantilla (CSV)</button>
                    <label className="cursor-pointer border-2 border-dashed border-emerald-500/50 bg-[#001f3f]/50 rounded-2xl p-8 hover:bg-emerald-500/10 transition-colors group">
                      <Upload className="w-12 h-12 text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:text-emerald-300"/>
                      <span className="font-bold text-emerald-100 block">Subir Archivo (.csv)</span>
                      <input type="file" className="hidden" accept=".csv" onChange={() => { showToast("Simulando carga masiva..."); setTimeout(() => showToast("Carga masiva completada", "success"), 1500); }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="font-black text-white flex items-center text-lg"><Users className="mr-3 text-cyan-400"/> Directorio Activo</h3>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none"/>
                    <input 
                      type="text" 
                      placeholder="Buscar por Nombre o Matrícula..." 
                      className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium tracking-wide"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-widest">
                      <tr>
                        <th className="p-5 font-black">Matrícula</th>
                        <th className="p-5 font-black">Nombre</th>
                        <th className="p-5 font-black">Unidad</th>
                        <th className="p-5 font-black">Clave</th>
                        <th className="p-5 text-center font-black">Exp. Clínico</th>
                        <th className="p-5 text-center font-black">Reporte</th>
                        <th className="p-5 text-center font-black">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredStudents.map((s:any) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-black text-cyan-400">{s.id}</td>
                          <td className="p-5 font-bold text-white">{s.name}</td>
                          <td className="p-5 text-xs text-gray-400">{s.unidad}</td>
                          <td className="p-5 font-mono text-gray-400 bg-black/30 rounded px-3 py-1 inline-block mt-2 border border-white/5">{s.password}</td>
                          <td className="p-5 text-center">
                            <button onClick={()=>toggleEncuestaIndividual(s.id)} className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all border ${s.surveyEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700'}`}>
                              {s.surveyEnabled ? 'Activado' : 'Desactivado'}
                            </button>
                          </td>
                          <td className="p-5 text-center">
                            <button onClick={() => descargarWordUsuario(s)} className="bg-blue-500/10 text-blue-400 border border-blue-500/30 p-3 rounded-xl hover:bg-blue-500/20 hover:border-blue-400 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.1)]" title={`Descargar Reporte Word de ${s.name}`}>
                              <FileText className="w-5 h-5 mx-auto"/>
                            </button>
                          </td>
                          <td className="p-5 text-center">
                            <button onClick={()=>handleBorrarUsuario(s.id)} className="text-rose-400 hover:text-rose-200 bg-rose-500/10 p-3 rounded-xl hover:bg-rose-500/20 transition-colors border border-rose-500/20" title="Borrar Usuario"><Trash2 className="w-5 h-5 mx-auto"/></button>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan={7} className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest">No se encontraron estudiantes registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB HISTORIAL ===================== */}
          {tab === 'historial' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="glass-panel rounded-3xl overflow-hidden">
                 <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                  <h3 className="font-black text-white text-lg flex items-center tracking-wide uppercase"><TrendingUp className="mr-3 text-emerald-400"/> Evaluaciones Globales</h3>
                  <button onClick={descargarHistorial} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-black shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center transition-all transform hover:-translate-y-0.5 uppercase tracking-widest text-xs">
                    <Download className="w-5 h-5 mr-2"/> Exportar Analítico (CSV)
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-widest">
                      <tr><th className="p-5">Fase</th><th className="p-5">Estudiante</th><th className="p-5">Composición Física</th><th className="p-5">Rendimiento Físico</th><th className="p-5 text-center">Borrar</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {db.users.filter((u:any)=>u.role==='student').map((student:any) => {
                        if(!db.evaluations[student.id]) return null;
                        return Object.keys(db.evaluations[student.id]).map(fase => {
                          const d = db.evaluations[student.id][fase];
                          const res = analizarEvaluacionCompleta(d);
                          return (
                            <tr key={`${student.id}-${fase}`} className="hover:bg-white/5 transition-colors">
                              <td className="p-5 uppercase text-xs font-black text-[#ffcc00] bg-[#ffcc00]/5">{fase}</td>
                              <td className="p-5"><div className="font-black text-white">{student.name}</div><div className="text-xs text-cyan-500 mt-1">{student.id}</div></td>
                              <td className="p-5 text-xs space-y-1">
                                <div><span className="font-bold text-gray-500">IMC:</span> {res.imc.valor} ({res.imc.clasificacion})</div>
                                <div><span className="font-bold text-gray-500">Grasa:</span> <span className="text-white">{d.grasa}%</span> | <span className="font-bold text-gray-500">Músculo:</span> <span className="text-white">{d.musculo}%</span></div>
                              </td>
                              <td className="p-5 text-xs space-y-1">
                                <div><span className="font-bold text-gray-500">Ruffier:</span> {res.ruffier.clasificacion}</div>
                                <div><span className="font-bold text-gray-500">T.Sup:</span> <span className="text-white">{d.trensup}</span> | <span className="font-bold text-gray-500">T.Inf:</span> <span className="text-white">{d.treninf}</span></div>
                              </td>
                              <td className="p-5 text-center">
                                <button onClick={() => {
                                  if(window.confirm("¿Borrar historial de esta fase específica?")) {
                                    const newDb = {...db}; delete newDb.evaluations[student.id][fase]; saveDB(newDb);
                                  }
                                }} className="text-rose-400 hover:text-rose-200 bg-rose-500/10 p-3 rounded-xl hover:bg-rose-500/20 transition-colors border border-rose-500/20"><Trash2 className="w-5 h-5 mx-auto"/></button>
                              </td>
                            </tr>
                          );
                        })
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB CONTENIDO ===================== */}
          {tab === 'contenido' && (
             <div className="space-y-8 max-w-7xl mx-auto">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  <h3 className="text-xl font-black mb-6 text-white border-b border-white/10 pb-4 flex items-center tracking-wide uppercase"><Youtube className="mr-3 text-rose-500"/> Añadir Nuevo Contenido</h3>
                  <form onSubmit={handleAgregarContenido} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <select value={cont.mes} onChange={e=>setCont({...cont, mes: e.target.value})} className="glass-input p-4 rounded-xl font-bold [&>option]:bg-[#001f3f]"><option value="mes1">Módulo Mes 1</option><option value="mes2">Módulo Mes 2</option><option value="mes3">Módulo Mes 3</option></select>
                        <select value={cont.categoria} onChange={e=>setCont({...cont, categoria: e.target.value})} className="glass-input p-4 rounded-xl font-bold [&>option]:bg-[#001f3f]"><option value="cultura_fisica">Cultura Física</option><option value="nutricion">Nutrición</option></select>
                        <select value={cont.estado} onChange={e=>setCont({...cont, estado: e.target.value})} className="glass-input p-4 rounded-xl font-bold [&>option]:bg-[#001f3f]"><option value="activo">Visible (Activo)</option><option value="oculto">Oculto</option></select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input type="text" required placeholder="Título del Video o Artículo" value={cont.titulo} onChange={e=>setCont({...cont, titulo: e.target.value})} className="glass-input p-4 rounded-xl" />
                        <input type="url" required placeholder="URL (Enlace completo YouTube/Web)" value={cont.url} onChange={e=>setCont({...cont, url: e.target.value})} className="glass-input p-4 rounded-xl" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-10 py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] font-black uppercase tracking-widest text-sm transition-all transform hover:-translate-y-1">Añadir Recurso</button>
                    </div>
                  </form>
              </div>

              <div className="glass-panel p-8 rounded-3xl space-y-8">
                 <h3 className="text-xl font-black mb-2 text-white border-b border-white/10 pb-4 tracking-wide uppercase">Contenido Publicado</h3>
                 {['mes1','mes2','mes3'].map(mes => (
                    <div key={mes} className="mb-6 bg-black/30 p-6 rounded-2xl border border-white/5">
                      <h4 className="font-black uppercase text-[#ffcc00] mb-6 text-lg border-b-2 border-[#ffcc00]/50 inline-block pb-1 tracking-widest">{mes}</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {['cultura_fisica', 'nutricion'].map(cat => {
                          const items = db.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'];
                          return (
                            <div key={cat} className="glass-panel p-5 rounded-2xl">
                              <h5 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center ${cat === 'cultura_fisica' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                {cat === 'cultura_fisica' ? <Dumbbell className="w-5 h-5 mr-3"/> : <HeartPulse className="w-5 h-5 mr-3"/>} {cat.replace('_', ' ')}
                              </h5>
                              {items.length === 0 ? <p className="text-xs text-gray-500 italic font-bold">Sin contenido asignado.</p> : (
                                <ul className="space-y-3">
                                  {items.map((it:any) => (
                                    <li key={it.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 text-sm hover:border-cyan-500/30 transition-colors">
                                      <a href={it.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white font-bold flex-1 truncate mr-4 flex items-center">
                                        {it.estado === 'activo' ? <Eye className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0"/> : <EyeOff className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0"/>}
                                        {it.titulo}
                                      </a>
                                      <div className="space-x-2 flex-shrink-0 flex">
                                        <button onClick={()=>{
                                          const newDb = {...db}; 
                                          const target = newDb.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'].find((x:any)=>x.id===it.id);
                                          if(target) target.estado = target.estado === 'activo' ? 'oculto' : 'activo';
                                          saveDB(newDb);
                                        }} className={`text-xs px-4 py-2 rounded-xl font-black uppercase tracking-widest border ${it.estado === 'activo' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>{it.estado === 'activo' ? 'Ocultar' : 'Activar'}</button>
                                        <button onClick={()=>{
                                          if(!window.confirm("¿Eliminar este contenido?")) return;
                                          const newDb = {...db}; 
                                          newDb.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'] = newDb.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'].filter((x:any)=>x.id!==it.id);
                                          saveDB(newDb);
                                        }} className="text-rose-400 bg-rose-500/10 p-2 rounded-xl hover:bg-rose-500/20 border border-rose-500/20"><Trash2 className="w-4 h-4"/></button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function SidebarBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-4 px-5 py-4 text-sm font-black rounded-2xl transition-all uppercase tracking-wider ${active ? 'text-[#001f3f] bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <span className="w-6">{icon}</span> <span>{label}</span>
    </button>
  );
}

function StudentView({ db, saveDB, user, onLogout, showToast }: any) {
  const [tab, setTab] = useState<'registro' | 'contenido' | 'evolucion'>('registro'); 
  const [fase, setFase] = useState('inicial');
  const [showSurvey, setShowSurvey] = useState(false);

  return (
    <div className="flex w-full h-full relative z-10">
      <aside className="w-20 md:w-80 glass-panel border-r border-white/10 flex flex-col shadow-2xl flex-shrink-0 z-20">
        <div className="p-8 flex flex-col items-center justify-center md:items-start border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00]/10 blur-[40px] rounded-full pointer-events-none"></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-[#ffcc00] to-[#fff0a8] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,204,0,0.3)] border-4 border-[#001f3f] mb-4 relative z-10">
            <UserCheck className="w-10 h-10 text-[#001f3f]"/>
          </div>
          <div className="hidden md:block w-full text-center md:text-left relative z-10">
            <h2 className="text-xl font-black text-white italic leading-tight truncate uppercase">{user.name}</h2>
            <p className="text-sm font-black text-[#00e5ff] mt-1 tracking-widest">{user.id}</p>
            <p className="text-[10px] text-gray-400 mt-2 truncate font-bold uppercase tracking-wider bg-black/30 inline-block px-2 py-1 rounded border border-white/5">{user.unidad}</p>
          </div>
        </div>
        <nav className="flex-1 p-5 space-y-4 overflow-y-auto">
          <SidebarBtn active={tab === 'registro'} onClick={() => setTab('registro')} icon={<ClipboardList/>} label="Registrar Datos" />
          <SidebarBtn active={tab === 'contenido'} onClick={() => setTab('contenido')} icon={<PlayCircle/>} label="Zona Educativa" />
          <SidebarBtn active={tab === 'evolucion'} onClick={() => setTab('evolucion')} icon={<Trophy/>} label="Logros y Evolución" />
          
          {user.surveyEnabled && (
            <div className="pt-5 border-t border-white/10 mt-5">
              <button onClick={() => setShowSurvey(true)} className="w-full flex items-center justify-center md:justify-start space-x-4 px-5 py-5 text-sm font-black rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-[#001f3f] hover:from-emerald-300 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] transform hover:scale-[1.02] uppercase tracking-widest group">
                 <Stethoscope className="w-6 h-6"/> <span className="hidden md:inline">Expediente Clínico</span>
              </button>
            </div>
          )}
        </nav>
        <div className="p-5 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center justify-center md:justify-start space-x-3 px-5 py-4 border border-rose-500/30 text-rose-400 rounded-2xl hover:bg-rose-500/10 hover:text-rose-300 font-bold transition-all uppercase tracking-wide">
            <LogOut className="w-5 h-5"/> <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="glass-panel border-b border-white/10 px-6 md:px-10 py-6 flex justify-between items-center flex-shrink-0 z-10 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-wide uppercase drop-shadow-lg flex items-center">
            {tab === 'registro' ? <><Activity className="mr-3 text-cyan-400"/> Mi Registro Físico</> : 
             tab === 'contenido' ? <><Youtube className="mr-3 text-rose-500"/> Centro Educativo</> : 
             <><Crown className="mr-3 text-[#ffcc00]"/> Panel de Evolución</>}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 relative z-0">
          {tab === 'registro' && <StudentRegistro db={db} saveDB={saveDB} user={user} fase={fase} setFase={setFase} showToast={showToast}/>}
          {tab === 'contenido' && <StudentContenido db={db} saveDB={saveDB} user={user} showToast={showToast}/>}
          {tab === 'evolucion' && <StudentEvolucion db={db} user={user}/>}
        </div>
      </main>

      {showSurvey && <SurveyModal db={db} saveDB={saveDB} user={user} onClose={()=>setShowSurvey(false)} showToast={showToast} />}
    </div>
  );
}

function StudentRegistro({ db, saveDB, user, fase, setFase, showToast }: any) {
  const savedData = db.evaluations[user.id]?.[fase];
  const isReadOnly = !!savedData;
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (savedData) setForm(savedData);
    else setForm({ sexo: '', edad: '', peso: '', talla: '', cintura: '', cadera: '', grasa: '', visceral: '', musculo: '', p0: '', p1: '', p2: '', trensup: '', treninf: '' });
  }, [fase, savedData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDb = { ...db };
    if(!newDb.evaluations[user.id]) newDb.evaluations[user.id] = {};
    newDb.evaluations[user.id][fase] = { ...form, _fecha: new Date().toLocaleDateString() };
    saveDB(newDb);
    showToast(`Evaluación de ${fase.toUpperCase()} guardada con éxito.`, 'success');
  };

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });
  const currentAnalysis = useMemo(() => analizarEvaluacionCompleta(form), [form]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {['inicial', 'mes1', 'mes2', 'mes3'].map(f => (
          <button key={f} onClick={() => setFase(f)} className={`px-8 py-3 text-sm font-black rounded-2xl whitespace-nowrap uppercase tracking-widest transition-all ${fase === f ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transform -translate-y-1 border-none' : 'glass-panel text-gray-400 hover:text-white hover:bg-white/10 border-white/10'}`}>{f === 'inicial' ? 'Fase Inicial' : `Fase ${f}`}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-panel p-8 md:p-10 rounded-[2rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
           <h3 className="text-2xl font-black text-white italic mb-8 flex items-center uppercase tracking-wide"><User className="mr-3 text-cyan-400"/> Datos Biológicos</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div><label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Sexo Biológico</label>
               <select name="sexo" required disabled={isReadOnly} value={form.sexo||''} onChange={handleChange} className="glass-input w-full p-4 rounded-xl font-bold [&>option]:bg-[#001f3f] disabled:opacity-50"><option value="">Selecciona...</option><option value="masculino">Masculino</option><option value="femenino">Femenino</option></select>
             </div>
             <Input disabled={isReadOnly} label="Edad (años)" name="edad" type="number" val={form.edad} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Peso (kg)" name="peso" type="number" step="0.1" val={form.peso} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Talla (cm)" name="talla" type="number" val={form.talla} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Cintura (cm)" name="cintura" type="number" val={form.cintura} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Cadera (cm)" name="cadera" type="number" val={form.cadera} onChange={handleChange} />
           </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-[2rem] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
           <h3 className="text-2xl font-black text-white italic mb-8 flex items-center uppercase tracking-wide"><PieChart className="mr-3 text-emerald-400"/> Composición Corporal</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Input disabled={isReadOnly} label="% Grasa Corporal" name="grasa" type="number" step="0.1" val={form.grasa} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Nivel Grasa Visceral" name="visceral" type="number" val={form.visceral} onChange={handleChange} />
             <Input disabled={isReadOnly} label="% Músculo" name="musculo" type="number" step="0.1" val={form.musculo} onChange={handleChange} />
           </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-[2rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
           <h3 className="text-2xl font-black text-white italic mb-8 flex items-center uppercase tracking-wide"><Zap className="mr-3 text-rose-400"/> Pruebas Físicas</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
             <div className="md:col-span-3 grid grid-cols-3 gap-4 border-r border-white/10 pr-6">
                <div className="col-span-3"><label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Ruffier Dickson</label></div>
                <Input disabled={isReadOnly} label="P0 (Reposo)" name="p0" type="number" val={form.p0} onChange={handleChange} />
                <Input disabled={isReadOnly} label="P1 (Post-ej.)" name="p1" type="number" val={form.p1} onChange={handleChange} />
                <Input disabled={isReadOnly} label="P2 (Recup.)" name="p2" type="number" val={form.p2} onChange={handleChange} />
             </div>
             <div className="md:col-span-2 grid grid-cols-2 gap-4">
               <div className="col-span-2"><label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Fuerza (1 minuto)</label></div>
               <Input disabled={isReadOnly} label="T. Superior" name="trensup" type="number" val={form.trensup} onChange={handleChange} />
               <Input disabled={isReadOnly} label="T. Inferior" name="treninf" type="number" val={form.treninf} onChange={handleChange} />
             </div>
           </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-[2rem] relative overflow-hidden border-t-2 border-[#ffcc00]/50 shadow-[0_0_30px_rgba(255,204,0,0.1)]">
           <div className="absolute top-0 right-0 opacity-5 pointer-events-none"><Target className="w-96 h-96 -mt-20 -mr-20 text-[#ffcc00]"/></div>
           <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffcc00] to-yellow-200 italic mb-2 uppercase tracking-wide drop-shadow-md">Análisis Clínico en Vivo</h3>
           <p className="text-gray-400 mb-8 text-sm font-medium">Las métricas se calculan automáticamente con los algoritmos oficiales.</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
             <ResBox label="IMC" val={currentAnalysis.imc.valor} cl={currentAnalysis.imc.clasificacion} />
             <ResBox label="ICC" val={currentAnalysis.icc.valor} cl={currentAnalysis.icc.clasificacion} />
             <ResBox label="GRASA" val={form.grasa ? `${form.grasa}%` : '-'} cl={currentAnalysis.grasa} />
             <ResBox label="MÚSCULO" val={form.musculo ? `${form.musculo}%` : '-'} cl={currentAnalysis.musculo} />
             <ResBox label="VISCERAL" val={form.visceral || '-'} cl={currentAnalysis.visceral} />
             <ResBox label="RUFFIER" val={currentAnalysis.ruffier.valor} cl={currentAnalysis.ruffier.clasificacion} />
             <ResBox label="T. SUPERIOR" val={form.trensup || '-'} cl={currentAnalysis.superior} />
             <ResBox label="T. INFERIOR" val={form.treninf || '-'} cl={currentAnalysis.inferior} />
           </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end pt-4">
            <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-emerald-400 to-teal-500 text-[#001f3f] px-12 py-5 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105 transition-all transform uppercase tracking-widest">
              Guardar y Sellar Fase
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function Input({label, name, val, onChange, disabled, type, step}: any) {
  return <div>
    <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">{label}</label>
    <input name={name} type={type} step={step} required disabled={disabled} value={val||''} onChange={onChange} className="glass-input w-full p-4 rounded-xl font-bold disabled:opacity-50 transition-colors" />
  </div>;
}

function ResBox({label, val, cl}: any) {
  return <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md hover:bg-black/60 transition-colors">
    <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</span>
    <div>
      <span className="font-black text-3xl tracking-tighter text-white block mb-1 drop-shadow-md">{val}</span> 
      <span className={`block text-[11px] font-black uppercase tracking-wider ${colorClass(cl)}`}>{cl}</span>
    </div>
  </div>;
}

function StudentContenido({ db, saveDB, user, showToast }: any) {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {['mes1', 'mes2', 'mes3'].map(mes => {
        const cf = db.content[mes as keyof typeof db.content].cultura_fisica.filter((i:any) => i.estado==='activo');
        const nu = db.content[mes as keyof typeof db.content].nutricion.filter((i:any) => i.estado==='activo');
        if(cf.length===0 && nu.length===0) return null;

        return (
          <div key={mes} className="glass-panel rounded-[2rem] overflow-hidden transform hover:-translate-y-1 transition-transform duration-500 shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-600/30 to-[#001f3f]/50 border-b border-white/10 px-8 py-5">
              <h3 className="text-white font-black uppercase tracking-widest text-xl italic">{mes.replace('mes', 'MÓDULO MES ')}</h3>
            </div>
            <div className="p-8 space-y-8 bg-black/20">
              {cf.length > 0 && <div>
                <h4 className="flex items-center text-cyan-400 font-black text-lg mb-6 uppercase tracking-wider"><Dumbbell className="w-6 h-6 mr-3 text-cyan-300"/> Cultura Física</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {cf.map((it:any) => <ContentCard key={it.id} item={it} color="blue" db={db} saveDB={saveDB} user={user} showToast={showToast} />)}
                </div>
              </div>}
              {nu.length > 0 && <div>
                <h4 className="flex items-center text-emerald-400 font-black text-lg mb-6 mt-10 uppercase tracking-wider"><HeartPulse className="w-6 h-6 mr-3 text-emerald-300"/> Nutrición</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {nu.map((it:any) => <ContentCard key={it.id} item={it} color="green" db={db} saveDB={saveDB} user={user} showToast={showToast} />)}
                </div>
              </div>}
            </div>
          </div>
        )
      })}
    </div>
  );
}

function ContentCard({ item, color, db, saveDB, user, showToast }: any) {
  const isBlue = color === 'blue';
  
  const handleClick = () => {
    const newDb = {...db};
    const targetUser = newDb.users.find((u:any) => u.id === user.id);
    if(targetUser) {
      if(!targetUser.viewedContent) targetUser.viewedContent = [];
      if(!targetUser.viewedContent.includes(item.id)) {
        targetUser.viewedContent.push(item.id);
        saveDB(newDb);
        if(targetUser.viewedContent.length === 1) showToast('🏆 Logro Desbloqueado: Estudioso', 'success');
        if(targetUser.viewedContent.length === 3) showToast('🏆 Logro Desbloqueado: Erudito', 'success');
      }
    }
  };

  return (
    <a href={item.url} target="_blank" rel="noreferrer" onClick={handleClick} className={`block p-6 rounded-2xl transition-all transform hover:-translate-y-1 hover:scale-[1.02] group glass-panel ${isBlue ? 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-black/50 p-3 rounded-xl group-hover:scale-110 transition-transform"><Youtube className={`w-7 h-7 ${isBlue ? 'text-cyan-400' : 'text-emerald-400'}`}/></div>
          <span className="font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-tight tracking-wide">{item.titulo}</span>
        </div>
        <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors flex-shrink-0 ml-3"/>
      </div>
    </a>
  );
}

// ==== LA PANTALLA PRINCIPAL DE EVOLUCIÓN (CON GRID DE LOGROS OPTIMIZADO) ====
function StudentEvolucion({ db, user }: any) {
  const evals = db.evaluations[user.id] || {};
  const [selectedTrophy, setSelectedTrophy] = useState<any>(null);
  const [chartInfo, setChartInfo] = useState<{title: string, desc: string, obj: string} | null>(null);

  const data = useMemo(() => {
    const arr = [];
    for(const fase of ['inicial', 'mes1', 'mes2', 'mes3']) {
      if(evals[fase]) {
        const d = evals[fase];
        const res = analizarEvaluacionCompleta(d);
        arr.push({ 
          name: fase.toUpperCase(), 
          imc: parseFloat(res.imc.valor)||0, peso: parseFloat(d.peso)||0, 
          cintura: parseFloat(d.cintura)||0, cadera: parseFloat(d.cadera)||0,
          grasa: parseFloat(d.grasa)||0, musculo: parseFloat(d.musculo)||0, visceral: parseFloat(d.visceral)||0,
          ruffier: parseFloat(res.ruffier.valor)||0, p0: parseFloat(d.p0)||0, p1: parseFloat(d.p1)||0, p2: parseFloat(d.p2)||0, 
          trensup: parseFloat(d.trensup)||0, treninf: parseFloat(d.treninf)||0, 
          raw: d, res: res 
        });
      }
    }
    return arr;
  }, [evals]);

  const l = data.length;
  let faseActualTexto = "SIN REGISTRO";
  let motivationalText = "¡Comienza tu reto hoy mismo!";
  
  if (l === 1) {
    faseActualTexto = "FASE INICIAL";
    motivationalText = "Primera evaluación registrada. ¡Sigue así!";
  } else if (l > 1) {
    faseActualTexto = data[l-1].name;
    const last = data[l-1]; const first = data[0];
    if(last.grasa < first.grasa || last.musculo > first.musculo || last.trensup > first.trensup) {
      motivationalText = "¡Tus métricas están mejorando! Eres imparable.";
    } else {
      motivationalText = "Mantén la disciplina, los resultados llegarán.";
    }
  }

  // --- CÁLCULO DE MEJORAS PARA CARRUSEL DINÁMICO ---
  const improvements = useMemo(() => {
    if (l <= 1) return [];
    const first = data[0];
    const last = data[l-1];
    const imps = [];
    if(last.grasa < first.grasa) imps.push({ label: 'Grasa Corporal', val: `-${(first.grasa - last.grasa).toFixed(1)}%`, icon: <PieChart/> });
    if(last.musculo > first.musculo) imps.push({ label: 'Masa Muscular', val: `+${(last.musculo - first.musculo).toFixed(1)}%`, icon: <Flame/> });
    if(last.trensup > first.trensup) imps.push({ label: 'Fuerza Superior', val: `+${last.trensup - first.trensup} reps`, icon: <Dumbbell/> });
    if(last.treninf > first.treninf) imps.push({ label: 'Fuerza Inferior', val: `+${last.treninf - first.treninf} reps`, icon: <Zap/> });
    if(last.ruffier < first.ruffier) imps.push({ label: 'Índice Ruffier', val: `Mejorado`, icon: <HeartPulse/> });
    if(last.peso < first.peso && first.res.imc.valor > 24.9) imps.push({ label: 'Peso Corporal', val: `-${(first.peso - last.peso).toFixed(1)} kg`, icon: <Activity/> });
    return imps;
  }, [data, l]);

  const [impIndex, setImpIndex] = useState(0);

  useEffect(() => {
    if(improvements.length <= 1) return;
    const timer = setInterval(() => {
      setImpIndex(prev => (prev + 1) % improvements.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [improvements]);

  const nextImp = () => {
    if (improvements.length > 0) setImpIndex(prev => (prev + 1) % improvements.length);
  };

  // --- LÓGICA COMPLETA DE LOS 16 TROFEOS ---
  const first = data[0];
  const last = data[l-1];
  const viewedCount = user.viewedContent?.length || 0;
  const hasSurvey = !!db.surveys[user.id];

  const t1 = l >= 1; 
  const t2 = l >= 2; 
  const t3 = l >= 3; 
  const t4 = l >= 4; 
  const t5 = l > 1 && last.trensup > first.trensup; 
  const t6 = l > 1 && last.treninf > first.treninf; 
  const t7 = l > 1 && last.ruffier < first.ruffier; 
  const t8 = l > 1 && last.grasa < first.grasa; 
  const t9 = l > 1 && last.musculo > first.musculo; 
  const t10 = viewedCount >= 1; 
  const t11 = viewedCount >= 3; 
  const t12 = hasSurvey; 
  const t13 = data.some(d => d.imc >= 18.5 && d.imc <= 24.9); 
  const t14 = data.some(d => d.res.musculo === 'Atleta'); 
  const t15 = data.some(d => d.res.superior.includes('Excelente') || d.res.inferior.includes('Excelente')); 
  
  const boolTrophies = [t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,t12,t13,t14,t15];
  const unlockedStandar = boolTrophies.filter(b=>b).length;
  const t16 = unlockedStandar === 15;
  
  const totalUnlocked = unlockedStandar + (t16?1:0);

  const trophies = [
    { id: '1', icon: <Star/>, name: 'Primer Paso', descCorto: 'Reg. Fase Inicial', descLargo: 'Registra por primera vez tus datos físicos en la Fase Inicial.', unl: t1, c: 'text-emerald-400', glow: 'rgba(52,211,153,0.5)' },
    { id: '2', icon: <TrendingUp/>, name: 'Constancia', descCorto: 'Reg. Mes 1', descLargo: 'Has demostrado constancia registrando tu primera evaluación mensual.', unl: t2, c: 'text-orange-400', glow: 'rgba(251,146,60,0.5)' },
    { id: '3', icon: <Target/>, name: 'Disciplina', descCorto: 'Reg. Mes 2', descLargo: 'La disciplina es la clave del éxito. Completaste el registro del Mes 2.', unl: t3, c: 'text-blue-400', glow: 'rgba(96,165,250,0.5)' },
    { id: '4', icon: <Activity/>, name: 'Imparable', descCorto: 'Reg. Mes 3', descLargo: 'Has completado todas las fases de registro. Eres imparable.', unl: t4, c: 'text-rose-500', glow: 'rgba(244,63,94,0.5)' },
    { id: '5', icon: <Dumbbell/>, name: 'Fuerza Bruta', descCorto: 'Mejora T.Superior', descLargo: 'Aumentaste tus repeticiones de tren superior respecto a la fase inicial.', unl: t5, c: 'text-purple-400', glow: 'rgba(192,132,252,0.5)' },
    { id: '6', icon: <Zap/>, name: 'Piernas Acero', descCorto: 'Mejora T.Inferior', descLargo: 'Mejoraste la potencia de tus piernas sumando más repeticiones.', unl: t6, c: 'text-yellow-500', glow: 'rgba(234,179,8,0.5)' },
    { id: '7', icon: <HeartPulse/>, name: 'Corazón Hierro', descCorto: 'Mejora Ruffier', descLargo: 'Tu índice cardiovascular mejoró, tu corazón ahora es más fuerte.', unl: t7, c: 'text-red-400', glow: 'rgba(248,113,113,0.5)' },
    { id: '8', icon: <PieChart/>, name: 'Comp. Óptima', descCorto: 'Reducción Grasa', descLargo: 'Disminuiste tu porcentaje de grasa corporal, mejorando tu composición.', unl: t8, c: 'text-teal-400', glow: 'rgba(45,212,191,0.5)' },
    { id: '9', icon: <Flame/>, name: 'Músculo Magro', descCorto: 'Aumento Músculo', descLargo: 'Ganaste masa muscular esquelética, tu metabolismo está acelerado.', unl: t9, c: 'text-orange-500', glow: 'rgba(249,115,22,0.5)' },
    { id: '10', icon: <BookOpen/>, name: 'Estudioso', descCorto: 'Ve 1 Contenido', descLargo: 'Exploraste por primera vez el material de la Zona Educativa.', unl: t10, c: 'text-cyan-400', glow: 'rgba(34,211,238,0.5)' },
    { id: '11', icon: <Youtube/>, name: 'Erudito', descCorto: 'Ve 3 Contenidos', descLargo: 'Has consumido al menos 3 recursos educativos. El saber es poder.', unl: t11, c: 'text-pink-400', glow: 'rgba(244,114,182,0.5)' },
    { id: '12', icon: <Stethoscope/>, name: 'Salud Plena', descCorto: 'Llena Exp. Clínico', descLargo: 'Completaste exitosamente la encuesta clínica de salud.', unl: t12, c: 'text-emerald-300', glow: 'rgba(110,231,183,0.5)' },
    { id: '13', icon: <Medal/>, name: 'Equilibrio', descCorto: 'IMC Saludable', descLargo: 'Lograste mantener o alcanzar un Índice de Masa Corporal saludable.', unl: t13, c: 'text-indigo-400', glow: 'rgba(129,140,248,0.5)' },
    { id: '14', icon: <Trophy/>, name: 'Atleta', descCorto: 'Nivel Músculo Atleta', descLargo: 'Tus niveles de masa muscular entraron en la clasificación "Atleta".', unl: t14, c: 'text-[#ffcc00]', glow: 'rgba(255,204,0,0.5)' },
    { id: '15', icon: <Crown/>, name: 'Élite', descCorto: 'Fuerza Excelente', descLargo: 'Tus resultados en las pruebas de fuerza alcanzaron el nivel "Excelente" o "Élite".', unl: t15, c: 'text-yellow-200', glow: 'rgba(254,240,138,0.5)' },
    { id: '16', icon: <Award/>, name: 'Leyenda Activa', descCorto: 'Platino - Todos Logros', descLargo: '¡Desbloqueaste el trofeo Platino al conseguir todos los logros de la plataforma!', unl: t16, c: 'text-white', glow: 'rgba(255,255,255,0.8)' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 relative">
      
      {/* HEADER DE EVOLUCION ESTILO DASHBOARD */}
      <div className="flex flex-col xl:flex-row gap-6 mb-10">
        <div className="flex-1 bg-gradient-to-br from-[#051937] to-[#000a18] border-l-4 border-blue-500 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col justify-center">
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/30 blur-[80px] rounded-full pointer-events-none"></div>
            <h2 className="text-3xl md:text-[2.5rem] font-black text-white italic tracking-tight uppercase z-10 leading-none drop-shadow-lg">
              {user.name}
            </h2>
            <p className="text-blue-300 font-black tracking-[0.2em] text-xs md:text-sm mt-4 z-10 uppercase opacity-80">
              {user.unidad} • ID: {user.id}
            </p>
        </div>

        <div 
          onClick={improvements.length > 1 ? nextImp : undefined}
          className={`w-full xl:w-96 bg-gradient-to-br from-[#0a1a1f] to-[#010b0e] border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)] text-center group ${improvements.length > 1 ? 'cursor-pointer hover:border-emerald-400/60 transition-colors' : ''}`}
          title={improvements.length > 1 ? "Haz clic para ver la siguiente mejora" : ""}
        >
            <Trophy className="absolute w-40 h-40 text-emerald-500/5 -right-6 -bottom-6 pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
            <h4 className="text-emerald-400 font-black text-[10px] tracking-[0.3em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              Estado de Progreso
            </h4>
            
            {l <= 1 ? (
              <>
                <h3 className="text-3xl font-black text-white italic uppercase mb-3 drop-shadow-md">
                  {faseActualTexto}
                </h3>
                <p className="text-gray-400 text-sm italic font-medium">
                  {motivationalText}
                </p>
              </>
            ) : improvements.length > 0 ? (
              <div className="w-full flex flex-col items-center animate-in slide-in-from-right-4 fade-in duration-500" key={`imp-${impIndex}`}>
                <div className="text-emerald-300 mb-2 drop-shadow-[0_0_10px_rgba(110,231,183,0.4)]">
                  {React.cloneElement(improvements[impIndex].icon as React.ReactElement, { size: 36 })}
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">{improvements[impIndex].label}</p>
                <h3 className="text-4xl font-black text-emerald-400 italic uppercase drop-shadow-md">
                  {improvements[impIndex].val}
                </h3>
                {improvements.length > 1 && (
                  <div className="flex mt-5 space-x-1.5">
                    {improvements.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === impIndex ? 'w-6 bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'w-2 bg-gray-700'}`}/>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black text-white italic uppercase mb-3 drop-shadow-md">
                  MANTENIMIENTO
                </h3>
                <p className="text-gray-400 text-sm italic font-medium">
                  Tus métricas están estables. ¡Aumenta el esfuerzo!
                </p>
              </>
            )}
        </div>
      </div>

      {/* GRÁFICAS AMPLIADAS */}
      {l > 0 && (
        <div className="glass-panel p-8 rounded-[2rem]">
          <h3 className="text-2xl font-black text-white italic mb-8 border-b border-white/10 pb-4 flex items-center uppercase tracking-wide">
            <ChartIcon className="mr-3 text-cyan-400 w-8 h-8"/> Gráficos Analíticos
          </h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 -mt-2">Haz clic en el título de la gráfica para ver los detalles de la prueba</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <ChartWrapper title="EVOLUCIÓN IMC VS PESO" data={data} lines={[{k:'imc', c:'#00e5ff'},{k:'peso', c:'#ffcc00'}]} onInfoClick={(t: string) => setChartInfo({title: t, ...CHART_INFO[t]})} />
             <ChartWrapper title="MEDIDAS CORPORALES (CM)" data={data} lines={[{k:'cintura', c:'#e879f9'},{k:'cadera', c:'#a78bfa'}]} onInfoClick={(t: string) => setChartInfo({title: t, ...CHART_INFO[t]})} />
             <ChartWrapper title="COMPOSICIÓN CORPORAL (%)" data={data} lines={[{k:'grasa', c:'#f43f5e'},{k:'musculo', c:'#10b981'},{k:'visceral', c:'#f97316'}]} onInfoClick={(t: string) => setChartInfo({title: t, ...CHART_INFO[t]})} />
             <ChartWrapper title="FUERZA MUSCULAR (REPS)" data={data} lines={[{k:'trensup', c:'#3b82f6'},{k:'treninf', c:'#eab308'}]} onInfoClick={(t: string) => setChartInfo({title: t, ...CHART_INFO[t]})} />
             <div className="lg:col-span-2">
               <ChartWrapper title="RENDIMIENTO CARDIOVASCULAR" data={data} lines={[{k:'ruffier', c:'#ef4444'},{k:'p0', c:'#9ca3af'},{k:'p1', c:'#06b6d4'},{k:'p2', c:'#22c55e'}]} onInfoClick={(t: string) => setChartInfo({title: t, ...CHART_INFO[t]})} />
             </div>
          </div>
        </div>
      )}

      {/* VITRINA DE LOGROS PREMIUM (CUADRICULA OPTIMIZADA) */}
      <div className="bg-[#050b14] rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] text-white relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 relative z-10 border-b border-white/10 pb-8">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#ffcc00] uppercase tracking-[0.2em] italic mb-3 drop-shadow-[0_0_20px_rgba(255,204,0,0.3)]">Colección Élite</h3>
            <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">Selecciona un trofeo para inspeccionar</p>
          </div>
          <div className="text-right w-full md:w-auto bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-3 flex justify-between">
              <span>Progreso de Colección</span>
              <span className="text-[#ffcc00] ml-6">{totalUnlocked} / 16</span>
            </p>
            <div className="w-full md:w-72 bg-black/50 h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
               <div className="bg-gradient-to-r from-[#ffcc00] to-yellow-300 h-full transition-all duration-1000 shadow-[0_0_15px_#ffcc00]" style={{width: `${(totalUnlocked/16)*100}%`}}></div>
            </div>
          </div>
        </div>
        
        {/* RENDER DE TROFEOS - CUADRICULA CORREGIDA (H-AUTO Y TEXTO COMPLETO) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-5 relative z-10">
          {trophies.map((t) => (
             <button 
               key={t.id} 
               onClick={() => setSelectedTrophy(t)}
               className={`group relative rounded-[1.5rem] p-5 flex flex-col items-center justify-start transition-all duration-300 border w-full min-h-[12rem] h-auto outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer overflow-hidden
               ${t.unl 
                 ? 'bg-black/60 border-white/20 hover:-translate-y-2 z-10' 
                 : 'bg-black/40 border-white/5 opacity-50 grayscale hover:opacity-80 hover:grayscale-0'}`}
               style={t.unl ? { boxShadow: `0 8px 25px -5px ${t.glow}` } : {}}
             >
               {/* Capa de resplandor de fondo */}
               {t.unl && (
                 <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at top, ${t.glow}, transparent 70%)` }}></div>
               )}
               {/* Efecto arcoíris Platino */}
               {t.unl && t.id === '16' && (
                 <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-rose-500/30 animate-pulse -z-10"></div>
               )}
               
               <div className={`w-14 h-14 rounded-full flex justify-center items-center mb-4 flex-shrink-0 relative z-10 transition-transform duration-500 group-hover:scale-110 
                 ${t.unl ? `bg-black/80 ${t.c} border border-white/20` : 'bg-gray-900 text-gray-700 border-none'}`}
                 style={t.unl ? { boxShadow: `0 0 15px ${t.glow}` } : {}}
               >
                 {React.cloneElement(t.icon as React.ReactElement, { size: 28, strokeWidth: t.unl ? 2.5 : 1.5 })}
               </div>
               {/* Textos con break-words para que quepan completos */}
               <h4 className="font-black text-[11px] sm:text-xs uppercase tracking-widest leading-tight mb-2 text-white z-10 w-full px-1 break-words whitespace-normal">{t.name}</h4>
               <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden md:block z-10 w-full px-1 break-words whitespace-normal leading-snug">{t.descCorto}</p>
             </button>
          ))}
        </div>
      </div>

      {/* MODAL DEL DETALLE DEL TROFEO */}
      {selectedTrophy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-panel p-8 md:p-10 rounded-[2rem] max-w-sm w-full text-center relative border border-white/20"
               style={selectedTrophy.unl ? { boxShadow: `0 0 80px ${selectedTrophy.glow}` } : {}}>
            <button onClick={() => setSelectedTrophy(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
              <X size={20} />
            </button>
            
            <div className={`w-24 h-24 mx-auto rounded-full flex justify-center items-center mb-6 border-4 
              ${selectedTrophy.unl ? `bg-black/50 ${selectedTrophy.c} border-white/20` : 'bg-gray-900 text-gray-700 border-gray-800'}`}
              style={selectedTrophy.unl ? { boxShadow: `0 0 40px ${selectedTrophy.glow}` } : {}}
            >
              {React.cloneElement(selectedTrophy.icon as React.ReactElement, { size: 48, strokeWidth: selectedTrophy.unl ? 2.5 : 1.5 })}
            </div>
            
            <h2 className={`text-2xl font-black uppercase tracking-widest italic mb-2 ${selectedTrophy.unl ? selectedTrophy.c : 'text-gray-500'}`}>
              {selectedTrophy.name}
            </h2>
            
            <div className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border bg-black/50 border-white/10">
               {selectedTrophy.unl ? <span className="text-emerald-400">Trofeo Desbloqueado</span> : <span className="text-rose-500">Trofeo Bloqueado</span>}
            </div>

            <p className="text-sm text-gray-300 font-medium leading-relaxed tracking-wide mb-8">
              {selectedTrophy.descLargo}
            </p>
            
            <button onClick={() => setSelectedTrophy(null)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs">
              Cerrar Detalles
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE INFORMACIÓN DE GRÁFICA */}
      {chartInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#050b14] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,229,255,0.2)] p-8 md:p-10 rounded-[2rem] max-w-lg w-full relative">
            <button onClick={() => setChartInfo(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><X size={20} /></button>
            <div className="flex items-center mb-6">
              <div className="bg-cyan-500/20 p-3 rounded-full mr-4 border border-cyan-500/50 text-cyan-400"><Info size={28} /></div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white italic">{chartInfo.title}</h2>
            </div>
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="text-cyan-400 font-black uppercase tracking-widest mb-2 text-xs">¿Qué estamos midiendo?</h4>
                <p className="text-gray-300 font-medium leading-relaxed">{chartInfo.desc}</p>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <h4 className="text-[#ffcc00] font-black uppercase tracking-widest mb-2 text-xs flex items-center"><Target size={16} className="mr-2"/> Objetivo Clínico</h4>
                <p className="text-gray-300 font-medium leading-relaxed">{chartInfo.obj}</p>
              </div>
            </div>
            <button onClick={() => setChartInfo(null)} className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 text-[#001f3f] font-black py-4 rounded-xl transition-colors uppercase tracking-widest text-sm">
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function ChartWrapper({title, data, lines, onInfoClick}: any) {
  return (
    <div className="bg-black/30 p-6 rounded-3xl border border-white/10 h-[350px] flex flex-col hover:bg-black/40 transition-colors shadow-lg relative group">
      <h4 
        onClick={() => onInfoClick(title)}
        className="flex items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 cursor-pointer hover:text-cyan-400 transition-colors"
        title="Haz clic para saber más sobre esta prueba"
      >
        {title} <Info className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:animate-pulse" />
      </h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{backgroundColor: 'rgba(5,11,20,0.9)', color: '#fff', fontSize: '12px', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.3)', fontWeight: 'bold', backdropFilter: 'blur(10px)'}} itemStyle={{color: '#fff'}} />
            <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '10px', color: '#fff'}} iconType="circle" />
            {lines.map((l:any) => <Line key={l.k} type="monotone" dataKey={l.k} stroke={l.c} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: l.c, stroke: '#fff' }} dot={{ r: 4, strokeWidth: 2, fill: '#000', stroke: l.c }} animationDuration={1500} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// RESTAURACIÓN DE LA ENCUESTA (EXPEDIENTE CLÍNICO)
function SurveyModal({ db, saveDB, user, onClose, showToast }: any) {
  const savedData = db.surveys[user.id];
  const [form, setForm] = useState(savedData || {});
  
  const handleChange = (e:any) => setForm({...form, [e.target.name]: e.target.value});
  
  const handleSubmit = (e:any) => {
    e.preventDefault();
    const newDb = {...db};
    newDb.surveys[user.id] = form;
    saveDB(newDb);
    showToast("Expediente clínico guardado exitosamente.", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4 md:p-10 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel rounded-[2rem] w-full max-w-5xl relative my-auto max-h-[95vh] overflow-y-auto transform transition-all border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        
        {/* Encabezado fijo superior */}
        <div className="bg-gradient-to-r from-emerald-600/50 to-[#001f3f]/50 text-white p-6 md:p-8 flex justify-between items-center sticky top-0 z-20 border-b border-emerald-500/30 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-black flex items-center tracking-tight uppercase italic"><Stethoscope className="mr-3 w-8 h-8 text-emerald-400"/> Expediente Clínico Oficial</h2>
            <p className="text-emerald-200 text-xs font-bold mt-2 uppercase tracking-widest">Datos confidenciales para evaluación de salud</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-emerald-300 transition-colors p-2 bg-black/30 rounded-full"><X size={24}/></button>
        </div>
        
        {savedData && (
           <div className="bg-cyan-500/20 p-5 text-cyan-300 text-sm font-black tracking-widest uppercase text-center flex justify-center items-center border-b border-cyan-500/30">
             <CheckCircle className="w-5 h-5 mr-3"/> TUS DATOS HAN SIDO ENVIADOS. MODO SOLO LECTURA.
           </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <SurveySection title="I. Salud Física y Clínica">
               <SInput n="cronica" l="Condición Crónica" ph="Ej. Asma, Diabetes, Ninguna" f={form} c={handleChange} d={!!savedData} />
               <SInput n="dolor" l="Dolor Crónico / Lesiones" ph="Ej. Dolor de rodilla, Ninguno" f={form} c={handleChange} d={!!savedData} />
               <SInput n="limitacion" l="Limitación Específica" ph="Restricciones de esfuerzo físico" f={form} c={handleChange} d={!!savedData} />
               <SInput n="meds" l="Medicamentos Actuales" ph="De uso frecuente" f={form} c={handleChange} d={!!savedData} />
               <SInput n="postura" l="Defectos de Postura" ph="Ej. Escoliosis, pie plano" f={form} c={handleChange} d={!!savedData} />
               <SInput n="familia" l="Antecedentes Familiares" ph="Ej. Hipertensión en padres" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
             
             <SurveySection title="II. Objetivos y Actividad">
               <SInput n="objetivo" l="Objetivo principal" ph="Bajar peso, salud general" f={form} c={handleChange} d={!!savedData} />
               <SInput n="actividad" l="Nivel de actividad actual" ph="Sedentario, activo" f={form} c={handleChange} d={!!savedData} />
               <SInput n="pasado" l="Deporte en el pasado" ph="Deportes que practicó" f={form} c={handleChange} d={!!savedData} />
               <SInput n="atractivas" l="Actividades atractivas" ph="Ej. Correr, Pesas, Yoga" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
             
             <SurveySection title="III. Logística de Entrenamiento">
               <SInput n="tiempo" l="Tiempo disponible" ph="Ej. 1 hora diaria" f={form} c={handleChange} d={!!savedData} />
               <SInput n="lugar" l="Lugar de entreno" ph="Casa, gimnasio, parque" f={form} c={handleChange} d={!!savedData} />
               <SInput n="implementos" l="Implementos en casa" ph="Mancuernas, tapete, ninguno" f={form} c={handleChange} d={!!savedData} />
               <SInput n="preferencia" l="Cardio y Fuerza" ph="Preferencias de entreno" f={form} c={handleChange} d={!!savedData} />
               <SInput n="obstaculo" l="Mayor obstáculo" ph="Falta de tiempo, pereza" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
             
             <div className="space-y-8">
               <SurveySection title="IV. Bienestar y Estilo de Vida">
                 <SInput n="sueno" l="Calidad de sueño" ph="Mala, buena, cantidad horas" f={form} c={handleChange} d={!!savedData} />
                 <SInput n="energia" l="Nivel de energía" ph="Alto, bajo, fluctuante" f={form} c={handleChange} d={!!savedData} />
                 <SInput n="motivacion" l="Tipo de motivación" ph="Salud, estética, rendimiento" f={form} c={handleChange} d={!!savedData} />
               </SurveySection>
               
               <SurveySection title="V. Contacto Institucional">
                 <SInput n="correo" l="Correo Institucional" ph="correo@alumno.buap.mx" f={form} c={handleChange} d={!!savedData} />
                 <SInput n="telefono" l="Teléfono de contacto" ph="Número móvil (10 dígitos)" f={form} c={handleChange} d={!!savedData} />
                 <SInput n="horario" l="Horario de contacto" ph="Mañana o Tarde" f={form} c={handleChange} d={!!savedData} />
               </SurveySection>
             </div>
          </div>
          
          {!savedData && (
            <div className="flex justify-end pt-8 mt-8 border-t border-white/10">
              <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-[#001f3f] px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all transform w-full md:w-auto">
                Cerrar Encuesta y Enviar Expediente
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SurveySection({title, children}:any) {
  return <div className="bg-black/30 p-8 rounded-[1.5rem] border border-white/5 shadow-inner">
    <h3 className="font-black text-emerald-400 border-b border-emerald-500/20 pb-4 mb-6 text-sm uppercase tracking-[0.2em]">{title}</h3>
    <div className="space-y-5">{children}</div>
  </div>;
}

function SInput({n, l, ph, f, c, d}:any) {
  return <div>
    <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{l}</label>
    <input name={n} required disabled={d} placeholder={ph} value={f[n]||''} onChange={c} className="glass-input w-full p-4 rounded-xl font-bold text-white focus:border-emerald-500 disabled:opacity-50 transition-colors placeholder-gray-600 text-sm" />
  </div>;
}