import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Activity, Ruler, Weight, ClipboardCheck, Trash2, Save, Download, 
  TrendingUp, Heart, AlertCircle, Zap, Award, BarChart3, Hash, Calendar, 
  ArrowUpRight, Info, Lock, School, Sparkles, Loader2, X, Stethoscope, 
  Trophy, Star, LogOut, LogIn, UserPlus, Users, Eye, Key, AlertTriangle, FileUp, FileSpreadsheet, ShieldCheck,
  Flame, BicepsFlexed, ShieldAlert, Crown, PlayCircle, CheckCircle2, Apple, Video, ChevronRight, PlusCircle,
  Mail, Phone, Clock, ArrowLeft, FileText, List
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// --- CONFIGURACIÓN FIREBASE ---
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
  if (!firebaseConfig.apiKey) throw new Error("Fallback manual");
} catch (e) {
  firebaseConfig = {
    apiKey: "AIzaSyBi8Iw_DDqiW6duwgJEbIjIl2QiEjWhoFE",
    authDomain: "reto-activate-dd3cb.firebaseapp.com",
    projectId: "reto-activate-dd3cb",
    storageBucket: "reto-activate-dd3cb.firebasestorage.app",
    messagingSenderId: "230551697596",
    appId: "1:230551697596:web:6fc8a801f9445e74ea78b9"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'reto-activate-buap';

const loadXLSX = () => new Promise((resolve) => {
  if (window.XLSX) return resolve();
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  script.onload = resolve;
  document.head.appendChild(script);
});

const UNIDADES_ACADEMICAS = [
  "Dirección de Atención Estudiantil", "Facultad de Administración", "Facultad de Arquitectura", "Facultad de Artes",
  "Facultad de Artes Plásticas y Audiovisuales", "Facultad de Ciencias Agrícolas y Pecuarias", "Facultad de Ciencias Biológicas", 
  "Facultad de Ciencias de la Computación", "Facultad de Ciencias de la Comunicación", "Facultad de Ciencias de la Electrónica",
  "Facultad de Ciencias Físico Matemáticas", "Facultad de Ciencias Políticas y Sociales", "Facultad de Ciencias Químicas", 
  "Facultad de Contaduría Pública", "Facultad de Cultura Física", "Facultad de Derecho", "Facultad de Economía",
  "Facultad de Enfermería", "Facultad de Estomatología", "Facultad de Filosofía y Letras", "Facultad de Ingeniería", 
  "Facultad de Ingeniería Química", "Facultad de Lenguas", "Facultad de Medicina", "Facultad de Medicina Veterinaria y Zootecnia", "Facultad de Psicología"
];
const MESES = ["Mes 1", "Mes 2", "Mes 3"];
const CATEGORIAS_CONTENIDO = ["Nutrición", "Cultura Física"];

// --- DICCIONARIOS ESTRUCTURALES ---
const SURVEY_CONFIG = [
  { title: "I. Salud Física y Clínica", color: "indigo", fields: [ { label: "Condición Crónica", key: "condicionMedica" }, { label: "Dolor Crónico/Lesiones", key: "dolorCronico" }, { label: "Limitación Específica", key: "limitacionEspecifica" }, { label: "Medicamentos", key: "medicamentos" }, { label: "Defectos de postura", key: "defectosPostura" }, { label: "Antecedentes Familiares", key: "antecedentesFamiliares" } ] },
  { title: "II. Objetivos y Actividad", color: "rose", fields: [ { label: "Objetivo principal", key: "objetivoPrincipal" }, { label: "Nivel actividad física", key: "nivelActividad" }, { label: "Deporte en el pasado", key: "deportePasado" }, { label: "Actividades atractivas", key: "actividadesAtractivas" } ] },
  { title: "III. Logística de Entrenamiento", color: "orange", fields: [ { label: "Tiempo disponible", key: "tiempoEntreno" }, { label: "Lugar de entreno", key: "lugarEntreno" }, { label: "Implementos en casa", key: "implementos" }, { label: "Cardio y Fuerza", key: "incluyeCardioFuerza" }, { label: "Mayor obstáculo", key: "obstaculoConstancia" } ] },
  { title: "IV. Bienestar y Estilo de Vida", color: "cyan", fields: [ { label: "Calidad de sueño", key: "calidadSueno" }, { label: "Nivel de energía", key: "nivelEnergia" }, { label: "Tipo de motivación", key: "tipoMotivacion" } ] },
  { title: "V. Contacto Institucional", color: "emerald", fields: [ { label: "Correo Institucional", key: "correoInstitucional", icon: Mail }, { label: "Teléfono", key: "telefono", icon: Phone }, { label: "Horario contacto", key: "horarioContacto", icon: Clock } ] }
];

const BAREMOS_INFO = {
  imc: { h: ['Clasificación', 'Puntaje'], r: [ { l: 'Bajo Peso', v: '< 18.5', c: 'text-blue-400' }, { l: 'Saludable', v: '18.5 - 24.9', c: 'text-emerald-400' }, { l: 'Sobrepeso', v: '25.0 - 29.9', c: 'text-yellow-400' }, { l: 'Obesidad', v: '≥ 30.0', c: 'text-red-400' } ] },
  icc: { h: ['Clasificación', 'Mujeres', 'Hombres'], r: [ { l: 'Bajo Riesgo', v: '< 0.80', v2: '< 0.95', c: 'text-emerald-400' }, { l: 'Riesgo Medio', v: '0.80 - 0.85', v2: '0.95 - 1.0', c: 'text-yellow-400' }, { l: 'Riesgo Alto', v: '> 0.85', v2: '> 1.0', c: 'text-red-400' } ] },
  gc: { h: ['Clasificación', 'Mujeres (<40a)', 'Hombres (<40a)'], r: [ { l: 'Bajo', v: '< 21.0%', v2: '< 8.0%', c: 'text-blue-400' }, { l: 'Normal', v: '21.0% - 32.9%', v2: '8.0% - 19.9%', c: 'text-emerald-400' }, { l: 'Elevado', v: '33.0% - 38.9%', v2: '20.0% - 24.9%', c: 'text-yellow-400' }, { l: 'Muy Elevado', v: '≥ 39.0%', v2: '≥ 25.0%', c: 'text-red-400' } ] },
  gv: { h: ['Nivel de Riesgo', 'Escala Visceral'], r: [ { l: 'Normal', v: '1 - 9', c: 'text-emerald-400' }, { l: 'Alto', v: '10 - 14', c: 'text-orange-400' }, { l: 'Muy Alto', v: '≥ 15', c: 'text-red-400' } ] },
  me: { h: ['Clasificación', 'Mujeres (<40a)', 'Hombres (<40a)'], r: [ { l: 'Bajo', v: '< 24.3%', v2: '< 33.3%', c: 'text-red-400' }, { l: 'Normal', v: '24.3% - 30.3%', v2: '33.3% - 39.3%', c: 'text-emerald-400' }, { l: 'Atleta', v: '30.4% - 35.3%', v2: '39.4% - 44.0%', c: 'text-blue-400' }, { l: 'Muy Elevado', v: '≥ 35.4%', v2: '≥ 44.1%', c: 'text-purple-400' } ] },
  ruf: { h: ['Estado de Forma', 'Índice (Pts)'], r: [ { l: 'Excelente', v: '0', c: 'text-blue-400' }, { l: 'Bueno', v: '0.1 - 5.0', c: 'text-emerald-400' }, { l: 'Regular', v: '5.1 - 10.0', c: 'text-yellow-400' }, { l: 'Malo', v: '> 10.0', c: 'text-red-400' } ] },
  sup: { h: ['Clasificación', 'Mujeres (<29a)', 'Hombres (<29a)'], r: [ { l: 'Excelente', v: '≥ 30 reps', v2: '≥ 36 reps', c: 'text-emerald-400' }, { l: 'Bueno', v: '15 - 29 reps', v2: '22 - 35 reps', c: 'text-blue-400' }, { l: 'Promedio', v: '12 - 14 reps', v2: '17 - 21 reps', c: 'text-yellow-400' }, { l: 'Pobre', v: '< 12 reps', v2: '< 17 reps', c: 'text-red-400' } ] },
  inf: { h: ['Clasificación', 'Mujeres', 'Hombres'], r: [ { l: 'Excelente', v: '> 44 reps', v2: '> 48 reps', c: 'text-emerald-400' }, { l: 'Bueno', v: '39 - 44 reps', v2: '43 - 48 reps', c: 'text-blue-400' }, { l: 'Promedio', v: '33 - 38 reps', v2: '37 - 42 reps', c: 'text-yellow-400' }, { l: 'Regular', v: '29 - 32 reps', v2: '33 - 36 reps', c: 'text-orange-400' }, { l: 'Malo', v: '< 29 reps', v2: '< 33 reps', c: 'text-red-400' } ] }
};

// --- COMPONENTES UI MODULARES ---
const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center animate-in zoom-in-95">
        <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30"><AlertTriangle className="text-red-500" size={32} /></div>
        <h3 className="text-xl font-black text-white mb-2 uppercase">{titulo}</h3>
        <p className="text-slate-400 text-sm mb-8">{mensaje}</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-700">Cancelar</button>
          <button onClick={onConfirm} className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-red-500">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", icon: Icon, placeholder, unit, colorClass = "blue", disabled = false }) => {
  const themes = {
    blue: "bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-white border-white/10",
    indigo: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-white border-white/10",
    emerald: "bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 text-white border-white/10",
    purple: "bg-gradient-to-br from-purple-500/10 to-purple-700/10 text-white border-white/10",
    rose: "bg-gradient-to-br from-rose-400/10 to-rose-600/10 text-white border-white/10",
    cyan: "bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 text-white border-white/10",
    orange: "bg-gradient-to-br from-orange-400/10 to-orange-500/10 text-white border-white/10",
    yellow: "bg-gradient-to-br from-amber-400/10 to-orange-500/10 text-white border-white/10"
  };
  const theme = themes[colorClass] || themes.blue;
  const interactionClasses = disabled ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-cyan-500 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)]";

  return (
    <div className={`relative flex flex-col justify-center w-full p-4 md:p-5 rounded-[2rem] border transition-all ${interactionClasses} ${theme}`}>
      <div className="flex items-center gap-2 mb-1 opacity-90 drop-shadow-md text-cyan-400">
        {Icon && <Icon size={14} />}
        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-none truncate">{label}</label>
      </div>
      <div className="flex items-center justify-between">
        <input
          type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} disabled={disabled}
          className="w-full bg-transparent outline-none text-xl md:text-2xl font-black placeholder:text-white/40 text-white drop-shadow-md disabled:cursor-not-allowed"
        />
        {unit && <span className="text-[10px] font-black uppercase opacity-70 ml-2 drop-shadow-md whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, icon: Icon, colorClass = "blue", disabled = false }) => {
  const interactionClasses = disabled ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-cyan-500 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)]";

  return (
    <div className={`relative flex flex-col justify-center w-full p-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 transition-all ${interactionClasses}`}>
      <div className="flex items-center gap-2 mb-1 opacity-90 drop-shadow-md text-cyan-400">
        {Icon && <Icon size={16} />}
        <label className="text-[11px] font-black uppercase tracking-widest">{label}</label>
      </div>
      <select
        name={name} value={value || ""} onChange={onChange} disabled={disabled}
        className="w-full bg-transparent outline-none text-lg font-black text-white appearance-none cursor-pointer disabled:cursor-not-allowed"
      >
        <option value="" className="bg-slate-900 text-slate-400">Seleccionar...</option>
        {options.map(o => <option key={o.value || o} value={o.value || o} className="bg-slate-900 text-white">{o.label || o}</option>)}
      </select>
    </div>
  );
};

const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col p-4 bg-[#0c1220]/50 rounded-2xl border border-white/5">
     <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1 opacity-80">{label}</span>
     <span className="text-sm font-bold text-white">{value || "No especificado"}</span>
  </div>
);

const ProgressLineChart = ({ data, label, unit, colorKey }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  if (!data || data.length === 0) return null;

  const validData = data.filter(d => d && !isNaN(parseFloat(d.value)));
  if (validData.length === 0) return null;

  const maxVal = Math.max(...validData.map(d => Math.abs(parseFloat(d.value) || 0)), 1) * 1.3;
  const colorMaps = {
    blue: "#3b82f6", purple: "#a855f7", yellow: "#f59e0b", emerald: "#10b981",
    rose: "#f43f5e", cyan: "#06b6d4", indigo: "#6366f1", orange: "#f97316"
  };
  const strokeColor = colorMaps[colorKey] || colorMaps.blue;

  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1 || 1)) * 100;
    const y = 100 - ((parseFloat(item.value) || 0) / maxVal) * 100;
    return { x, y, val: item.value, mes: item.mes };
  });
  
  const pathData = points.length > 1 
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : `M 0 ${points[0]?.y || 50} L 100 ${points[0]?.y || 50}`;

  return (
    <div className="bg-[#0f172a]/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-xl group hover:border-white/10 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 rounded-full pointer-events-none" style={{backgroundColor: strokeColor}}></div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2" style={{color: strokeColor}}>
          <TrendingUp size={14} /> {label}
        </h4>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{unit}</span>
      </div>
      <div className="relative h-40 w-full mb-4 z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <path d={`${pathData} L 100 100 L 0 100 Z`} fill={strokeColor} fillOpacity="0.1" />
          <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 4px 6px ${strokeColor}40)` }} />
          {points.map((p, i) => (
            <g key={i} onClick={() => setSelectedPoint(i === selectedPoint ? null : i)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={selectedPoint === i ? "5" : "3"} fill={strokeColor} className="transition-all duration-300" style={{ filter: `drop-shadow(0 0 8px ${strokeColor})` }}/>
              {(selectedPoint === i || points.length === 1) && (
                <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[8px] font-black fill-white drop-shadow-md">{p.val}</text>
              )}
            </g>
          ))}
        </svg>
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
          {points.map((p, i) => <span key={i} className={`text-[7px] font-black uppercase transition-colors ${selectedPoint === i ? 'text-white' : 'text-slate-500'}`}>{p.mes}</span>)}
        </div>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---
const App = () => {
  const [currentUser, setCurrentUser] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [loginForm, setLoginForm] = useState({ matricula: '', password: '' });
  const [loginError, setLoginError] = useState("");
  const [regError, setRegError] = useState("");
  const [activeTab, setActiveTab] = useState('registro');
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [configGlobal, setConfigGlobal] = useState({ desbloqueos: {}, videos: {} });
  
  const [showSurvey, setShowSurvey] = useState(false);
  const [adminSurveyView, setAdminSurveyView] = useState({ show: false, data: null, student: null });
  const [baremosModal, setBaremosModal] = useState({ show: false, key: null, title: '', colorClass: 'blue', icon: null });
  
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, type: null, label: '' });
  const [medalModal, setMedalModal] = useState({ show: false, title: '', desc: '', detail: '', icon: null, themeClass: '', colorClass: '', active: false });
  const [videoInputs, setVideoInputs] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  
  const fileInputRef = useRef(null);

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: '', matricula: '', unidadAcademica: '', edad: '', sexo: 'M', etapa: 'Inicial',
    peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', 
    trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: ''
  });
  
  const [nuevoEstudiante, setNuevoEstudiante] = useState({ matricula: '', password: '', nombre: '', unidadAcademica: '' });
  
  const [encuesta, setEncuesta] = useState({
    condicionMedica: '', dolorCronico: '', limitacionEspecifica: '', medicamentos: '', defectosPostura: '', antecedentesFamiliares: '',
    objetivoPrincipal: '', nivelActividad: '', deportePasado: '', actividadesAtractivas: '',
    tiempoEntreno: '', lugarEntreno: '', implementos: '', incluyeCardioFuerza: '', obstaculoConstancia: '',
    calidadSueno: '', nivelEnergia: '', tipoMotivacion: '', correoInstitucional: '', telefono: '', horarioContacto: ''
  });

  const getNormalizedVideos = (videosObj, mes, cat) => {
    if (!videosObj) return [];
    const key = `${mes}-${cat}`;
    const val = videosObj[key];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') return [val];
    return [];
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadXLSX();
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { 
        console.error("Firebase Auth Fail", e); 
        setAuthFailed(true);
      }
    };
    init();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !userData) return;
    const evalCol = collection(db, 'artifacts', appId, 'public', 'data', 'evaluations');
    const unsubEvals = onSnapshot(evalCol, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (userData.role === 'student') {
        setHistorial(data.filter(h => h.matricula === userData.matricula));
      } else {
        setHistorial(data);
      }
    });

    let unsubUsers = () => {};
    if (userData.role === 'admin') {
      const userCol = collection(db, 'artifacts', appId, 'public', 'data', 'users');
      unsubUsers = onSnapshot(userCol, (snapshot) => {
        setUsuariosLista(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
    const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'global'), d => { 
      if (d.exists()) setConfigGlobal(d.data());
    });
    return () => { unsubEvals(); unsubUsers(); unsubConfig(); };
  }, [currentUser, userData]);

  const handleLogin = async () => {
    setLoginError("");
    const m = loginForm.matricula.trim().toUpperCase();
    const p = loginForm.password.trim();
    if (m === 'ADMIN' && p === 'RETO2024') {
      setUserData({ role: 'admin', nombre: 'Administrador DAES', matricula: 'ADMIN' });
      setActiveTab('usuarios');
      return;
    }
    if (!m || !p) { setLoginError("La matrícula o la contraseña es incorrecta."); return; }
    try {
      const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', m));
      if (userDoc.exists() && userDoc.data().password === p) {
        const data = userDoc.data();
        setUserData(data);
        setDatosRegistro(prev => ({ ...prev, ...data }));
        setActiveTab('registro');
      } else { setLoginError("La matrícula o la contraseña es incorrecta."); }
    } catch (e) { setLoginError("Error de conexión con la base de datos."); }
  };

  const handleLogout = () => { setUserData(null); setLoginForm({ matricula: '', password: '' }); setLoginError(""); };

  const triggerDelete = (id, type, label) => setDeleteConfirm({ show: true, id, type, label });
  
  const executeDelete = async () => {
    const { id, type } = deleteConfirm;
    try {
      if (type === 'user') await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id));
      else await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', id));
      setDeleteConfirm({ show: false, id: null, type: null, label: '' });
    } catch (e) { alert("Error al eliminar."); }
  };

  const registrarUsuario = async () => {
    if (!nuevoEstudiante.matricula || !nuevoEstudiante.password) return alert("Matrícula y clave obligatorias.");
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', String(nuevoEstudiante.matricula).trim().toUpperCase()), {
        ...nuevoEstudiante, 
        matricula: String(nuevoEstudiante.matricula).trim().toUpperCase(),
        role: 'student',
        videosVistos: []
      });
      alert("Alumno registrado exitosamente.");
      setNuevoEstudiante({ matricula: '', password: '', nombre: '', unidadAcademica: '' });
    } catch (e) { alert("Error al crear usuario."); }
  };

  const exportarCSV = () => {
    const header = "Fecha,Matricula,Nombre,Etapa,Ruffier,Sup,Inf,GrasaCorp,GrasaVisc,MusculoEsq\n";
    const dataRows = historial.map(h => `${h.fecha},${h.matricula},${h.nombre},${h.etapa},${h.ruffierVal},${h.trenSuperior},${h.trenInferior},${h.grasaCorporal||''},${h.grasaVisceral||''},${h.musculoEsqueletico||''}`).join("\n");
    const blob = new Blob([header + dataRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "Reporte_DAES_BUAP.csv"; a.click();
  };

  const handlePhaseClick = (m) => {
    setRegError("");
    const record = historial.find(h => h.etapa === m && h.matricula === userData.matricula);
    if (record) {
      setDatosRegistro(prev => ({ ...prev, ...record, etapa: m }));
    } else {
      setDatosRegistro(prev => ({
        ...prev, 
        etapa: m,
        peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', 
        trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: ''
      }));
    }
  };

  const toggleSurveyAccess = async (mat, status) => { 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', mat), { surveyEnabled: !status }); 
  };
  
  const saveSurvey = async () => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userData.matricula), { encuestaCompletada: true, datosEncuesta: encuesta });
    setShowSurvey(false);
    alert("Expediente guardado exitosamente.");
  };

  const toggleUnlock = async (mes, cat) => {
    const key = `${mes}-${cat}`;
    const newStatus = !configGlobal.desbloqueos?.[key];
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'global'), { desbloqueos: { ...configGlobal.desbloqueos, [key]: newStatus } }, { merge: true });
  };

  const addVideoLink = async (mes, cat) => {
    const key = `${mes}-${cat}`;
    const newUrl = videoInputs[key];
    if (!newUrl) return alert("Pega un enlace primero.");
    const currentVideos = getNormalizedVideos(configGlobal.videos, mes, cat);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'global'), { videos: { ...configGlobal.videos, [key]: [...currentVideos, newUrl] } }, { merge: true });
    setVideoInputs({...videoInputs, [key]: ''}); 
  };

  const removeVideoLink = async (mes, cat, idx) => {
    const key = `${mes}-${cat}`;
    const currentVideos = getNormalizedVideos(configGlobal.videos, mes, cat);
    const newVideos = currentVideos.filter((_, i) => i !== idx);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'global'), { videos: { ...configGlobal.videos, [key]: newVideos } }, { merge: true });
  };

  const verVideo = async (mes, cat, idx, url) => {
    window.open(url, '_blank');
    const viewKey = `${mes}-${cat}-${idx}`; 
    if (!userData.videosVistos?.includes(viewKey)) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userData.matricula), { videosVistos: arrayUnion(viewKey) });
      setUserData(prev => ({...prev, videosVistos: [...(prev.videosVistos||[]), viewKey]}));
    }
  };

  const hasCompletedCategory = (mes, cat) => {
    const key = `${mes}-${cat}`;
    const videosList = getNormalizedVideos(configGlobal.videos, mes, cat);
    if (videosList.length === 0) return false; 
    return videosList.every((_, i) => (userData.videosVistos||[]).includes(`${key}-${i}`) || (i === 0 && (userData.videosVistos||[]).includes(key)));
  };

  const descargarExpedienteWord = () => {
    if (!adminSurveyView.student || !adminSurveyView.data) return;
    const std = adminSurveyView.student;
    const enc = adminSurveyView.data;
    const fases = ['Inicial', 'Mes 1', 'Mes 2', 'Mes 3'];
    
    const getFase = (etapa) => historial.find(h => h.matricula === std.matricula && h.etapa === etapa) || {};
    
    const metricas = [
      { key: 'peso', label: 'Peso Corporal (kg)' },
      { key: 'talla', label: 'Estatura (cm)' },
      { key: 'cintura', label: 'Cintura (cm)' },
      { key: 'cadera', label: 'Cadera (cm)' },
      { key: 'grasaCorporal', label: 'Grasa Corporal (%)' },
      { key: 'grasaVisceral', label: 'Grasa Visceral (Lvl)' },
      { key: 'musculoEsqueletico', label: 'Músculo Esquelético (%)' },
      { key: 'p0', label: 'Ruffier P0 (Reposo)' },
      { key: 'p1', label: 'Ruffier P1 (Post-Esfuerzo)' },
      { key: 'p2', label: 'Ruffier P2 (Recuperación)' },
      { key: 'trenSuperior', label: 'Fuerza Tren Superior (Reps)' },
      { key: 'trenInferior', label: 'Fuerza Tren Inferior (Reps)' }
    ];

    const rowsHTML = metricas.map(m => {
      const cellsHTML = fases.map(f => `<td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold;">${getFase(f)[m.key] || '-'}</td>`).join('');
      return `<tr><td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; text-align: left;">${m.label}</td>${cellsHTML}</tr>`;
    }).join('');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Expediente Clínico - ${std.matricula}</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h1 style="color: #0f172a; text-align: center; font-size: 24px; text-transform: uppercase;">Expediente Clínico y de Rendimiento</h1>
        <p style="text-align:center; color:#64748b; font-weight:bold;">Reto Actívate - DAES BUAP</p>
        
        <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; font-size: 18px; margin-top: 30px;">I. Ficha de Identificación</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Nombre Completo</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${std.nombre || 'No registrado'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Matrícula Institucional</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${std.matricula}</td></tr>
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Unidad Académica</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;" colspan="3">${std.unidadAcademica || 'No registrado'}</td></tr>
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Edad</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${std.edad || 'No registrado'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Sexo Biológico</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${std.sexo === 'M' ? 'Masculino' : std.sexo === 'F' ? 'Femenino' : 'No registrado'}</td></tr>
        </table>

        <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; font-size: 18px; margin-top: 30px;">II. Salud Física y Clínica</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Condición Crónica</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.condicionMedica || 'Ninguna'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Dolor Crónico/Lesión</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.dolorCronico || 'Ninguno'}</td></tr>
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Limitación Específica</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.limitacionEspecifica || 'Ninguna'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Medicamentos Actuales</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.medicamentos || 'Ninguno'}</td></tr>
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Defectos de Postura</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.defectosPostura || 'Ninguno'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Antecedentes Familiares</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.antecedentesFamiliares || 'Ninguno'}</td></tr>
        </table>

        <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; font-size: 18px; margin-top: 30px;">III. Metas y Experiencia Deportiva</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Objetivo Principal</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.objetivoPrincipal || 'No definido'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Nivel de Actividad</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.nivelActividad || 'No definido'}</td></tr>
          <tr><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Deporte en el Pasado</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.deportePasado || 'Ninguno'}</td><th style="background-color: #f1f5f9; color: #334155; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Actividades Atractivas</th><td style="color: #0f172a; border: 1px solid #cbd5e1; padding: 8px;">${enc.actividadesAtractivas || 'Ninguna'}</td></tr>
        </table>

        <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; font-size: 18px; margin-top: 30px;">IV. Evolución de Pruebas Físicas</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <th style="text-align: center; background-color: #e2e8f0; width: 36%; border: 1px solid #cbd5e1; padding: 8px;">Parámetro Evaluado</th>
            <th style="text-align: center; background-color: #e2e8f0; width: 16%; border: 1px solid #cbd5e1; padding: 8px;">Fase Inicial</th>
            <th style="text-align: center; background-color: #e2e8f0; width: 16%; border: 1px solid #cbd5e1; padding: 8px;">Mes 1</th>
            <th style="text-align: center; background-color: #e2e8f0; width: 16%; border: 1px solid #cbd5e1; padding: 8px;">Mes 2</th>
            <th style="text-align: center; background-color: #e2e8f0; width: 16%; border: 1px solid #cbd5e1; padding: 8px;">Mes 3</th>
          </tr>
          ${rowsHTML}
        </table>
        
        <br/><br/>
        <p style="text-align:right; font-size:12px; color:#94a3b8; border-top: 1px solid #cbd5e1; padding-top: 10px;">Documento generado automáticamente por el sistema <b>Reto Actívate DAES BUAP</b>.</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expediente_Activate_${std.matricula}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resultadosActuales = useMemo(() => {
    const { peso, talla, cintura, cadera, p0, p1, p2, trenSuperior, trenInferior, sexo, edad, grasaCorporal, grasaVisceral, musculoEsqueletico } = datosRegistro;
    const p = parseFloat(peso), t = parseFloat(talla), c = parseFloat(cintura), ca = parseFloat(cadera);
    const gc = parseFloat(grasaCorporal), gv = parseFloat(grasaVisceral), me = parseFloat(musculoEsqueletico);
    
    const gender = sexo || userData?.sexo || 'M';
    const age = parseInt(edad) || parseInt(userData?.edad) || 20; 
    
    const imc = (p > 0 && t > 0) ? (p / Math.pow(t / 100, 2)).toFixed(1) : null;
    let imcInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (imc) {
        if (imc < 18.5) imcInterp = { label: "Bajo Peso", color: "text-blue-400", desc: "Aumento sugerido", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (imc < 25) imcInterp = { label: "Saludable", color: "text-emerald-400", desc: "Peso óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (imc < 30) imcInterp = { label: "Sobrepeso", color: "text-yellow-400", desc: "Riesgo moderado", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else imcInterp = { label: "Obesidad", color: "text-red-400", desc: "Riesgo alto", bg: "bg-red-500/10 border-red-500/30" };
    }

    const icc = (c > 0 && ca > 0) ? (c / ca).toFixed(2) : null;
    let iccInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (icc) {
        const val = parseFloat(icc);
        const limit = gender === 'M' ? 0.95 : 0.80;
        const upper = gender === 'M' ? 1.0 : 0.85;
        if (val < limit) iccInterp = { label: "Riesgo Bajo", color: "text-emerald-400", desc: "Sano", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (val <= upper) iccInterp = { label: "Riesgo Medio", color: "text-yellow-400", desc: "Precaución", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else iccInterp = { label: "Riesgo Alto", color: "text-red-400", desc: "Peligro", bg: "bg-red-500/10 border-red-500/30" };
    }

    let ruffierVal = (p0 && p1 && p2) ? (((parseFloat(p0) + parseFloat(p1) + parseFloat(p2)) - 200) / 10).toFixed(1) : null;
    let ruffierInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (ruffierVal) {
        const v = parseFloat(ruffierVal);
        if (v <= 0) ruffierInterp = { label: "Excelente", color: "text-blue-400", desc: "Corazón Atleta", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v <= 5) ruffierInterp = { label: "Bueno", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v <= 10) ruffierInterp = { label: "Regular", color: "text-yellow-400", desc: "Mejora Sugerida", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else ruffierInterp = { label: "Malo", color: "text-red-400", desc: "Atención Necesaria", bg: "bg-red-500/10 border-red-500/30" };
    }

    let supInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (trenSuperior) {
        const v = parseFloat(trenSuperior);
        let b = gender === 'M' ? (age < 29 ? [36, 22, 17] : [30, 17, 11]) : (age < 29 ? [30, 15, 12] : [27, 13, 10]);

        if (v >= b[0]) supInterp = { label: "Excelente", color: "text-emerald-400", desc: "Élite", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v >= b[1]) supInterp = { label: "Bueno", color: "text-blue-400", desc: "Óptimo", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v >= b[2]) supInterp = { label: "Promedio", color: "text-yellow-400", desc: "Estándar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else supInterp = { label: "Pobre", color: "text-red-400", desc: "Deficiente", bg: "bg-red-500/10 border-red-500/30" };
    }

    let infInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (trenInferior) {
        const v = parseFloat(trenInferior);
        const b = gender === 'M' ? [48, 43, 37, 33] : [44, 39, 33, 29];
        if (v > b[0]) infInterp = { label: "Excelente", color: "text-emerald-400", desc: "Élite", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v >= b[1]) infInterp = { label: "Bueno", color: "text-blue-400", desc: "Óptimo", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v >= b[2]) infInterp = { label: "Promedio", color: "text-yellow-400", desc: "Estándar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else if (v >= b[3]) infInterp = { label: "Regular", color: "text-orange-400", desc: "Bajo", bg: "bg-orange-500/10 border-orange-500/30" };
        else infInterp = { label: "Malo", color: "text-red-400", desc: "Deficiente", bg: "bg-red-500/10 border-red-500/30" };
    }

    let gcInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (!isNaN(gc)) {
      let b = [];
      if (gender === 'F') {
        if (age < 40) b = [21.0, 33.0, 39.0];
        else if (age < 60) b = [23.0, 34.0, 40.0];
        else b = [24.0, 36.0, 42.0];
      } else {
        if (age < 40) b = [8.0, 20.0, 25.0];
        else if (age < 60) b = [11.0, 22.0, 28.0];
        else b = [13.0, 25.0, 30.0];
      }
      if (gc < b[0]) gcInterp = { label: "Bajo", color: "text-blue-400", desc: "Aumentar", bg: "bg-blue-500/10 border-blue-500/30" };
      else if (gc < b[1]) gcInterp = { label: "Normal", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (gc < b[2]) gcInterp = { label: "Elevado", color: "text-yellow-400", desc: "Precaución", bg: "bg-yellow-500/10 border-yellow-500/30" };
      else gcInterp = { label: "Muy Elevado", color: "text-red-400", desc: "Riesgo", bg: "bg-red-500/10 border-red-500/30" };
    }

    let gvInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (!isNaN(gv)) {
      if (gv <= 9) gvInterp = { label: "Normal", color: "text-emerald-400", desc: "Saludable", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (gv <= 14) gvInterp = { label: "Alto", color: "text-orange-400", desc: "Riesgo", bg: "bg-orange-500/10 border-orange-500/30" };
      else gvInterp = { label: "Muy Alto", color: "text-red-400", desc: "Peligro", bg: "bg-red-500/10 border-red-500/30" };
    }

    let meInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (!isNaN(me)) {
      let b = [];
      if (gender === 'F') {
        if (age < 40) b = [24.3, 30.4, 35.4];
        else if (age < 60) b = [24.1, 30.2, 35.2];
        else b = [23.9, 30.0, 35.0];
      } else {
        if (age < 40) b = [33.3, 39.4, 44.1];
        else if (age < 60) b = [33.1, 39.2, 43.9];
        else b = [32.9, 39.0, 43.7];
      }
      if (me < b[0]) meInterp = { label: "Bajo", color: "text-red-400", desc: "Aumentar masa", bg: "bg-red-500/10 border-red-500/30" };
      else if (me < b[1]) meInterp = { label: "Normal", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (me < b[2]) meInterp = { label: "Elevado", color: "text-blue-400", desc: "Atleta", bg: "bg-blue-500/10 border-blue-500/30" };
      else meInterp = { label: "Muy Elevado", color: "text-purple-400", desc: "Exceso", bg: "bg-purple-500/10 border-purple-500/30" };
    }

    return { imc, imcInterp, icc, iccInterp, ruffierVal, ruffierInterp, supInterp, infInterp, gcInterp, gvInterp, meInterp };
  }, [datosRegistro, userData]);

  const evolUser = useMemo(() => {
    if (!userData || userData.role !== 'student') return null;
    const records = historial.filter(h => h.matricula === userData.matricula).sort((a, b) => mesesEtapas.indexOf(a.etapa) - mesesEtapas.indexOf(b.etapa));
    const mapData = (key) => mesesEtapas.map(m => ({ mes: m, value: records.find(r => r.etapa === m)?.[key] || 0 }));
    
    let highlight = { area: "En Proceso", msg: "Registra tu primera fase para comenzar." };
    
    if (records.length === 1) {
      highlight = { area: "Fase Inicial", msg: "Primera evaluación registrada. ¡Sigue así!" };
    } else if (records.length >= 2) {
      const p1 = records[0];
      const pL = records[records.length - 1];
      
      const impSup = (parseFloat(pL.trenSuperior) || 0) - (parseFloat(p1.trenSuperior) || 0);
      const impInf = (parseFloat(pL.trenInferior) || 0) - (parseFloat(p1.trenInferior) || 0);
      const impRuf = (parseFloat(p1.ruffierVal) || 0) - (parseFloat(pL.ruffierVal) || 0); 
      
      if (impSup <= 0 && impInf <= 0 && impRuf <= 0) {
         highlight = { area: "Activo", msg: "Manteniendo tu rendimiento base." };
      } else {
         const maxImp = Math.max(impSup, impInf, impRuf);
         if (maxImp === impRuf && impRuf > 0) {
             highlight = { area: "Mejora en Cardio", msg: `Tu índice Ruffier mejoró en ${impRuf.toFixed(1)} puntos.` };
         } else if (maxImp === impSup && impSup > 0) {
             highlight = { area: "Fuerza Superior", msg: `¡Ganaste +${impSup} repeticiones!` };
         } else if (maxImp === impInf && impInf > 0) {
             highlight = { area: "Potencia Inferior", msg: `¡Aumentaste +${impInf} repeticiones!` };
         }
      }
    }

    return { 
      peso: mapData('peso'), ruffier: mapData('ruffierVal'), superior: mapData('trenSuperior'), inferior: mapData('trenInferior'),
      grasaCorporal: mapData('grasaCorporal'), grasaVisceral: mapData('grasaVisceral'), musculoEsqueletico: mapData('musculoEsqueletico'),
      recs: records,
      highlight 
    };
  }, [historial, userData]);

  const finalizarRegistro = async () => {
    setRegError("");
    const req = ['peso', 'talla', 'cintura', 'cadera', 'p0', 'p1', 'p2', 'trenSuperior', 'trenInferior', 'sexo', 'edad'];
    const newReq = ['grasaCorporal', 'grasaVisceral', 'musculoEsqueletico'];
    if ([...req, ...newReq].some(f => !datosRegistro[f])) return setRegError("Complete todos los campos de evaluación (incluyendo grasa, músculo, sexo y edad) antes de finalizar.");
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), {
        ...datosRegistro, ...resultadosActuales, matricula: userData.matricula, nombre: userData.nombre, fecha: new Date().toLocaleDateString(), timestamp: Date.now()
      });

      if (datosRegistro.edad !== userData.edad || datosRegistro.sexo !== userData.sexo) {
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userData.matricula), {
            edad: datosRegistro.edad,
            sexo: datosRegistro.sexo
         }, { merge: true });
         setUserData(prev => ({ ...prev, edad: datosRegistro.edad, sexo: datosRegistro.sexo }));
      }
      
      alert("¡Registro guardado exitosamente! Avanzando a la siguiente fase...");
      
      const currentIdx = mesesEtapas.indexOf(datosRegistro.etapa);
      const nextEtapa = (currentIdx >= 0 && currentIdx < mesesEtapas.length - 1) ? mesesEtapas[currentIdx + 1] : datosRegistro.etapa;

      setDatosRegistro(p => ({ 
        ...p, 
        etapa: nextEtapa, 
        peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: '' 
      }));
    } catch (e) { 
      console.error(e);
      alert(`Error al guardar en la base de datos.`); 
    }
  };

  const renderBaremosTable = (key) => {
    const tableData = BAREMOS_INFO[key];
    if (!tableData) return null;
    return (
      <table className="w-full text-left text-sm md:text-base border-collapse">
        <thead className="bg-[#1a1d2d] text-[10px] md:text-[11px] uppercase tracking-widest text-slate-400">
          <tr>{tableData.h.map((h, i) => <th key={i} className="p-4 border-b border-white/10">{h}</th>)}</tr>
        </thead>
        <tbody className="text-white font-bold tracking-tight divide-y divide-white/5">
          {tableData.r.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className={`p-4 ${row.c}`}>{row.l}</td>
              <td className="p-4">{row.v}</td>
              {row.v2 && <td className="p-4">{row.v2}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) return <div className="min-h-screen bg-[#070913] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center p-4 relative overflow-hidden">
        <GlobalStyles />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-600/20 rounded-full blur-[180px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[180px] animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="bg-[#0f172a]/80 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-white/10 w-full max-w-md shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10">
          
          {authFailed && (
             <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl mb-8 flex items-center gap-3">
                <AlertTriangle className="text-red-500 shrink-0" size={24} />
                <p className="text-red-200 text-[10px] md:text-xs font-bold leading-tight">⚠️ La sincronización está fallando. Asegúrate de habilitar el método de acceso "Anónimo" en Firebase Authentication.</p>
             </div>
          )}

          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(6,182,212,0.4)] border border-cyan-300/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Zap className="text-white fill-white" size={48} />
            </div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-md">Reto <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Actívate</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-[0.3em]">DAES BUAP • Promoción de la Cultura Física</p>
          </div>
          <div className="space-y-6">
            <InputField label="Matrícula" type="text" value={loginForm.matricula} onChange={e => {setLoginError(""); setLoginForm({...loginForm, matricula: e.target.value})}} icon={Hash} placeholder="ID Institucional" colorClass="blue" />
            <InputField label="Contraseña" type="password" value={loginForm.password} onChange={e => {setLoginError(""); setLoginForm({...loginForm, password: e.target.value})}} icon={Key} placeholder="••••" colorClass="blue" />
            {loginError && <p className="text-[10px] font-bold text-red-400 uppercase bg-red-500/10 p-4 rounded-xl border border-red-500/30 text-center animate-in slide-in-from-top-1 shadow-[0_0_15px_rgba(239,68,68,0.2)]">{loginError}</p>}
            <button onClick={handleLogin} className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 mt-4">Ingresar al Sistema</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-300 font-sans relative overflow-hidden flex flex-col selection:bg-cyan-500/30">
      <GlobalStyles />
      <ModalConfirmacion isOpen={deleteConfirm.show} onClose={() => setDeleteConfirm({ show: false, id: null, type: null, label: '' })} onConfirm={executeDelete} titulo="¿Confirmar Eliminación?" mensaje={`Estás a punto de borrar permanentemente a: ${deleteConfirm.label}.`} />

      {/* Fondos fluidos adaptativos */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/30 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/30 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-emerald-600/20 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      {/* MODAL BAREMOS (TABULACIONES) */}
      {baremosModal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setBaremosModal({ ...baremosModal, show: false })}>
          <div className="bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] border border-white/10 p-6 md:p-8 rounded-[3rem] w-full max-w-[600px] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden flex flex-col items-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setBaremosModal({ ...baremosModal, show: false })} className="absolute top-6 right-6 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={16}/></button>

            {/* Icono del Baremos */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border shadow-inner 
              bg-gradient-to-br ${
                baremosModal.colorClass === 'blue' ? 'from-blue-400 to-indigo-600 border-blue-500/50' : 
                baremosModal.colorClass === 'pink' ? 'from-pink-400 to-rose-600 border-pink-500/50' : 
                baremosModal.colorClass === 'rose' ? 'from-rose-400 to-pink-600 border-rose-500/50' : 
                baremosModal.colorClass === 'orange' ? 'from-orange-400 to-red-500 border-orange-500/50' : 
                baremosModal.colorClass === 'cyan' ? 'from-cyan-300 to-blue-500 border-cyan-500/50' : 
                baremosModal.colorClass === 'emerald' ? 'from-emerald-400 to-teal-600 border-emerald-500/50' : 
                baremosModal.colorClass === 'purple' ? 'from-purple-400 to-purple-700 border-purple-500/50' : 
                'from-indigo-400 to-violet-600 border-indigo-500/50'
              }`}>
              {baremosModal.icon && React.createElement(baremosModal.icon, { size: 28, className: "text-white drop-shadow-md" })}
            </div>

            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 text-white text-center">{baremosModal.title}</h3>
            
            <div className="w-full bg-[#131620]/50 rounded-[2rem] p-2 border border-white/5 overflow-x-auto shadow-inner">
               {renderBaremosTable(baremosModal.key)}
            </div>
            
            <p className="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-widest font-bold max-w-sm">Los valores presentados están basados en las normas de salud y rendimiento físico para la categoría especificada.</p>

            <button onClick={() => setBaremosModal({ ...baremosModal, show: false })} className="w-full py-4 mt-6 bg-[#1a2235] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#232d46] transition-all border border-white/5 shadow-md flex items-center justify-center gap-2">
              <ArrowLeft size={16}/> Cerrar Información
            </button>
          </div>
        </div>
      )}

      {/* MODAL INTERACTIVO DE MEDALLAS */}
      {medalModal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#030508]/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setMedalModal({ ...medalModal, show: false })}>
          <div className="bg-gradient-to-b from-[#131a2a] to-[#0a0f1a] border border-white/10 p-8 rounded-[3rem] w-full max-w-[350px] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMedalModal({ ...medalModal, show: false })} className="absolute top-6 right-6 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={16}/></button>

            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-1000 shadow-inner ${medalModal.active ? `bg-gradient-to-br ${medalModal.themeClass} border-t border-l border-white/60 border-b border-r border-black/50 shadow-[inset_0_6px_10px_rgba(255,255,255,0.8),inset_0_-6px_10px_rgba(0,0,0,0.5)] scale-110` : 'bg-slate-800 border border-white/5 text-slate-600 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]'}`}>
              {medalModal.icon && React.createElement(medalModal.icon, {
                 size: 36, 
                 className: medalModal.active ? `${medalModal.colorClass === 'platinum' ? 'text-slate-800' : 'text-white'} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]` : ""
              })}
            </div>

            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-2 ${medalModal.active ? 'text-white' : 'text-slate-400'}`}>{medalModal.title}</h3>
            
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 ${medalModal.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'}`}>
              {medalModal.active ? '✓ Desbloqueada' : '🔒 Bloqueada'}
            </span>

            <p className="text-[11px] font-bold text-slate-300 leading-relaxed mb-8 px-2">{medalModal.detail}</p>

            <button onClick={() => setMedalModal({ ...medalModal, show: false })} className="w-full py-4 mt-2 bg-[#1a2235] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#232d46] transition-all border border-white/5 shadow-md flex items-center justify-center gap-2">
              <ArrowLeft size={16}/> Regresar
            </button>
          </div>
        </div>
      )}

      {/* HEADER Y NAVEGACIÓN GENERAL */}
      <header className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-[2rem] shadow-[0_0_40px_rgba(6,182,212,0.4)] border border-cyan-400/30">
             <Zap className="text-white fill-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-md">Reto <span className="text-cyan-400">Actívate</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-90 mt-2">DAES BUAP • {userData.nombre}</p>
          </div>
        </div>
        <nav className="flex bg-[#0f172a]/80 backdrop-blur-xl p-1.5 rounded-3xl border border-white/10 gap-1 shadow-2xl">
          {userData.role === 'admin' ? (
            <>
              <button onClick={() => setActiveTab('usuarios')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'usuarios' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Usuarios</button>
              <button onClick={() => setActiveTab('historial')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'historial' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Historial</button>
              <button onClick={() => setActiveTab('contenidos')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'contenidos' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Videos</button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('registro')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'registro' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Registro</button>
              <button onClick={() => setActiveTab('biblioteca')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'biblioteca' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Contenido</button>
              <button onClick={() => setActiveTab('evolución')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'evolución' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Evolución</button>
            </>
          )}
          <button onClick={() => userData.role === 'student' && userData.surveyEnabled && setShowSurvey(true)} className={`p-3 rounded-xl transition-all ${userData?.surveyEnabled ? 'text-indigo-400 animate-pulse hover:bg-indigo-500/20' : 'text-slate-600 grayscale hidden'}`}><Stethoscope size={18} /></button>
          <button onClick={handleLogout} className="p-3 text-red-400 ml-2 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"><LogOut size={18}/></button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 w-full flex-1 relative z-10 pb-20">
        
        {/* VISTA ADMIN - USUARIOS */}
        {userData.role === 'admin' && activeTab === 'usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-[#0f172a]/90 p-8 rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] h-fit">
                <h2 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-8 flex items-center gap-3"><UserPlus size={18} /> Alta Estudiante</h2>
                <div className="space-y-4">
                  <InputField label="Nombre" value={nuevoEstudiante.nombre} onChange={e => setNuevoEstudiante({...nuevoEstudiante, nombre: e.target.value})} icon={User} placeholder="Nombre completo" type="text" colorClass="blue"/>
                  <InputField label="Matrícula" value={nuevoEstudiante.matricula} onChange={e => setNuevoEstudiante({...nuevoEstudiante, matricula: e.target.value})} icon={Hash} placeholder="ID" type="text" colorClass="blue"/>
                  <InputField label="Contraseña" value={nuevoEstudiante.password} onChange={e => setNuevoEstudiante({...nuevoEstudiante, password: e.target.value})} icon={Lock} placeholder="Clave" type="text" colorClass="blue"/>
                  <SelectField label="Unidad Académica" value={nuevoEstudiante.unidadAcademica} onChange={e => setNuevoEstudiante({...nuevoEstudiante, unidadAcademica: e.target.value})} options={UNIDADES_ACADEMICAS} colorClass="blue" />
                  <button onClick={registrarUsuario} className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all mt-6 border border-cyan-400/30">Registrar Alumno</button>
                </div>
              </div>

              <div className="bg-[#0f172a]/90 p-8 rounded-[3rem] border border-emerald-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] h-fit relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/20 blur-[50px] rounded-full"></div>
                <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-3 relative z-10"><FileSpreadsheet size={18} /> Importar Excel</h2>
                <div className="space-y-6 relative z-10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">Carga masiva. Columnas requeridas: <span className="text-emerald-400">Nombre, Matricula, Password, Unidad Academica</span>.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={downloadTemplate} className="flex items-center justify-center gap-2 py-4 bg-[#1a1d2d] text-white border border-white/10 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-[#24293d] transition-all">
                       <Download size={14} /> Plantilla
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all border border-emerald-400/50">
                       {isImporting ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />} {isImporting ? 'Subiendo...' : 'Subir Archivo'}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={uploadExcel} accept=".xlsx, .xls" className="hidden" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0f172a]/90 p-8 rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[850px] overflow-y-auto">
              <h2 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3"><Users size={18} /> Directorio Activo ({usuariosLista.length})</h2>
              <div className="space-y-3">
                {usuariosLista.length === 0 ? <p className="text-slate-500 text-center py-20 text-[10px] font-black uppercase italic tracking-widest">Sin alumnos registrados</p> : 
                usuariosLista.map(u => (
                  <div key={u.id} className="bg-[#1a1d2d]/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center group transition-all hover:border-cyan-500/40 hover:bg-[#1a1d2d]">
                    <div className="overflow-hidden pr-2">
                        <p className="text-sm font-black text-white italic truncate">{String(u.nombre || 'Sin Nombre')}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-1 truncate">{String(u.matricula)} • {String(u.unidadAcademica)}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right hidden sm:block"><p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Clave</p><p className="text-cyan-400 font-black text-sm tracking-widest">{String(u.password)}</p></div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => toggleSurveyAccess(u.matricula, u.surveyEnabled)} className={`w-10 h-5 rounded-full relative ${u.surveyEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                             <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${u.surveyEnabled ? 'right-1' : 'left-1'}`} />
                           </button>
                           
                           <button onClick={() => {
                               if (u.encuestaCompletada && u.datosEncuesta) {
                                 setAdminSurveyView({ show: true, data: u.datosEncuesta, student: u });
                               } else {
                                 alert("Este estudiante aún no ha llenado su expediente clínico.");
                               }
                           }} className={`p-2 rounded-xl transition-all ${u.encuestaCompletada ? 'text-indigo-400 hover:bg-indigo-500/20' : 'text-slate-600 grayscale cursor-not-allowed hover:bg-white/5'}`} title="Ver Expediente Médico">
                             <Stethoscope size={16}/>
                           </button>

                           <button onClick={() => triggerDelete(u.matricula, 'user', u.nombre)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA ADMIN - HISTORIAL */}
        {userData.role === 'admin' && activeTab === 'historial' && (
          <div className="bg-[#0f172a]/80 rounded-[3rem] border border-white/5 overflow-hidden animate-in fade-in backdrop-blur-xl shadow-2xl">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Historial Global</h2>
                <button onClick={exportarCSV} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/50"><Download size={16}/> Exportar CSV</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-[#1a1d2d] text-[9px] font-black uppercase text-slate-400 tracking-widest"><tr><th className="px-8 py-5">Fase/Estudiante</th><th className="px-8 py-5 text-center">Composición Física</th><th className="px-8 py-5 text-center">R / S / I</th><th className="px-8 py-5 text-right">Control</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {historial.length === 0 ? <tr><td colSpan="4" className="py-20 text-center text-[10px] font-black text-slate-500 uppercase">Sin evaluaciones registradas</td></tr> :
                    historial.map(h => (
                      <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5 text-sm font-black text-white">
                            <span className="italic">{String(h.nombre || 'S/N')}</span>
                            <br/>
                            <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-tight">{String(h.etapa)}</span> <span className="text-[9px] text-slate-500">• {String(h.fecha)}</span>
                        </td>
                        <td className="px-8 py-5 text-center text-[10px] font-black tracking-tighter text-slate-400">GC: <span className="text-pink-400">{h.grasaCorporal||'-'}</span> / GV: <span className="text-orange-400">{h.grasaVisceral||'-'}</span> / ME: <span className="text-cyan-400">{h.musculoEsqueletico||'-'}</span></td>
                        <td className="px-8 py-5 text-center text-[10px] font-black tracking-tighter">R: <span className="text-emerald-400">{String(h.ruffierVal)}</span> / S: <span className="text-blue-400">{String(h.trenSuperior)}</span> / I: <span className="text-purple-400">{String(h.trenInferior)}</span></td>
                        <td className="px-8 py-5 text-right">
                            <button onClick={() => triggerDelete(h.id, 'evaluation', `${h.nombre} (${h.etapa})`)} className="p-3 text-slate-500 hover:text-red-500 transition-colors">
                                <Trash2 size={16}/>
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* VISTA ADMIN - CONTENIDOS */}
        {userData.role === 'admin' && activeTab === 'contenidos' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="bg-[#0f172a]/90 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3"><Video className="text-cyan-400" size={24}/> Bóveda Youtube</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {MESES.map(m => (
                  <div key={m} className="bg-[#131a2a]/60 p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
                    <h4 className="text-[12px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-3">{m}</h4>
                    {CATEGORIAS_CONTENIDO.map(c => {
                      const key = `${m}-${c}`;
                      const isUn = configGlobal.desbloqueos?.[key];
                      const videosList = getNormalizedVideos(configGlobal.videos, m, c);

                      return (
                        <div key={c} className="bg-[#0a0f1a] p-5 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase text-white">{c}</span>
                            <button onClick={() => toggleUnlock(m, c)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${isUn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : 'bg-[#1a2235] text-slate-400 border border-transparent'}`}>
                              {isUn ? 'Abierto' : 'Cerrado'}
                            </button>
                          </div>
                          <div className="space-y-2 mb-4">
                            {videosList.map((vidUrl, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-[#131620] p-3 rounded-xl border border-white/5 group">
                                <p className="text-[9px] text-slate-400 truncate w-32"><span className="text-cyan-400 font-bold mr-1">V{idx+1}:</span> {vidUrl}</p>
                                <button onClick={() => removeVideoLink(m, c, idx)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={14}/></button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input type="text" placeholder="URL YouTube" value={videoInputs[key] || ""} onChange={e => setVideoInputs({...videoInputs, [key]: e.target.value})} className="w-full bg-[#131620] text-[10px] font-bold text-white px-4 py-3 rounded-xl outline-none border border-white/5 focus:border-cyan-500/50 transition-colors" />
                            <button onClick={() => addVideoLink(m, c)} className="bg-cyan-600 text-white px-4 rounded-xl hover:bg-cyan-500 transition-colors shadow-lg"><PlusCircle size={16}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA ESTUDIANTE - BIBLIOTECA E INFO DE BAREMOS */}
        {userData.role === 'student' && activeTab === 'biblioteca' && (
          <div className="flex flex-col gap-10 animate-in fade-in pb-10">
            {/* Sección: Videos Educativos */}
            <div className="bg-[#0f172a]/90 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-xl">
              <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-3"><Video className="text-cyan-400" size={28}/> Contenido Interactivo</h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Visualiza todos los videos de cada categoría para desbloquear las medallas correspondientes en tu vitrina de evolución.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {MESES.map(m => (
                  <div key={`vid-${m}`} className="bg-[#131620]/60 p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                    <h4 className="text-[12px] md:text-sm font-black text-white uppercase tracking-[0.2em] italic border-b border-white/10 pb-3">{m}</h4>
                    {CATEGORIAS_CONTENIDO.map(c => {
                      const key = `${m}-${c}`;
                      const isLocked = !configGlobal.desbloqueos?.[key];
                      const videosList = getNormalizedVideos(configGlobal.videos, m, c);
                      const isCatComplete = hasCompletedCategory(m, c);
                      
                      return (
                        <div key={c} className={`p-5 md:p-6 rounded-[2rem] border flex flex-col gap-5 transition-all ${isLocked ? 'bg-[#0a0f1a] border-white/5 grayscale opacity-60' : isCatComplete ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-[#1e2336] border-white/10 shadow-lg'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] md:text-xs font-black uppercase text-white flex items-center gap-2">
                              {c === 'Nutrición' ? <Apple size={16} className="text-rose-400"/> : <Zap size={16} className="text-yellow-400"/>} {c}
                            </span>
                            {isCatComplete && <CheckCircle2 size={16} className="text-emerald-400"/>}
                          </div>
                          {isLocked ? (
                            <div className="py-6 text-center text-slate-600 bg-black/30 rounded-xl"><Lock size={24} className="mx-auto mb-2"/><p className="text-[9px] font-black uppercase tracking-widest">Bloqueado</p></div>
                          ) : videosList.length === 0 ? (
                            <p className="text-[9px] text-center text-slate-500 py-4 uppercase font-black tracking-widest">Pronto...</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {videosList.map((vidUrl, idx) => {
                                const isSeen = (userData.videosVistos||[]).includes(`${key}-${idx}`) || (idx === 0 && (userData.videosVistos||[]).includes(key));
                                return (
                                  <button key={idx} onClick={() => verVideo(m, c, idx, vidUrl)} className={`w-full py-4 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between border transition-all hover:-translate-y-0.5 ${isSeen ? 'bg-[#0f172a] text-emerald-400 border-emerald-500/30' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400/50 shadow-md'}`}>
                                    <div className="flex items-center gap-3">
                                      <PlayCircle size={16} className={isSeen ? "text-emerald-500" : ""}/> 
                                      <span>Video {idx + 1}</span>
                                    </div>
                                    {isSeen ? <CheckCircle2 size={14}/> : <ChevronRight size={14} className="opacity-50"/>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN NUEVA: TABULACIONES Y BAREMOS CLÍNICOS */}
            <div className="bg-gradient-to-br from-[#0f172a] to-[#131620] backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>
              <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-3 relative z-10"><BarChart3 className="text-emerald-400" size={28}/> Parámetros de Evaluación</h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-10 relative z-10">Haz clic en cada ícono para consultar las tablas (Baremos) mediante las cuales se calcula tu nivel físico y de salud.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
                {[
                  { key: 'imc', title: 'IMC', desc: 'Masa Corporal', icon: Weight, color: 'blue' },
                  { key: 'icc', title: 'ICC', desc: 'Cintura-Cadera', icon: Ruler, color: 'pink' },
                  { key: 'gc', title: 'Grasa', desc: 'Porcentaje Corporal', icon: Flame, color: 'rose' },
                  { key: 'gv', title: 'Visceral', desc: 'Nivel Interno', icon: ShieldAlert, color: 'orange' },
                  { key: 'me', title: 'Músculo', desc: 'Esquelético', icon: BicepsFlexed, color: 'cyan' },
                  { key: 'ruf', title: 'Ruffier', desc: 'Test Cardiovascular', icon: Heart, color: 'emerald' },
                  { key: 'sup', title: 'T. Superior', desc: 'Fuerza Reps', icon: Zap, color: 'purple' },
                  { key: 'inf', title: 'T. Inferior', desc: 'Fuerza Reps', icon: TrendingUp, color: 'indigo' },
                ].map((item, idx) => {
                  const themes = {
                    blue: { glow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]", iconBg: "bg-gradient-to-br from-blue-400 to-indigo-600" },
                    pink: { glow: "hover:shadow-[0_0_25px_rgba(236,72,153,0.3)]", iconBg: "bg-gradient-to-br from-pink-400 to-rose-600" },
                    rose: { glow: "hover:shadow-[0_0_25px_rgba(225,29,72,0.3)]", iconBg: "bg-gradient-to-br from-rose-400 to-pink-600" },
                    orange: { glow: "hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]", iconBg: "bg-gradient-to-br from-orange-400 to-red-500" },
                    cyan: { glow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]", iconBg: "bg-gradient-to-br from-cyan-300 to-blue-500" },
                    emerald: { glow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]", iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600" },
                    purple: { glow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]", iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
                    indigo: { glow: "hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]", iconBg: "bg-gradient-to-br from-indigo-400 to-violet-600" }
                  };
                  const theme = themes[item.color];
                  const IconCmp = item.icon;

                  return (
                    <button 
                      key={idx}
                      onClick={() => setBaremosModal({ show: true, key: item.key, title: `${item.title} - ${item.desc}`, colorClass: item.color, icon: item.icon })}
                      className={`bg-[#1e2336] p-5 md:p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-2 ${theme.glow} hover:border-white/20 relative group overflow-hidden`}
                    >
                       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-6 ${theme.iconBg} border border-white/20 text-white`}>
                         <IconCmp size={24} className="drop-shadow-md" />
                       </div>
                       <h5 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white leading-tight mb-1">{item.title}</h5>
                       <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter text-slate-400">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VISTA ESTUDIANTE - REGISTRO */}
        {userData.role === 'student' && activeTab === 'registro' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in">
            <div className="xl:col-span-7 space-y-8 pb-20">
              <div className="bg-[#0f172a]/90 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-xl">
                <h3 className="text-lg font-black text-white uppercase italic mb-4 flex items-center gap-2 tracking-tighter"><Calendar className="text-blue-500" size={20}/> Fase a Reportar</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {["Inicial", ...MESES].map(m => {
                    const isB = historial.some(h => h.etapa === m && h.matricula === userData.matricula);
                    const isSelected = datosRegistro.etapa === m;
                    let btnStyle = 'bg-[#131620] text-slate-400 hover:bg-[#24293d] border-2 border-white/5 hover:text-white';
                    if (isSelected) btnStyle = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border-b-4 border-blue-700';
                    else if (isB) btnStyle = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30';
                    
                    return (
                      <button 
                        key={m} 
                        onClick={() => handlePhaseClick(m)} 
                        className={`flex-1 min-w-[80px] md:min-w-[100px] py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${btnStyle}`}
                      >
                        {isB && !isSelected && <Eye size={12} className="inline mr-1"/>} 
                        {!isB && !isSelected && <Calendar size={12} className="inline mr-1"/>} 
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0f172a]/90 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 backdrop-blur-2xl space-y-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                 {(() => {
                   const isViewingMode = historial.some(h => h.etapa === datosRegistro.etapa && h.matricula === userData.matricula);
                   return (
                     <>
                       <div className="relative z-10 border-b border-[#24293d] pb-8">
                         <h2 className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><User size={20}/> Perfil Biológico</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                           <SelectField label="Sexo Biológico" value={datosRegistro.sexo} onChange={e => setDatosRegistro({...datosRegistro, sexo: e.target.value})} options={[{label: "Masculino", value: "M"}, {label: "Femenino", value: "F"}]} icon={User} colorClass="blue" disabled={isViewingMode} />
                           <InputField label="Edad" value={datosRegistro.edad} onChange={e => setDatosRegistro({...datosRegistro, edad: e.target.value})} unit="años" type="number" icon={Calendar} colorClass="blue" disabled={isViewingMode} />
                         </div>
                       </div>
                       
                       <div className="relative z-10">
                         <h2 className="text-xs md:text-sm font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Ruler size={20}/> Medidas Generales</h2>
                         <div className="grid grid-cols-2 gap-4 md:gap-6">
                           <InputField label="Peso Corporal" value={datosRegistro.peso} onChange={e => setDatosRegistro({...datosRegistro, peso: e.target.value})} unit="kg" colorClass="indigo" disabled={isViewingMode} />
                           <InputField label="Estatura / Talla" value={datosRegistro.talla} onChange={e => setDatosRegistro({...datosRegistro, talla: e.target.value})} unit="cm" colorClass="indigo" disabled={isViewingMode} />
                           <InputField label="Cintura" value={datosRegistro.cintura} onChange={e => setDatosRegistro({...datosRegistro, cintura: e.target.value})} unit="cm" colorClass="indigo" disabled={isViewingMode} />
                           <InputField label="Cadera" value={datosRegistro.cadera} onChange={e => setDatosRegistro({...datosRegistro, cadera: e.target.value})} unit="cm" colorClass="indigo" disabled={isViewingMode} />
                         </div>
                       </div>

                       <div className="relative z-10">
                         <h2 className="text-xs md:text-sm font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Activity size={20}/> Composición Corporal</h2>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                           <InputField label="Grasa Corporal" value={datosRegistro.grasaCorporal} onChange={e => setDatosRegistro({...datosRegistro, grasaCorporal: e.target.value})} unit="%" colorClass="rose" icon={Flame} disabled={isViewingMode}/>
                           <InputField label="Grasa Visceral" value={datosRegistro.grasaVisceral} onChange={e => setDatosRegistro({...datosRegistro, grasaVisceral: e.target.value})} unit="Lvl" colorClass="orange" icon={ShieldAlert} disabled={isViewingMode}/>
                           <InputField label="Musc. Esquelético" value={datosRegistro.musculoEsqueletico} onChange={e => setDatosRegistro({...datosRegistro, musculoEsqueletico: e.target.value})} unit="%" colorClass="cyan" icon={BicepsFlexed} disabled={isViewingMode}/>
                         </div>
                       </div>

                       <div className="relative z-10">
                         <h2 className="text-xs md:text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Heart size={20}/> Test Ruffier Dickson</h2>
                         <div className="grid grid-cols-3 gap-3 md:gap-6">
                           <InputField label="P0 (Reposo)" value={datosRegistro.p0} onChange={e => setDatosRegistro({...datosRegistro, p0: e.target.value})} colorClass="emerald" disabled={isViewingMode} />
                           <InputField label="P1 (Post)" value={datosRegistro.p1} onChange={e => setDatosRegistro({...datosRegistro, p1: e.target.value})} colorClass="emerald" disabled={isViewingMode} />
                           <InputField label="P2 (Recup)" value={datosRegistro.p2} onChange={e => setDatosRegistro({...datosRegistro, p2: e.target.value})} colorClass="emerald" disabled={isViewingMode} />
                         </div>
                       </div>

                       <div className="relative z-10">
                         <h2 className="text-xs md:text-sm font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Zap size={20}/> Potencia Muscular</h2>
                         <div className="grid grid-cols-2 gap-4 md:gap-6">
                           <InputField label="Tren Superior" value={datosRegistro.trenSuperior} onChange={e => setDatosRegistro({...datosRegistro, trenSuperior: e.target.value})} unit="reps" colorClass="purple" icon={Zap} disabled={isViewingMode}/>
                           <InputField label="Tren Inferior" value={datosRegistro.trenInferior} onChange={e => setDatosRegistro({...datosRegistro, trenInferior: e.target.value})} unit="reps" colorClass="purple" icon={TrendingUp} disabled={isViewingMode}/>
                         </div>
                       </div>
                     </>
                   );
                 })()}
              </div>
            </div>

            {/* Panel de Interpretaciones Detallado */}
            <div className="xl:col-span-5">
              <div className="sticky top-8 space-y-6 bg-[#0f172a]/90 backdrop-blur-3xl p-6 md:p-8 rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-500"></div>
                <h2 className="text-xl md:text-2xl font-black text-white italic mb-8 flex items-center gap-3 tracking-tighter"><Eye className="text-cyan-400" /> Resultados Clínicos</h2>
                
                <div className="flex flex-col gap-4">
                   <div className={`p-6 rounded-[2rem] border flex flex-col items-center justify-center relative overflow-hidden shadow-inner transition-all ${resultadosActuales.ruffierInterp.bg}`}>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 relative z-10 drop-shadow-md">Test Ruffier Dickson</p>
                      <span className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg relative z-10 my-2">{String(resultadosActuales.ruffierVal ?? '--')}</span>
                      <p className={`text-[12px] font-black uppercase tracking-widest relative z-10 drop-shadow-md ${resultadosActuales.ruffierInterp.color}`}>{String(resultadosActuales.ruffierInterp.label)}</p>
                      <p className="mt-1 text-[10px] text-slate-300 italic font-bold relative z-10">{String(resultadosActuales.ruffierInterp.desc)}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { l: "Grasa Corporal", v: datosRegistro.grasaCorporal, u: "%", i: resultadosActuales.gcInterp },
                        { l: "Grasa Visceral", v: datosRegistro.grasaVisceral, u: "Lvl", i: resultadosActuales.gvInterp },
                        { l: "Músculo Esquelético", v: datosRegistro.musculoEsqueletico, u: "%", i: resultadosActuales.meInterp },
                        { l: "Índice Masa Corp.", v: resultadosActuales.imc, u: "", i: resultadosActuales.imcInterp },
                        { l: "Cintura-Cadera", v: resultadosActuales.icc, u: "", i: resultadosActuales.iccInterp },
                        { l: "Tren Superior", v: datosRegistro.trenSuperior, u: "Reps", i: resultadosActuales.supInterp },
                        { l: "Tren Inferior", v: datosRegistro.trenInferior, u: "Reps", i: resultadosActuales.infInterp }
                      ].map((item, idx) => (
                        <div key={idx} className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${item.i.bg} ${idx === 6 ? 'col-span-2 md:col-span-1' : ''}`}>
                          <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md h-6 flex items-center">{item.l}</p>
                          <p className="text-2xl font-black text-white">{String(item.v || '--')}<span className="text-xs opacity-50 ml-1">{item.u}</span></p>
                          <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${item.i.color}`}>{String(item.i.label)}</p>
                          <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(item.i.desc)}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#24293d] space-y-6 relative z-10">
                   {historial.some(h => h.etapa === datosRegistro.etapa && h.matricula === userData.matricula) ? (
                      <div className="flex items-start gap-3 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/30 shadow-inner relative z-10 w-full mt-6">
                        <Eye size={18} className="text-blue-400 shrink-0" />
                        <p className="text-[10px] font-black text-blue-400 uppercase leading-tight tracking-tighter">Estás viendo los datos de una fase completada. Estos registros son de solo lectura y no pueden modificarse.</p>
                      </div>
                   ) : (
                     <div className="space-y-4">
                       {regError && (
                          <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl animate-in shake duration-300 shadow-inner">
                            <AlertCircle className="text-orange-500 shrink-0" size={16} />
                            <p className="text-[10px] font-black text-orange-500 uppercase leading-tight tracking-tight">{regError}</p>
                          </div>
                       )}
                       <button onClick={finalizarRegistro} className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-4 border border-cyan-400/50">
                          <Save size={20}/> Guardar Fase Oficial
                       </button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA ESTUDIANTE - EVOLUCIÓN (VITRINA) */}
        {userData.role === 'student' && activeTab === 'evolución' && evol && (
          <div className="animate-in fade-in space-y-10 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-gradient-to-r from-blue-600/20 to-transparent p-8 md:p-10 rounded-[3rem] border-l-8 border-blue-600 shadow-2xl backdrop-blur-xl h-fit relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                 <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-tight relative z-10">{String(userData.nombre || 'Mi Perfil')}</h2>
                 <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest relative z-10">{String(userData.unidadAcademica)} • ID: {String(userData.matricula)}</p>
              </div>
              <div className="bg-[#0f172a]/90 backdrop-blur-xl p-8 rounded-[3rem] border border-emerald-500/30 flex flex-col justify-center relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] group transition-all hover:border-emerald-400/50">
                 <div className="absolute top-0 right-0 p-6 text-emerald-500/10 group-hover:scale-110 transition-transform"><Trophy size={100}/></div>
                 <span className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest">Estado de Progreso</span>
                 <h4 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter relative z-10">{String(evol?.hL?.area || 'Cargando')}</h4>
                 <p className="text-xs text-slate-400 font-bold leading-relaxed italic relative z-10">{String(evol?.hL?.msg || 'Verificando datos...')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
               <ProgressLineChart data={evol?.ruf} label="Test Ruffier Dickson" unit="pts" colorKey="emerald" />
               <ProgressLineChart data={evol?.gc} label="Grasa Corporal" unit="%" colorKey="rose" />
               <ProgressLineChart data={evol?.me} label="Músculo Esquelético" unit="%" colorKey="cyan" />
               <ProgressLineChart data={evol?.sup} label="Tren Superior" unit="reps" colorKey="blue" />
               <ProgressLineChart data={evol?.inf} label="Tren Inferior" unit="reps" colorKey="purple" />
               <ProgressLineChart data={evol?.peso} label="Evolución de Peso" unit="kg" colorKey="indigo" />
               <ProgressLineChart data={evol?.gv} label="Grasa Visceral" unit="Nivel" colorKey="orange" />
            </div>

            {/* SECCIÓN: VITRINA DE LOGROS */}
            {(() => {
              const recs = evol.recs || [];
              const hasProgress = recs.length > 1; 
              const ultimo = recs.length > 0 ? recs[recs.length - 1] : null;
              const primero = recs.length > 0 ? recs[0] : null;

              const estadosMedallas = [
                hasProgress, 
                recs.length >= 3, 
                recs.length === 4, 
                hasProgress && (parseFloat(ultimo.ruffierVal) < parseFloat(primero.ruffierVal)) && (parseFloat(ultimo.trenSuperior) > parseFloat(primero.trenSuperior)) && (parseFloat(ultimo.trenInferior) > parseFloat(primero.trenInferior)),
                hasProgress && ultimo && parseFloat(ultimo.imc) >= 18.5 && parseFloat(ultimo.imc) < 25, 
                hasProgress && ultimo && ((userData.sexo === 'M' && parseFloat(ultimo.icc) < 0.95) || (userData.sexo !== 'M' && parseFloat(ultimo.icc) < 0.80)), 
                ultimo && parseFloat(ultimo.grasaVisceral) <= 9, 
                hasProgress && (parseFloat(ultimo.cintura) < parseFloat(primero.cintura)),
                hasProgress && ultimo.grasaCorporal && (parseFloat(ultimo.grasaCorporal) < parseFloat(primero.grasaCorporal)), 
                ultimo && ultimo.musculoEsqueletico && ((userData.sexo === 'M' && parseFloat(ultimo.musculoEsqueletico) >= 33.3) || (userData.sexo !== 'M' && parseFloat(ultimo.musculoEsqueletico) >= 24.3)), 
                hasProgress && (parseFloat(ultimo.ruffierVal) < parseFloat(primero.ruffierVal)), 
                ultimo && parseFloat(ultimo.ruffierVal) <= 5,
                hasProgress && (parseFloat(ultimo.trenSuperior) > parseFloat(primero.trenSuperior)), 
                hasProgress && (parseFloat(ultimo.trenInferior) > parseFloat(primero.trenInferior)), 
                ultimo && ((userData.sexo === 'M' && (parseFloat(ultimo.trenSuperior) >= 22 || parseFloat(ultimo.trenInferior) >= 43)) || (userData.sexo !== 'M' && (parseFloat(ultimo.trenSuperior) >= 15 || parseFloat(ultimo.trenInferior) >= 39))),
                hasCompletedCategory("Mes 1", "Nutrición"), hasCompletedCategory("Mes 1", "Cultura Física"), 
                hasCompletedCategory("Mes 2", "Nutrición"), hasCompletedCategory("Mes 2", "Cultura Física"), 
                hasCompletedCategory("Mes 3", "Nutrición"), hasCompletedCategory("Mes 3", "Cultura Física")
              ];

              const totalMedallasBases = estadosMedallas.length;
              const medallasObtenidas = estadosMedallas.filter(Boolean).length;
              const medallasFaltantes = totalMedallasBases - medallasObtenidas;
              const platinoDesbloqueado = medallasObtenidas === totalMedallasBases;
              const porcentajeProgreso = (medallasObtenidas / totalMedallasBases) * 100;

              return (
                <div className="bg-[#0f172a]/90 backdrop-blur-3xl p-6 md:p-10 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden mt-6">
                  <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  <h3 className="text-2xl md:text-3xl font-black text-white italic mb-2 flex items-center gap-3 md:gap-4 relative z-10 tracking-tighter"><Award className="text-cyan-400" size={32} /> Vitrina de Logros</h3>
                  
                  <div className="bg-[#131620]/80 p-5 rounded-3xl border border-white/5 mb-8 relative z-10 shadow-inner">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Progreso de Colección</p>
                        <p className="text-xs md:text-sm font-black text-white mt-1">{medallasObtenidas} obtenidas <span className="text-slate-500 font-normal mx-2">|</span> <span className="text-cyan-400">{medallasFaltantes} por desbloquear</span></p>
                      </div>
                      <div className="text-right">
                         <span className="text-3xl font-black text-white italic tracking-tighter">{Math.round(porcentajeProgreso)}<span className="text-lg text-cyan-400">%</span></span>
                      </div>
                    </div>
                    <div className="w-full bg-[#0f172a] h-3 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-1000 ease-out" style={{ width: `${porcentajeProgreso}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
                    {[
                      { id: 1, c: estadosMedallas[0], n: "Primer Paso", d: "Mes 1 Completo", ic: ArrowUpRight, cl: "slate" },
                      { id: 2, c: estadosMedallas[1], n: "Disciplina", d: "Mes 2 Completo", ic: Calendar, cl: "yellow" },
                      { id: 3, c: estadosMedallas[2], n: "Constancia", d: "Reto Finalizado", ic: Star, cl: "orange" },
                      { id: 4, c: estadosMedallas[3], n: "Atleta Integral", d: "Mejora 3 pruebas", ic: Trophy, cl: "orange" },
                      { id: 5, c: estadosMedallas[4], n: "Equilibrio", d: "IMC Saludable", ic: Weight, cl: "cyan" },
                      { id: 6, c: estadosMedallas[5], n: "Riesgo Cero", d: "ICC Bajo Riesgo", ic: ShieldCheck, cl: "pink" },
                      { id: 7, c: estadosMedallas[6], n: "Escudo Interno", d: "Grasa Visc. Sana", ic: ShieldAlert, cl: "yellow" },
                      { id: 8, c: estadosMedallas[7], n: "Core de Acero", d: "Reduce Cintura", ic: Ruler, cl: "lime" },
                      { id: 9, c: estadosMedallas[8], n: "Definición", d: "Mejora Grasa Corp.", ic: Flame, cl: "rose" },
                      { id: 10, c: estadosMedallas[9], n: "Hipertrofia", d: "Músculo Sano", ic: BicepsFlexed, cl: "blue" },
                      { id: 11, c: estadosMedallas[10], n: "Motor Imparable", d: "Mejora Ruffier", ic: Heart, cl: "emerald" },
                      { id: 12, c: estadosMedallas[11], n: "Cardio Élite", d: "Ruffier Excelente", ic: Activity, cl: "red" },
                      { id: 13, c: estadosMedallas[12], n: "Fuerza Bruta", d: "Mejora Tren Sup.", ic: Zap, cl: "blue" },
                      { id: 14, c: estadosMedallas[13], n: "Pot. Explosiva", d: "Mejora Tren Inf.", ic: TrendingUp, cl: "purple" },
                      { id: 15, c: estadosMedallas[14], n: "Fuerza Élite", d: "Fuerza Excelente", ic: Award, cl: "indigo" },
                      { id: 16, c: estadosMedallas[15], n: "Nutrición M1", d: "Experto Nutrición", ic: Apple, cl: "rose" },
                      { id: 17, c: estadosMedallas[16], n: "Física M1", d: "Experto Físico", ic: Zap, cl: "yellow" },
                      { id: 18, c: estadosMedallas[17], n: "Nutrición M2", d: "Experto Nutrición", ic: Apple, cl: "rose" },
                      { id: 19, c: estadosMedallas[18], n: "Física M2", d: "Experto Físico", ic: Zap, cl: "yellow" },
                      { id: 20, c: estadosMedallas[19], n: "Nutrición M3", d: "Experto Nutrición", ic: Apple, cl: "rose" },
                      { id: 21, c: estadosMedallas[20], n: "Física M3", d: "Experto Físico", ic: Zap, cl: "yellow" },
                      { id: 22, c: platinoDesbloqueado, n: "Platino Absoluto", d: "Colección Completa", ic: Crown, cl: "platinum", col: "col-span-2 md:col-span-3 lg:col-span-4 mt-4" }
                    ].map((m, idx) => {
                      const themes = {
                        yellow: { text: "text-yellow-200", border: "border-yellow-500/50", glow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]", iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500" },
                        emerald: { text: "text-emerald-200", border: "border-emerald-500/50", glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]", iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600" },
                        blue: { text: "text-blue-200", border: "border-blue-500/50", glow: "shadow-[0_0_30px_rgba(59,130,246,0.4)]", iconBg: "bg-gradient-to-br from-blue-400 to-indigo-600" },
                        purple: { text: "text-purple-200", border: "border-purple-500/50", glow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]", iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
                        cyan: { text: "text-cyan-200", border: "border-cyan-500/50", glow: "shadow-[0_0_30px_rgba(6,182,212,0.4)]", iconBg: "bg-gradient-to-br from-cyan-300 to-blue-500" },
                        pink: { text: "text-pink-200", border: "border-pink-500/50", glow: "shadow-[0_0_30px_rgba(236,72,153,0.4)]", iconBg: "bg-gradient-to-br from-pink-400 to-rose-600" },
                        orange: { text: "text-orange-200", border: "border-orange-500/50", glow: "shadow-[0_0_30px_rgba(249,115,22,0.4)]", iconBg: "bg-gradient-to-br from-orange-400 to-red-500" },
                        red: { text: "text-red-200", border: "border-red-500/50", glow: "shadow-[0_0_30px_rgba(239,68,68,0.4)]", iconBg: "bg-gradient-to-br from-red-500 to-rose-700" },
                        slate: { text: "text-slate-200", border: "border-slate-500/50", glow: "shadow-[0_0_30px_rgba(148,163,184,0.4)]", iconBg: "bg-gradient-to-br from-slate-400 to-slate-600" },
                        lime: { text: "text-lime-200", border: "border-lime-500/50", glow: "shadow-[0_0_30px_rgba(163,230,53,0.4)]", iconBg: "bg-gradient-to-br from-lime-400 to-green-600" },
                        indigo: { text: "text-indigo-200", border: "border-indigo-500/50", glow: "shadow-[0_0_30px_rgba(99,102,241,0.4)]", iconBg: "bg-gradient-to-br from-indigo-400 to-violet-600" },
                        rose: { text: "text-rose-200", border: "border-rose-500/50", glow: "shadow-[0_0_30px_rgba(225,29,72,0.4)]", iconBg: "bg-gradient-to-br from-rose-400 to-pink-600" },
                        platinum: { text: "text-slate-800", border: "border-white/80", glow: "shadow-[0_0_40px_rgba(255,255,255,0.7)]", iconBg: "bg-gradient-to-br from-slate-100 via-white to-slate-300", cardBg: "bg-gradient-to-br from-slate-200 to-slate-400" }
                      };
                      const theme = themes[m.cl];
                      const active = m.c;
                      const IconComponent = m.ic;
                      let containerClasses = `p-5 md:p-6 rounded-[2.5rem] border-[1px] flex flex-col items-center text-center transition-all duration-500 relative group cursor-pointer ${m.col || ''} `;
                      if (active) {
                         containerClasses += m.cl === 'platinum' ? theme.cardBg + " " : "bg-[#1e2336] ";
                         containerClasses += theme.border + " " + theme.glow + " hover:scale-105 hover:-translate-y-2 z-10 hover:z-20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";
                      } else {
                         containerClasses += "bg-[#0f172a]/40 border-white/5 opacity-60 grayscale-[0.8] hover:grayscale-[0.4] hover:opacity-100 shadow-none";
                      }

                      return (
                        <div 
                          key={m.id}
                          onClick={() => setModalMedal({ show: true, title: m.n, desc: m.d, detail: "Medalla representativa.", icon: IconComponent, themeClass: theme.iconBg, colorClass: m.cl, active: active })}
                          className={containerClasses}
                          style={active ? { animationDelay: `${(idx*0.2).toFixed(1)}s`, animationName: 'floatMedal', animationDuration: '4s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' } : {}}
                        >
                          {active && m.cl !== 'platinum' && <div className={`absolute top-[-30px] right-[-30px] w-24 h-24 blur-[35px] rounded-full opacity-40 ${theme.iconBg}`}></div>}
                          
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 border relative z-10 transition-transform duration-500 shadow-inner
                            ${active ? `${theme.iconBg} border-white/30 text-white shadow-lg scale-110 group-hover:scale-125 group-hover:rotate-12` : 'bg-[#131620] border-white/5 text-slate-500'}`}>
                            {active ? <IconComponent size={24} className={`md:w-7 md:h-7 drop-shadow-md ${m.cl === 'platinum' ? 'text-slate-800' : 'text-white'}`} /> : <Lock size={20} className="md:w-6 md:h-6" />}
                          </div>
                          
                          <h5 className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1 md:mb-2 relative z-10 leading-tight 
                            ${active ? (m.cl === 'platinum' ? 'text-slate-900 drop-shadow-sm' : 'text-white drop-shadow-md') : 'text-slate-500'}`}>{m.n}</h5>
                          
                          <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tighter relative z-10 leading-tight px-1 
                            ${active ? theme.text : 'text-slate-600'}`}>{m.d}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;