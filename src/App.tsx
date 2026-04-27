import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Activity, Ruler, Weight, ClipboardCheck, Trash2, Save, Download, 
  TrendingUp, Heart, AlertCircle, Zap, Award, BarChart3, Hash, Calendar, 
  ArrowUpRight, Info, Lock, School, Sparkles, Loader2, X, Stethoscope, 
  Trophy, Star, LogOut, LogIn, UserPlus, Users, Eye, Key, AlertTriangle, FileUp, FileSpreadsheet, ShieldCheck,
  Flame, BicepsFlexed, ShieldAlert, Crown, PlayCircle, CheckCircle2, Apple, Video, ChevronRight, PlusCircle,
  Mail, Phone, Clock
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBi8Iw_DDqiW6duwgJEbIjIl2QiEjWhoFE",
  authDomain: "reto-activate-dd3cb.firebaseapp.com",
  projectId: "reto-activate-dd3cb",
  storageBucket: "reto-activate-dd3cb.firebasestorage.app",
  messagingSenderId: "230551697596",
  appId: "1:230551697596:web:6fc8a801f9445e74ea78b9",
  measurementId: "G-7HXE5F4TZC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'reto-activate-buap';

const loadXLSX = () => {
  return new Promise((resolve) => {
    if (window.XLSX) return resolve();
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

const UNIDADES_ACADEMICAS = [
  "Facultad de Administración", "Facultad de Arquitectura", "Facultad de Artes",
  "Facultad de Artes Plásticas y Audiovisuales", "Facultad de Ciencias Agrícolas y Pecuarias",
  "Facultad de Ciencias Biológicas", "Facultad de Ciencias de la Computación",
  "Facultad de Ciencias de la Comunicación", "Facultad de Ciencias de la Electrónica",
  "Facultad de Ciencias Físico Matemáticas", "Facultad de Ciencias Políticas y Sociales",
  "Facultad de Ciencias Químicas", "Facultad de Contaduría Pública",
  "Facultad de Cultura Física", "Facultad de Derecho", "Facultad de Economía",
  "Facultad de Enfermería", "Facultad de Estomatología", "Facultad de Filosofía y Letras",
  "Facultad de Ingeniería", "Facultad de Ingeniería Química", "Facultad de Lenguas",
  "Facultad de Medicina", "Facultad de Medicina Veterinaria y Zootecnia",
  "Facultad de Psicología", "Escuela de Biología", "Instituto de Ciencias (ICUAP)",
  "Instituto de Ciencias de Gobierno y Desarrollo Estratégico", "Instituto de Ciencias Sociales y Humanidades \"Alfonso Vélez Pliego\"",
  "Instituto de Física \"Ing. Luis Rivera Terrazas\"", "Instituto de Fisiología",
  "Bachillerato Internacional \"5 de Mayo\"", "Preparatoria \"2 de Octubre de 1968\"",
  "Preparatoria \"Alfonso Calderón Moreno\"", "Preparatoria \"Emiliano Zapata\"",
  "Preparatoria \"Gral. Lázaro Cárdenas del Río\"", "Preparatoria \"Lic. Benito Juárez García\"",
  "Preparatoria Regional \"Enrique Cabrera Barroso\"", "Preparatoria Regional \"Simón Bolívar\"",
  "Preparatoria Urbana \"Enrique Cabrera Barroso\"", "Complejo Regional Centro",
  "Complejo Regional Mixteca", "Complejo Regional Nororiental",
  "Complejo Regional Norte", "Complejo Regional Sur"
];
const CATEGORIAS_CONTENIDO = ["Nutrición", "Cultura Física"];
const MESES = ["Mes 1", "Mes 2", "Mes 3"];

const getNormalizedVideos = (videosObj, mes, cat) => {
  if (!videosObj) return [];
  const key = `${mes}-${cat}`;
  const val = videosObj[key];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') return [val];
  return [];
};

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#030508]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#131a2a] to-[#0a0f1a] border border-white/10 p-6 md:p-8 rounded-[2.5rem] w-[90%] max-w-[400px] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden">
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white text-center mb-2 uppercase tracking-tighter drop-shadow-md">{titulo}</h3>
        <p className="text-slate-400 text-xs text-center mb-8 font-bold leading-relaxed">{mensaje}</p>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button onClick={onClose} className="py-4 bg-[#1a2235] text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border border-white/5 hover:bg-[#232d46]">Cancelar</button>
          <button onClick={onConfirm} className="py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_10px_20px_rgba(225,29,72,0.4)] transition-all border border-red-400/50 hover:brightness-110">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", icon: Icon, placeholder, unit, colorClass = "cyan", disabled = false }) => {
  const themes = {
    blue: "focus-within:border-blue-500 text-blue-400", emerald: "focus-within:border-emerald-500 text-emerald-400",
    rose: "focus-within:border-rose-500 text-rose-400", indigo: "focus-within:border-indigo-500 text-indigo-400",
    orange: "focus-within:border-orange-500 text-orange-400", cyan: "focus-within:border-cyan-500 text-cyan-400",
    purple: "focus-within:border-purple-500 text-purple-400", black: "focus-within:border-white/30 text-slate-300"
  };

  return (
    <div className={`relative flex flex-col p-4 md:p-5 rounded-[1.5rem] bg-[#0c1220]/80 backdrop-blur-md border border-white/5 transition-all duration-300 ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : `hover:border-white/10 ${themes[colorClass]}`}`}>
      <div className={`flex items-center gap-2 mb-1.5 font-black uppercase text-[9px] md:text-[10px] tracking-widest opacity-80`}>
        {Icon && <Icon size={14} />} <span className="truncate">{label}</span>
      </div>
      <div className="flex items-center">
        <input type={type} name={name} value={value || ""} onChange={onChange} disabled={disabled} placeholder={placeholder} className="w-full bg-transparent outline-none text-lg md:text-xl font-black text-white placeholder:text-white/20 transition-all" />
        {unit && <span className="text-[10px] font-black uppercase text-slate-500 ml-2 bg-white/5 px-2 py-1 rounded-md">{unit}</span>}
      </div>
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, icon: Icon, disabled = false }) => {
  return (
    <div className={`relative flex flex-col p-4 md:p-5 rounded-[1.5rem] bg-[#0c1220]/80 backdrop-blur-md border border-white/5 transition-all duration-300 ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'focus-within:border-cyan-500 text-cyan-400'}`}>
      <div className="flex items-center gap-2 mb-1.5 font-black uppercase text-[9px] md:text-[10px] tracking-widest opacity-80">
        {Icon && <Icon size={14} />} {label}
      </div>
      <select name={name} value={value || ""} onChange={onChange} disabled={disabled} className="w-full bg-transparent outline-none text-sm md:text-base font-black text-white appearance-none cursor-pointer">
        <option value="" className="bg-slate-900">Seleccionar...</option>
        {options.map(o => <option key={o.value || o} value={o.value || o} className="bg-slate-900">{o.label || o}</option>)}
      </select>
    </div>
  );
};

const ProgressLineChart = ({ data, label, unit, colorKey }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  if (!data || data.length === 0) return null;

  const validData = data.filter(d => d && !isNaN(parseFloat(d.value)));
  if (validData.length === 0) return null;

  const maxVal = Math.max(...validData.map(d => Math.abs(parseFloat(d.value) || 0)), 1) * 1.3;
  const colorMaps = {
    blue: { stroke: "#3b82f6", glow: "rgba(59,130,246,0.5)" }, purple: { stroke: "#a855f7", glow: "rgba(168,85,247,0.5)" }, 
    yellow: { stroke: "#f59e0b", glow: "rgba(245,158,11,0.5)" }, emerald: { stroke: "#10b981", glow: "rgba(16,185,129,0.5)" },
    rose: { stroke: "#f43f5e", glow: "rgba(244,63,94,0.5)" }, cyan: { stroke: "#06b6d4", glow: "rgba(6,182,212,0.5)" }, 
    indigo: { stroke: "#6366f1", glow: "rgba(99,102,241,0.5)" }, orange: { stroke: "#f97316", glow: "rgba(249,115,22,0.5)" }
  };
  const theme = colorMaps[colorKey] || colorMaps.blue;

  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1 || 1)) * 100;
    const y = 100 - ((parseFloat(item.value) || 0) / maxVal) * 100;
    return { x, y, val: item.value, mes: item.mes };
  });
  
  const pathData = points.length > 1 
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : `M 0 ${points[0]?.y || 50} L 100 ${points[0]?.y || 50}`;

  return (
    <div className="bg-gradient-to-br from-[#0c1220]/80 to-[#080b14]/80 p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 rounded-full pointer-events-none`} style={{backgroundColor: theme.stroke}}></div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 drop-shadow-md" style={{color: theme.stroke}}>
          <TrendingUp size={14} /> {label}
        </h4>
        <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase bg-white/5 px-2 py-1 rounded-lg">{unit}</span>
      </div>
      
      <div className="relative h-32 md:h-40 w-full mb-4 z-10">
        <svg viewBox="0 -10 100 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${colorKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={`${pathData} L 100 100 L 0 100 Z`} fill={`url(#grad-${colorKey})`} />
          <path d={pathData} fill="none" stroke={theme.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i} onClick={() => setSelectedPoint(i === selectedPoint ? null : i)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={selectedPoint === i ? "6" : "4"} fill={theme.stroke} className="transition-all duration-300" style={{ filter: `drop-shadow(0 0 6px ${theme.stroke})` }}/>
              <circle cx={p.x} cy={p.y} r="2" fill="#fff" />
              {(selectedPoint === i || points.length === 1) && (
                <g className="animate-in fade-in zoom-in duration-200">
                  <rect x={p.x - 18} y={p.y - 28} width="36" height="18" rx="4" fill="#1e293b" fillOpacity="0.9" stroke="rgba(255,255,255,0.1)"/>
                  <text x={p.x} y={p.y - 15} textAnchor="middle" className="text-[9px] md:text-[10px] font-black fill-white">{p.val}</text>
                </g>
              )}
            </g>
          ))}
        </svg>
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
          {points.map((p, i) => <span key={i} className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors ${selectedPoint === i ? 'text-white' : 'text-slate-600'}`}>{p.mes}</span>)}
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registro');
  const [historial, setHistorial] = useState([]);
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [configGlobal, setConfigGlobal] = useState({ desbloqueos: {}, videos: {} });
  const [showSurvey, setShowSurvey] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, type: null, label: '' });
  const [videoInputs, setVideoInputs] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para validaciones de errores
  const [loginError, setLoginError] = useState("");
  const [regError, setRegError] = useState("");

  // Estado para el modal de detalle de las medallas
  const [medalModal, setMedalModal] = useState({ show: false, title: '', desc: '', detail: '', icon: null, themeClass: '', colorClass: '', active: false });

  const [nuevoEstudiante, setNuevoEstudiante] = useState({ matricula: '', password: '', nombre: '', unidadAcademica: '', edad: '', sexo: 'M' });
  const [encuesta, setEncuesta] = useState({
    condicionMedica: '', dolorCronico: '', limitacionEspecifica: '', medicamentos: '',
    objetivoPrincipal: '', nivelActividad: '', deportePasado: '', actividadesAtractivas: '',
    tiempoEntreno: '', lugarEntreno: '', implementos: '', incluyeCardioFuerza: '',
    obstaculoConstancia: '', calidadSueno: '', nivelEnergia: '', tipoMotivacion: '',
    correoInstitucional: '', telefono: '', horarioContacto: '', defectosPostura: '', antecedentesFamiliares: ''
  });
  const [datosRegistro, setDatosRegistro] = useState({ etapa: 'Inicial', peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: '' });

  useEffect(() => {
    const init = async () => {
      try { 
        await loadXLSX();
        await signInAnonymously(auth); 
      } catch (e) { console.error(e); }
    };
    init();
    onAuthStateChanged(auth, (user) => setLoading(false));

    const unsubEvals = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistorial(data.sort((a,b) => b.timestamp - a.timestamp)); 
    });
    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), (snap) => {
      setUsuariosLista(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setConfigGlobal(docSnap.data());
      }
    });

    return () => { unsubEvals(); unsubUsers(); unsubConfig(); };
  }, []);

  const handleLogin = async (m, p) => {
    setLoginError("");
    const mat = m.trim().toUpperCase();
    const pass = p.trim();

    if (!mat || !pass) {
      setLoginError("Por favor, ingresa tu matrícula y contraseña completas.");
      return;
    }

    if (mat === 'ADMIN' && pass === 'RETO2024') {
      setUserData({ role: 'admin', nombre: 'Admin DAES', matricula: 'ADMIN' });
      setActiveTab('usuarios');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', mat));
      if (userDoc.exists() && userDoc.data().password === pass) {
        setUserData(userDoc.data());
        setActiveTab('registro');
      } else {
        setLoginError("La matrícula o la contraseña es incorrecta. Verifica tus datos.");
      }
    } catch (e) {
      setLoginError("Ocurrió un error al intentar iniciar sesión. Reintenta.");
    }
  };

  const registrarUsuario = async () => {
    if (!nuevoEstudiante.matricula || !nuevoEstudiante.password) return alert("Matrícula y clave obligatorias.");
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', String(nuevoEstudiante.matricula).trim().toUpperCase()), {
        ...nuevoEstudiante, matricula: String(nuevoEstudiante.matricula).trim().toUpperCase(), role: 'student', videosVistos: []
      });
      alert("Alumno registrado.");
      setNuevoEstudiante({ matricula: '', password: '', nombre: '', unidadAcademica: '', edad: '', sexo: 'M' });
    } catch (e) { alert("Error al crear usuario."); }
  };

  const triggerDelete = (id, type, label) => setDeleteConfirm({ show: true, id, type, label });
  const executeDelete = async () => {
    const { id, type } = deleteConfirm;
    try {
      if (type === 'user') await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id));
      else await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', id));
      setDeleteConfirm({ show: false, id: null, type: null, label: '' });
    } catch (e) { alert("Error al eliminar."); }
  };

  const downloadTemplate = () => {
    if (!window.XLSX) return alert("Cargando librerías...");
    const data = [
      ["Nombre", "Matricula", "Contraseña", "Unidad Academica"],
      ["Ejemplo Alumno", "2024001", "BUAP2026", "Facultad de Cultura Física"]
    ];
    const ws = window.XLSX.utils.aoa_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
    window.XLSX.writeFile(wb, "Formato_Registro_DAES.xlsx");
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = window.XLSX.utils.sheet_to_json(ws);

        let count = 0;
        for (const row of data) {
          const matricula = String(row.Matricula || row.matricula || "").trim().toUpperCase();
          if (!matricula) continue;
          
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', matricula), {
            nombre: String(row.Nombre || row.nombre || ""), matricula, password: String(row.Contraseña || row.contraseña || row.Password || row.password || "RETO123"),
            unidadAcademica: String(row["Unidad Academica"] || row.unidadAcademica || ""), edad: String(row.Edad || row.edad || ""),
            sexo: String(row.Sexo || row.sexo || "M").toUpperCase(), role: 'student', videosVistos: []
          });

          if (row["Peso Inicial"] || row["Talla Inicial"]) {
             await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), {
               matricula, nombre: String(row.Nombre || row.nombre || ""), etapa: 'Inicial', 
               peso: String(row["Peso Inicial"] || ""), talla: String(row["Talla Inicial"] || ""),
               fecha: new Date().toLocaleDateString(), timestamp: Date.now()
             });
          }
          count++;
        }
        alert(`Se registraron ${count} alumnos.`);
      } catch (err) { alert("Error Excel."); } 
      finally { setIsImporting(false); e.target.value = null; }
    };
    reader.readAsBinaryString(file);
  };

  const exportarHistorial = () => {
    const header = "Fecha,Matricula,Nombre,Etapa,Peso Corporal,Talla,Grasa Corporal,Grasa Visceral,Músculo Esquelético,Ruffier,Tren Superior,Tren Inferior\n";
    const dataRows = historial.map(h => `${h.fecha},${h.matricula},${h.nombre},${h.etapa},${h.peso||''},${h.talla||''},${h.grasaCorporal||''},${h.grasaVisceral||''},${h.musculoEsqueletico||''},${h.ruffierVal||''},${h.trenSuperior||''},${h.trenInferior||''}`).join("\n");
    const blob = new Blob([header + dataRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "Historial_DAES.csv"; a.click();
  };

  const toggleSurveyAccess = async (mat, status) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', mat), { surveyEnabled: !status }); };

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
    return videosList.every((_, i) => userData.videosVistos?.includes(`${key}-${i}`) || (i === 0 && userData.videosVistos?.includes(key)));
  };

  const saveSurvey = async () => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userData.matricula), { encuestaCompletada: true, datosEncuesta: encuesta });
    setShowSurvey(false);
    alert("Expediente guardado.");
  };

  const handlePhaseClick = (m) => {
    setRegError(""); 
    const record = historial.find(h => h.etapa === m);
    if (record) {
      setDatosRegistro(prev => ({ ...prev, ...record, etapa: m }));
    } else {
      setDatosRegistro(prev => ({ ...prev, etapa: m, peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: '' }));
    }
  };

  const resultadosActuales = useMemo(() => {
    const { peso, talla, cintura, cadera, p0, p1, p2, trenSuperior, trenInferior, sexo, edad, grasaCorporal, grasaVisceral, musculoEsqueletico } = datosRegistro;
    const p = parseFloat(peso), t = parseFloat(talla), c = parseFloat(cintura), ca = parseFloat(cadera);
    const gc = parseFloat(grasaCorporal), gv = parseFloat(grasaVisceral), me = parseFloat(musculoEsqueletico);
    const gender = sexo || userData?.sexo || 'M';
    const age = parseInt(edad) || parseInt(userData?.edad) || 20; 
    
    const imc = (p > 0 && t > 0) ? (p / Math.pow(t/100, 2)).toFixed(1) : null;
    let imcInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0c1220] border-white/5" };
    if (imc) {
        if (imc < 18.5) imcInterp = { label: "Bajo Peso", color: "text-blue-400", desc: "Aumento", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (imc < 25) imcInterp = { label: "Saludable", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (imc < 30) imcInterp = { label: "Sobrepeso", color: "text-yellow-400", desc: "Riesgo moderado", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else imcInterp = { label: "Obesidad", color: "text-red-400", desc: "Riesgo alto", bg: "bg-red-500/10 border-red-500/30" };
    }

    const icc = (c > 0 && ca > 0) ? (c / ca).toFixed(2) : null;
    let iccInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0c1220] border-white/5" };
    if (icc) {
        const val = parseFloat(icc);
        const limit = gender === 'M' ? 0.95 : 0.80;
        const upper = gender === 'M' ? 1.0 : 0.85;
        if (val < limit) iccInterp = { label: "Riesgo Bajo", color: "text-emerald-400", desc: "Sano", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (val <= upper) iccInterp = { label: "Riesgo Medio", color: "text-yellow-400", desc: "Precaución", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else iccInterp = { label: "Riesgo Alto", color: "text-red-400", desc: "Peligro", bg: "bg-red-500/10 border-red-500/30" };
    }

    let ruffierVal = (p0 && p1 && p2) ? (((parseFloat(p0) + parseFloat(p1) + parseFloat(p2)) - 200) / 10).toFixed(1) : null;
    let ruffierInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0c1220] border-white/5" };
    if (ruffierVal) {
        const v = parseFloat(ruffierVal);
        if (v <= 0) ruffierInterp = { label: "Excelente", color: "text-blue-400", desc: "Atleta", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v <= 5) ruffierInterp = { label: "Bueno", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v <= 10) ruffierInterp = { label: "Regular", color: "text-yellow-400", desc: "Mejorar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else ruffierInterp = { label: "Malo", color: "text-red-400", desc: "Atención", bg: "bg-red-500/10 border-red-500/30" };
    }

    let supInterp = { label: "Pendiente", color: "text-slate-500", desc: "Datos", bg: "bg-[#0c1220] border-white/5" };
    if (trenSuperior) {
        const v = parseFloat(trenSuperior);
        let b = gender === 'M' ? (age < 29 ? [36, 22, 17] : [30, 17, 11]) : (age < 29 ? [30, 15, 12] : [27, 13, 10]);
        if (v >= b[0]) supInterp = { label: "Excelente", color: "text-emerald-400", desc: "Élite", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v >= b[1]) supInterp = { label: "Bueno", color: "text-blue-400", desc: "Óptimo", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v >= b[2]) supInterp = { label: "Promedio", color: "text-yellow-400", desc: "Estándar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else supInterp = { label: "Regular", color: "text-red-400", desc: "Deficiente", bg: "bg-red-500/10 border-red-500/30" };
    }

    let infInterp = { label: "Pendiente", color: "text-slate-500", desc: "Datos", bg: "bg-[#0c1220] border-white/5" };
    if (trenInferior) {
        const v = parseFloat(trenInferior);
        const b = gender === 'M' ? [48, 43, 37, 33] : [44, 39, 33, 29];
        if (v > b[0]) infInterp = { label: "Excelente", color: "text-emerald-400", desc: "Élite", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v >= b[1]) infInterp = { label: "Bueno", color: "text-blue-400", desc: "Óptimo", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v >= b[2]) infInterp = { label: "Promedio", color: "text-yellow-400", desc: "Estándar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else if (v >= b[3]) infInterp = { label: "Regular", color: "text-orange-400", desc: "Bajo", bg: "bg-orange-500/10 border-orange-500/30" };
        else infInterp = { label: "Malo", color: "text-red-400", desc: "Deficiente", bg: "bg-red-500/10 border-red-500/30" };
    }

    let gcInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0c1220] border-white/5" };
    if (!isNaN(gc)) {
      let b = [];
      if (gender === 'F') {
        if (age < 40) b = [21.0, 33.0, 39.0]; else if (age < 60) b = [23.0, 34.0, 40.0]; else b = [24.0, 36.0, 42.0];
      } else {
        if (age < 40) b = [8.0, 20.0, 25.0]; else if (age < 60) b = [11.0, 22.0, 28.0]; else b = [13.0, 25.0, 30.0];
      }
      if (gc < b[0]) gcInterp = { label: "Bajo", color: "text-blue-400", desc: "Aumentar", bg: "bg-blue-500/10 border-blue-500/30" };
      else if (gc < b[1]) gcInterp = { label: "Normal", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (gc < b[2]) gcInterp = { label: "Elevado", color: "text-yellow-400", desc: "Atención", bg: "bg-yellow-500/10 border-yellow-500/30" };
      else gcInterp = { label: "Muy Elevado", color: "text-red-400", desc: "Riesgo", bg: "bg-red-500/10 border-red-500/30" };
    }

    let gvInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0c1220] border-white/5" };
    if (!isNaN(gv)) {
      if (gv <= 9) gvInterp = { label: "Normal", color: "text-emerald-400", desc: "Saludable", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (gv <= 14) gvInterp = { label: "Alto", color: "text-orange-400", desc: "Riesgo", bg: "bg-orange-500/10 border-orange-500/30" };
      else gvInterp = { label: "Muy Alto", color: "text-red-400", desc: "Peligro", bg: "bg-red-500/10 border-red-500/30" };
    }

    let meInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0c1220] border-white/5" };
    if (!isNaN(me)) {
      let b = [];
      if (gender === 'F') {
        if (age < 40) b = [24.3, 30.4, 35.4]; else if (age < 60) b = [24.1, 30.2, 35.2]; else b = [23.9, 30.0, 35.0];
      } else {
        if (age < 40) b = [33.3, 39.4, 44.1]; else if (age < 60) b = [33.1, 39.2, 43.9]; else b = [32.9, 39.0, 43.7];
      }
      if (me < b[0]) meInterp = { label: "Bajo", color: "text-red-400", desc: "Aumentar", bg: "bg-red-500/10 border-red-500/30" };
      else if (me < b[1]) meInterp = { label: "Normal", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (me < b[2]) meInterp = { label: "Elevado", color: "text-blue-400", desc: "Atleta", bg: "bg-blue-500/10 border-blue-500/30" };
      else meInterp = { label: "Muy Elevado", color: "text-purple-400", desc: "Exceso", bg: "bg-purple-500/10 border-purple-500/30" };
    }

    return { imc, imcInterp, icc, iccInterp, ruffierVal, ruffierInterp, supInterp, infInterp, gcInterp, gvInterp, meInterp };
  }, [datosRegistro, userData]);

  const evolUser = useMemo(() => {
    if (!userData || userData.role !== 'student') return null;
    const records = [...historial].sort((a, b) => ["Inicial", ...MESES].indexOf(a.etapa) - ["Inicial", ...MESES].indexOf(b.etapa));
    const mapData = (key) => ["Inicial", ...MESES].map(m => ({ mes: m, value: records.find(r => r.etapa === m)?.[key] || 0 }));
    
    let highlight = { area: "En Proceso", msg: "Registra datos para iniciar." };
    if (records.length === 1) highlight = { area: "Fase Inicial", msg: "Primera evaluación. ¡Sigue así!" };
    else if (records.length >= 2) {
      const p1 = records[0]; const pL = records[records.length - 1];
      const impSup = (parseFloat(pL.trenSuperior) || 0) - (parseFloat(p1.trenSuperior) || 0);
      const impInf = (parseFloat(pL.trenInferior) || 0) - (parseFloat(p1.trenInferior) || 0);
      const impRuf = (parseFloat(p1.ruffierVal) || 0) - (parseFloat(pL.ruffierVal) || 0); 
      if (impSup <= 0 && impInf <= 0 && impRuf <= 0) highlight = { area: "Activo", msg: "Mantenimiento." };
      else {
         const maxImp = Math.max(impSup, impInf, impRuf);
         if (maxImp === impRuf && impRuf > 0) highlight = { area: "Mejora Cardio", msg: `Ruffier mejoró ${impRuf.toFixed(1)} pts.` };
         else if (maxImp === impSup && impSup > 0) highlight = { area: "Fuerza Sup.", msg: `¡Ganaste +${impSup} reps!` };
         else if (maxImp === impInf && impInf > 0) highlight = { area: "Potencia Inf.", msg: `¡Aumentaste +${impInf} reps!` };
      }
    }

    return { 
      peso: mapData('peso'), ruffier: mapData('ruffierVal'), superior: mapData('trenSuperior'), inferior: mapData('trenInferior'),
      grasaCorporal: mapData('grasaCorporal'), grasaVisceral: mapData('grasaVisceral'), musculoEsqueletico: mapData('musculoEsqueletico'),
      highlight 
    };
  }, [historial, userData]);

  const finalizarRegistro = async () => {
    setRegError("");
    
    const requeridos = ['peso', 'talla', 'cintura', 'cadera', 'p0', 'p1', 'p2', 'trenSuperior', 'trenInferior', 'grasaCorporal', 'grasaVisceral', 'musculoEsqueletico'];
    const faltantes = requeridos.filter(f => !datosRegistro[f] || String(datosRegistro[f]).trim() === "");
    
    if (faltantes.length > 0) {
      setRegError(`Aún faltan ${faltantes.length} dato(s) por capturar. Revisa que todos los recuadros estén llenos antes de guardar.`);
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), {
        ...datosRegistro, ...resultadosActuales, matricula: userData.matricula, nombre: userData.nombre, fecha: new Date().toLocaleDateString(), timestamp: Date.now()
      });
      alert("¡Registro guardado exitosamente!");
      const allPhases = ["Inicial", ...MESES];
      const currentIdx = allPhases.indexOf(datosRegistro.etapa);
      const nextEtapa = (currentIdx >= 0 && currentIdx < allPhases.length - 1) ? allPhases[currentIdx + 1] : datosRegistro.etapa;
      setDatosRegistro({ etapa: nextEtapa, peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: '' });
    } catch (e) { alert("Error al guardar."); }
  };


  if (loading) return <div className="min-h-screen bg-[#030509] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={50} /></div>;

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#030509] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="bg-[#0c1220]/80 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 w-full max-w-md text-center shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative z-10">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(6,182,212,0.4)] border border-cyan-300/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Zap className="text-white fill-white" size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">Reto <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Actívate</span></h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">DAES • Promoción de la Cultura Física</p>
          <div className="mt-8 space-y-4">
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16}/>
              <input id="m_input" placeholder="MATRÍCULA" className="w-full bg-[#131a2a]/80 backdrop-blur-md p-4 pl-12 rounded-2xl outline-none text-white font-black uppercase text-sm tracking-widest border border-white/5 focus:border-cyan-500/50 focus:bg-[#1a2235] transition-all" />
            </div>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16}/>
              <input id="p_input" type="password" placeholder="CONTRASEÑA" className="w-full bg-[#131a2a]/80 backdrop-blur-md p-4 pl-12 rounded-2xl outline-none text-white font-black text-sm tracking-widest border border-white/5 focus:border-cyan-500/50 focus:bg-[#1a2235] transition-all" />
            </div>
            
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl animate-in fade-in flex items-center justify-center gap-2">
                 <AlertTriangle className="text-red-400" size={14}/>
                 <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{loginError}</p>
              </div>
            )}
            
            <button onClick={() => handleLogin(document.getElementById('m_input').value, document.getElementById('p_input').value)} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition-all border border-cyan-400/50 mt-2">Ingresar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#030509] text-slate-300 font-sans relative overflow-x-hidden selection:bg-cyan-500/30 flex flex-col">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes floatMedal {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
      `}</style>
      <ModalConfirmacion isOpen={deleteConfirm.show} onClose={() => setDeleteConfirm({show:false, id:null, type:null, label:''})} onConfirm={executeDelete} titulo="Eliminar" mensaje={`¿Borrar a: ${deleteConfirm.label}?`} />
      
      {/* Fondos fluidos adaptativos */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

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

            <button onClick={() => setMedalModal({ ...medalModal, show: false })} className="w-full py-4 bg-[#1a2235] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#232d46] transition-all border border-white/5 shadow-md">
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 md:p-4 rounded-2xl shadow-[0_5px_15px_rgba(6,182,212,0.3)] border border-cyan-300/30">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-md">Reto <span className="text-cyan-400">Actívate</span></h1>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-[0.2em]">DAES BUAP • Promoción de la Cultura Física</p>
            </div>
          </div>
          
          <nav className="flex overflow-x-auto w-full md:w-auto bg-[#0c1220]/80 backdrop-blur-xl p-2 rounded-2xl md:rounded-[1.5rem] border border-white/10 gap-1 md:gap-2 shadow-lg hide-scrollbar">
            {userData.role === 'admin' ? (
              <>
                <button onClick={() => setActiveTab('usuarios')} className={`whitespace-nowrap px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'usuarios' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>Usuarios</button>
                <button onClick={() => setActiveTab('historial')} className={`whitespace-nowrap px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'historial' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>Historial</button>
                <button onClick={() => setActiveTab('contenidos')} className={`whitespace-nowrap px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'contenidos' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>Videos</button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('registro')} className={`whitespace-nowrap px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registro' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>Registro</button>
                <button onClick={() => setActiveTab('biblioteca')} className={`whitespace-nowrap px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'biblioteca' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>Contenido</button>
                <button onClick={() => setActiveTab('evolución')} className={`whitespace-nowrap px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'evolución' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>Evolución</button>
              </>
            )}
            <div className="w-px h-6 bg-white/10 mx-1 self-center shrink-0"></div>
            <button onClick={() => userData.role === 'student' && userData.surveyEnabled && setShowSurvey(true)} className={`shrink-0 p-2.5 rounded-xl transition-all ${userData?.surveyEnabled ? 'text-indigo-400 animate-pulse' : 'text-slate-600 grayscale hidden'}`}><Stethoscope size={18} /></button>
            <button onClick={() => window.location.reload()} className="shrink-0 p-2.5 text-red-400 rounded-xl transition-all hover:bg-red-500/20" title="Salir"><LogOut size={18}/></button>
          </nav>
        </header>

        <main className="flex-1 w-full pb-20">
          
          {/* ================= VISTA ADMIN ================= */}
          {userData.role === 'admin' && activeTab === 'usuarios' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#0c1220]/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 relative overflow-hidden shadow-lg">
                  <h3 className="text-xs font-black text-emerald-400 uppercase mb-4 flex items-center gap-2"><FileSpreadsheet size={16}/> Base Integral</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold leading-relaxed mb-6">Carga masiva vía Excel. Formato requerido: Nombre, Matricula, Contraseña, Unidad Academica.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={downloadTemplate} className="py-4 bg-[#131a2a] text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 border border-white/5 hover:bg-[#1a2235] transition-colors"><Download size={14}/> Formato</button>
                    <button onClick={() => fileInputRef.current?.click()} className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-md flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                      {isImporting ? <Loader2 size={14} className="animate-spin"/> : <FileUp size={14}/>} Subir Excel
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleExcelImport} accept=".xlsx, .xls" className="hidden" />
                  </div>
                </div>
                <div className="bg-[#0c1220]/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-lg">
                  <h3 className="text-xs font-black text-cyan-400 uppercase mb-6 flex items-center gap-2"><UserPlus size={16}/> Ingreso Manual</h3>
                  <div className="flex flex-col gap-4">
                    <InputField label="Nombre Completo" value={nuevoEstudiante.nombre} onChange={e => setNuevoEstudiante({...nuevoEstudiante, nombre: e.target.value})} colorClass="black" icon={User} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Matrícula" value={nuevoEstudiante.matricula} onChange={e => setNuevoEstudiante({...nuevoEstudiante, matricula: e.target.value})} colorClass="black" icon={Hash} />
                      <InputField label="Contraseña" value={nuevoEstudiante.password} onChange={e => setNuevoEstudiante({...nuevoEstudiante, password: e.target.value})} colorClass="black" icon={Key} />
                    </div>
                    <SelectField label="Unidad Académica" value={nuevoEstudiante.unidadAcademica} onChange={e => setNuevoEstudiante({...nuevoEstudiante, unidadAcademica: e.target.value})} options={UNIDADES_ACADEMICAS} colorClass="black" icon={School} />
                    <button onClick={registrarUsuario} className="w-full py-4 bg-cyan-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md mt-4 hover:brightness-110">Crear Estudiante</button>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-8 bg-[#0c1220]/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-lg max-h-[850px] overflow-y-auto">
                <h3 className="text-xs font-black text-white uppercase mb-6 flex items-center gap-2"><Users size={16} className="text-cyan-400"/> Directorio ({usuariosLista.length})</h3>
                <div className="flex flex-col gap-4">
                  {usuariosLista.map(u => (
                    <div key={u.id} className="bg-[#131a2a] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/5 hover:border-white/10 transition-colors">
                      <div>
                        <p className="text-sm font-black text-white italic">{u.nombre || 'Sin Nombre'}</p>
                        <p className="text-[9px] text-slate-400 uppercase mt-1 tracking-widest"><span className="text-cyan-400">{u.matricula}</span> • {u.unidadAcademica || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                        <div className="flex items-center gap-2">
                           <Key size={14} className="text-slate-500" />
                           <span className="text-[10px] font-black text-emerald-400 tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">{u.password}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleSurveyAccess(u.matricula, u.surveyEnabled)} className={`w-10 h-5 rounded-full relative ${u.surveyEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${u.surveyEnabled ? 'right-1' : 'left-1'}`} />
                          </button>
                          <button onClick={() => triggerDelete(u.matricula, 'user', u.nombre)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {userData.role === 'admin' && activeTab === 'historial' && (
            <div className="bg-[#0c1220]/80 rounded-[2rem] border border-white/5 overflow-hidden animate-in fade-in flex flex-col shadow-xl">
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#131a2a]">
                  <h2 className="text-base font-black text-white uppercase tracking-tighter"><ClipboardCheck className="inline text-emerald-400 mr-2" size={20}/> Historial de Pruebas</h2>
                  <button onClick={exportarHistorial} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110"><Download size={14} className="inline mr-2"/> Exportar</button>
               </div>
               <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-[#0f1524] text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">
                      <tr><th className="px-6 py-4">Estudiante</th><th className="px-6 py-4">Composición Física</th><th className="px-6 py-4">Pruebas Físicas</th><th className="px-6 py-4 text-right">Acción</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {historial.map(h => (
                        <tr key={h.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4">
                              <p className="text-xs font-black text-white">{h.nombre}</p>
                              <p className="text-[9px] text-cyan-400 mt-1">{h.etapa} <span className="text-slate-500">• {h.fecha}</span></p>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-400 leading-relaxed">
                            Peso Corporal: <span className="text-white">{h.peso||'-'}</span> kg<br/>
                            Grasa Corporal: <span className="text-rose-400">{h.grasaCorporal||'-'}</span> %
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-400 leading-relaxed">
                            Índice Ruffier: <span className="text-emerald-400">{h.ruffierVal||'-'}</span> pts<br/>
                            Fuerza: <span className="text-blue-400">{h.trenSuperior||'-'}</span> Sup / <span className="text-purple-400">{h.trenInferior||'-'}</span> Inf
                          </td>
                          <td className="px-6 py-4 text-right">
                              <button onClick={() => triggerDelete(h.id, 'evaluation', `${h.nombre}`)} className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {userData.role === 'admin' && activeTab === 'contenidos' && (
            <div className="flex flex-col gap-6 animate-in fade-in">
              <div className="bg-[#0c1220]/80 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8"><Video className="inline text-cyan-400 mr-2" size={24}/> Bóveda Youtube</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MESES.map(m => (
                    <div key={m} className="bg-[#131a2a]/60 p-6 rounded-[2rem] border border-white/5 space-y-6">
                      <h4 className="text-[12px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-3">{m}</h4>
                      {CATEGORIAS_CONTENIDO.map(c => {
                        const key = `${m}-${c}`;
                        const isUn = configGlobal.desbloqueos?.[key];
                        const videosList = getNormalizedVideos(configGlobal.videos, m, c);

                        return (
                          <div key={c} className="bg-[#0a0f1a] p-5 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black uppercase text-white">{c}</span>
                              <button onClick={() => toggleUnlock(m, c)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${isUn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : 'bg-[#1a2235] text-slate-400'}`}>
                                {isUn ? 'Abierto' : 'Cerrado'}
                              </button>
                            </div>
                            <div className="space-y-2 mb-4">
                              {videosList.map((vidUrl, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-[#131a2a] p-3 rounded-xl border border-white/5">
                                  <p className="text-[9px] text-slate-400 truncate w-40"><span className="text-cyan-400 font-bold mr-1">V{idx+1}:</span> {vidUrl}</p>
                                  <button onClick={() => removeVideoLink(m, c, idx)} className="text-slate-500 hover:text-red-400"><X size={14}/></button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input type="text" placeholder="URL YouTube" value={videoInputs[key] || ""} onChange={e => setVideoInputs({...videoInputs, [key]: e.target.value})} className="w-full bg-[#131a2a] text-[10px] font-bold text-white px-4 py-3 rounded-xl outline-none" />
                              <button onClick={() => addVideoLink(m, c)} className="bg-cyan-600 text-white px-4 rounded-xl hover:bg-cyan-500 transition-colors"><PlusCircle size={16}/></button>
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

          {/* ================= VISTA ESTUDIANTE ================= */}
          {userData.role === 'student' && activeTab === 'biblioteca' && (
            <div className="flex flex-col gap-6 animate-in fade-in pb-10">
              <div className="bg-[#0c1220]/80 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-xl">
                <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter mb-4"><Video className="inline text-cyan-400 mr-3" size={28}/> Contenido Interactivo</h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Visualiza todos los videos de cada categoría para desbloquear las medallas en la sección Evolución.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MESES.map(m => (
                    <div key={`vid-${m}`} className="bg-[#131a2a]/60 p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
                      <h4 className="text-[12px] md:text-sm font-black text-white uppercase tracking-[0.2em] italic border-b border-white/10 pb-3">{m}</h4>
                      {CATEGORIAS_CONTENIDO.map(c => {
                        const key = `${m}-${c}`;
                        const isLocked = !configGlobal.desbloqueos?.[key];
                        const videosList = getNormalizedVideos(configGlobal.videos, m, c);
                        const isCatComplete = hasCompletedCategory(m, c);
                        
                        return (
                          <div key={c} className={`p-5 md:p-6 rounded-[1.5rem] border flex flex-col gap-5 transition-all ${isLocked ? 'bg-[#0a0f1a] border-white/5 grayscale opacity-60' : isCatComplete ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-[#1a2235] border-white/10 shadow-lg'}`}>
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
                                  const isSeen = userData.videosVistos?.includes(`${key}-${idx}`) || (idx === 0 && userData.videosVistos?.includes(key));
                                  return (
                                    <button key={idx} onClick={() => verVideo(m, c, idx, vidUrl)} className={`w-full py-4 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between border transition-all hover:-translate-y-0.5 ${isSeen ? 'bg-[#0f1524] text-emerald-400 border-emerald-500/30' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400/50 shadow-md'}`}>
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
            </div>
          )}

          {userData.role === 'student' && activeTab === 'registro' && (
            <div className="flex flex-col gap-8 animate-in fade-in pb-20">
              <div className="bg-[#0c1220]/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-xl">
                <h3 className="text-base md:text-lg font-black text-white uppercase italic mb-6 flex items-center gap-3 tracking-tighter"><Calendar className="text-blue-500" size={24}/> Fase a Reportar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {["Inicial", ...MESES].map(m => {
                    const isB = historial.some(h => h.etapa === m);
                    const isSelected = datosRegistro.etapa === m;
                    let btnStyle = 'bg-[#131a2a] text-slate-500 border-2 border-white/5 hover:border-white/20';
                    if (isSelected) btnStyle = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105 z-10';
                    else if (isB) btnStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20';
                    return (
                      <button key={m} onClick={() => handlePhaseClick(m)} className={`py-4 md:py-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${btnStyle}`}>
                        {m} {isB && !isSelected && <CheckCircle2 size={12} className="inline ml-1 mb-0.5"/>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const isViewingMode = historial.some(h => h.etapa === datosRegistro.etapa);
                return (
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* FORMULARIO DE CAPTURA */}
                    <div className="w-full lg:w-7/12 flex flex-col gap-6">
                      <div className="bg-[#0c1220]/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/5 space-y-8 shadow-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <InputField label="Peso Corporal" value={datosRegistro.peso} unit="kg" colorClass="indigo" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, peso: e.target.value})} icon={Weight} />
                          <InputField label="Estatura / Talla" value={datosRegistro.talla} unit="cm" colorClass="indigo" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, talla: e.target.value})} icon={Ruler} />
                          <InputField label="Cintura" value={datosRegistro.cintura} unit="cm" colorClass="indigo" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, cintura: e.target.value})} icon={Activity} />
                          <InputField label="Cadera" value={datosRegistro.cadera} unit="cm" colorClass="indigo" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, cadera: e.target.value})} icon={Activity} />
                        </div>
                      </div>

                      <div className="bg-[#0c1220]/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
                        <h3 className="text-[11px] md:text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-3"><Flame size={18}/> Composición Biológica</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <InputField label="Grasa Corporal" value={datosRegistro.grasaCorporal} unit="%" colorClass="rose" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, grasaCorporal: e.target.value})} />
                          <InputField label="Grasa Visceral" value={datosRegistro.grasaVisceral} unit="lvl" colorClass="orange" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, grasaVisceral: e.target.value})} />
                          <InputField label="Músculo Esquelético" value={datosRegistro.musculoEsqueletico} unit="%" colorClass="cyan" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, musculoEsqueletico: e.target.value})} />
                        </div>
                      </div>

                      <div className="bg-[#0c1220]/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
                        <h3 className="text-[11px] md:text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3"><Heart size={18}/> Test Cardiovascular Ruffier</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <InputField label="P0 (Reposo)" value={datosRegistro.p0} colorClass="emerald" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, p0: e.target.value})} />
                          <InputField label="P1 (Post)" value={datosRegistro.p1} colorClass="emerald" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, p1: e.target.value})} />
                          <InputField label="P2 (Recup)" value={datosRegistro.p2} colorClass="emerald" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, p2: e.target.value})} />
                        </div>
                      </div>

                      <div className="bg-[#0c1220]/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
                        <h3 className="text-[11px] md:text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-3"><Zap size={18}/> Prueba Fuerza Muscular</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <InputField label="Tren Superior" value={datosRegistro.trenSuperior} unit="rep" colorClass="blue" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, trenSuperior: e.target.value})} />
                          <InputField label="Tren Inferior" value={datosRegistro.trenInferior} unit="rep" colorClass="purple" disabled={isViewingMode} onChange={e => setDatosRegistro({...datosRegistro, trenInferior: e.target.value})} />
                        </div>
                      </div>

                      {/* BOTÓN GUARDAR AL FINAL */}
                      <div className="pt-4">
                        {isViewingMode ? (
                          <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/30 text-center flex flex-col items-center gap-3 shadow-inner">
                            <Eye size={24} className="text-blue-400 opacity-80" />
                            <p className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest">Fase completada. (Modo Solo Lectura)</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {regError && (
                              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 animate-in fade-in shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <AlertTriangle className="text-red-400 shrink-0" size={18}/>
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-tight">{regError}</p>
                              </div>
                            )}
                            <button onClick={finalizarRegistro} className="w-full py-6 md:py-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[2rem] font-black uppercase text-sm md:text-base tracking-[0.3em] shadow-[0_15px_30px_rgba(6,182,212,0.4)] border border-cyan-400 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(6,182,212,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3">
                              <Save size={24}/> Guardar Datos Oficiales
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: RESULTADOS CLÍNICOS */}
                    <div className="w-full lg:w-5/12">
                      <div className="sticky top-8 bg-[#0c1220]/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl md:text-2xl font-black text-white italic mb-8 flex items-center gap-3 tracking-tighter"><Activity className="text-cyan-400" size={28} /> Scanner Clínico</h2>
                        
                        <div className={`p-8 rounded-[2.5rem] border flex flex-col items-center justify-center text-center shadow-inner mb-6 transition-all ${resultadosActuales.ruffierInterp.bg}`}>
                           <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 drop-shadow-md">Índice Ruffier</p>
                           <span className="text-6xl font-black text-white my-2 drop-shadow-lg">{resultadosActuales.ruffierVal ?? '--'}</span>
                           <p className={`text-[11px] md:text-xs font-black uppercase tracking-[0.2em] drop-shadow-md ${resultadosActuales.ruffierInterp.color}`}>{resultadosActuales.ruffierInterp.label}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           {[
                             { l: "Grasa Corporal", v: datosRegistro.grasaCorporal, u: "%", i: resultadosActuales.gcInterp },
                             { l: "Músculo Esquelético", v: datosRegistro.musculoEsqueletico, u: "%", i: resultadosActuales.meInterp },
                             { l: "Índice Masa Corp.", v: resultadosActuales.imc, u: "", i: resultadosActuales.imcInterp },
                             { l: "Cintura-Cadera", v: resultadosActuales.icc, u: "", i: resultadosActuales.iccInterp },
                             { l: "Tren Superior", v: datosRegistro.trenSuperior, u: "", i: resultadosActuales.supInterp },
                             { l: "Tren Inferior", v: datosRegistro.trenInferior, u: "", i: resultadosActuales.infInterp }
                           ].map((item, idx) => (
                             <div key={idx} className={`p-5 rounded-3xl border flex flex-col items-center justify-center text-center bg-[#0f1524]/60 shadow-inner transition-all ${item.i.bg}`}>
                               <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight h-6 flex items-center">{item.l}</p>
                               <p className="text-xl md:text-2xl font-black text-white drop-shadow-md">{item.v || '--'}<span className="text-[10px] ml-1 opacity-50">{item.u}</span></p>
                               <p className={`text-[8px] md:text-[9px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${item.i.color}`}>{item.i.label}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {userData.role === 'student' && activeTab === 'evolución' && (
            <div className="flex flex-col gap-8 animate-in fade-in pb-20">
              <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/20 p-8 md:p-12 rounded-[3rem] border border-cyan-500/30 relative overflow-hidden shadow-xl">
                 <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-cyan-400/20 blur-[60px] rounded-full pointer-events-none"></div>
                 <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg relative z-10">{userData.nombre || 'Mi Perfil'}</h2>
                 <p className="text-[10px] md:text-xs text-cyan-400 font-bold mt-3 uppercase tracking-[0.3em] relative z-10 leading-relaxed">{userData.unidadAcademica}<br/>ID Oficial: {userData.matricula}</p>
              </div>
              
              <div className="bg-[#0c1220]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 block">Estado Físico Actual</span>
                 <h4 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">{evolUser?.highlight?.area || 'Cargando'}</h4>
                 <p className="text-[11px] md:text-xs text-slate-400 mt-2 font-bold italic">{evolUser?.highlight?.msg || '...'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                 <ProgressLineChart data={evolUser?.ruffier} label="Índice Ruffier" unit="pts" colorKey="emerald" />
                 <ProgressLineChart data={evolUser?.grasaCorporal} label="Grasa Corporal" unit="%" colorKey="rose" />
                 <ProgressLineChart data={evolUser?.musculoEsqueletico} label="Músculo Esquelético" unit="%" colorKey="cyan" />
                 <ProgressLineChart data={evolUser?.superior} label="Tren Superior" unit="rep" colorKey="blue" />
                 <ProgressLineChart data={evolUser?.inferior} label="Tren Inferior" unit="rep" colorKey="purple" />
                 <ProgressLineChart data={evolUser?.peso} label="Peso Corporal" unit="kg" colorKey="indigo" />
              </div>

              {/* VITRINA UNIFICADA CON LAS 23 MEDALLAS (Físicas + Videos + Platino) */}
              {(() => {
                const sorted = [...historial].sort((a, b) => ["Inicial", ...MESES].indexOf(a.etapa) - ["Inicial", ...MESES].indexOf(b.etapa));
                const hasProgress = sorted.length > 1; 
                const ultimo = sorted.length > 0 ? sorted[sorted.length - 1] : null;

                const primerPaso = hasProgress;
                const isConstante = sorted.length >= 3;
                const retoCompletado = sorted.length === 4;
                const mejoroCardio = hasProgress && parseFloat(ultimo.ruffierVal) < parseFloat(sorted[0].ruffierVal);
                const mejoroSup = hasProgress && parseFloat(ultimo.trenSuperior) > parseFloat(sorted[0].trenSuperior);
                const mejoroInf = hasProgress && parseFloat(ultimo.trenInferior) > parseFloat(sorted[0].trenInferior);
                const mejoroCore = hasProgress && parseFloat(ultimo.cintura) < parseFloat(sorted[0].cintura);
                const mejoroGrasaCorp = hasProgress && ultimo.grasaCorporal && parseFloat(ultimo.grasaCorporal) < parseFloat(sorted[0].grasaCorporal);
                const hipertrofia = ultimo && ultimo.musculoEsqueletico && ((userData.sexo === 'M' && parseFloat(ultimo.musculoEsqueletico) >= 33.3) || (userData.sexo !== 'M' && parseFloat(ultimo.musculoEsqueletico) >= 24.3));
                const escudoInterno = ultimo && ultimo.grasaVisceral && parseFloat(ultimo.grasaVisceral) <= 9;
                const atletaIntegral = mejoroCardio && mejoroSup && mejoroInf;
                const imcSaludable = hasProgress && ultimo && parseFloat(ultimo.imc) >= 18.5 && parseFloat(ultimo.imc) < 25;
                const iccSaludable = hasProgress && ultimo && ((userData.sexo === 'M' && parseFloat(ultimo.icc) < 0.95) || (userData.sexo !== 'M' && parseFloat(ultimo.icc) < 0.80));
                const corazonAtleta = hasProgress && ultimo && parseFloat(ultimo.ruffierVal) <= 3;
                const fuerzaElite = hasProgress && ultimo && ((userData.sexo === 'M' && (parseFloat(ultimo.trenSuperior) >= 55 || parseFloat(ultimo.trenInferior) > 48)) || (userData.sexo !== 'M' && (parseFloat(ultimo.trenSuperior) >= 49 || parseFloat(ultimo.trenInferior) > 44)));

                const nutM1 = hasCompletedCategory("Mes 1", "Nutrición");
                const cfM1 = hasCompletedCategory("Mes 1", "Cultura Física");
                const nutM2 = hasCompletedCategory("Mes 2", "Nutrición");
                const cfM2 = hasCompletedCategory("Mes 2", "Cultura Física");
                const nutM3 = hasCompletedCategory("Mes 3", "Nutrición");
                const cfM3 = hasCompletedCategory("Mes 3", "Cultura Física");

                const estadosMedallas = [
                  primerPaso, isConstante, retoCompletado, atletaIntegral,
                  imcSaludable, iccSaludable, escudoInterno, mejoroCore,
                  mejoroGrasaCorp, hipertrofia, mejoroCardio, corazonAtleta,
                  mejoroSup, mejoroInf, fuerzaElite,
                  nutM1, cfM1, nutM2, cfM2, nutM3, cfM3
                ];
                
                const totalMedallasBases = estadosMedallas.length; // 21 bases
                const medallasObtenidas = estadosMedallas.filter(Boolean).length;
                const platinoDesbloqueado = medallasObtenidas === totalMedallasBases;
                const porcentajeProgreso = ((medallasObtenidas + (platinoDesbloqueado ? 1 : 0)) / (totalMedallasBases + 1)) * 100;

                const renderBadge = (active, title, desc, detail, IconComponent, colorClass, animationDelayIdx) => {
                  const styles = {
                    yellow: "from-yellow-200 via-yellow-400 to-yellow-600 shadow-[0_10px_20px_rgba(234,179,8,0.4)] border-yellow-200/50",
                    emerald: "from-emerald-200 via-emerald-400 to-emerald-600 shadow-[0_10px_20px_rgba(16,185,129,0.4)] border-emerald-200/50",
                    blue: "from-blue-200 via-blue-400 to-blue-600 shadow-[0_10px_20px_rgba(59,130,246,0.4)] border-blue-200/50",
                    purple: "from-purple-200 via-purple-400 to-purple-600 shadow-[0_10px_20px_rgba(168,85,247,0.4)] border-purple-200/50",
                    cyan: "from-cyan-200 via-cyan-400 to-cyan-600 shadow-[0_10px_20px_rgba(6,182,212,0.4)] border-cyan-200/50",
                    rose: "from-rose-200 via-rose-400 to-rose-600 shadow-[0_10px_20px_rgba(225,29,72,0.4)] border-rose-200/50",
                    orange: "from-orange-200 via-orange-400 to-orange-600 shadow-[0_10px_20px_rgba(249,115,22,0.4)] border-orange-200/50",
                    red: "from-red-300 via-red-500 to-red-800 shadow-[0_10px_20px_rgba(220,38,38,0.4)] border-red-300/50",
                    slate: "from-slate-200 via-slate-400 to-slate-600 shadow-[0_10px_20px_rgba(100,116,139,0.4)] border-slate-200/50",
                    lime: "from-lime-200 via-lime-400 to-lime-600 shadow-[0_10px_20px_rgba(132,204,22,0.4)] border-lime-200/50",
                    indigo: "from-indigo-200 via-indigo-400 to-indigo-600 shadow-[0_10px_20px_rgba(99,102,241,0.4)] border-indigo-200/50",
                    platinum: "from-slate-100 via-white to-slate-400 shadow-[0_0_30px_rgba(255,255,255,0.8)] border-white"
                  };
                  
                  const theme = styles[colorClass];
                  const delay = (animationDelayIdx * 0.2).toFixed(1);

                  return (
                    <div 
                      onClick={() => setMedalModal({ show: true, title, desc, detail, icon: IconComponent, themeClass: theme, colorClass, active })}
                      className={`p-[1px] rounded-[2.5rem] transition-all duration-700 ease-out cursor-pointer
                        ${active ? `bg-gradient-to-b from-white/20 to-white/5 hover:scale-105 shadow-xl z-10 hover:z-20 animate-[floatMedal_4s_ease-in-out_infinite]` : 'bg-slate-800/40 grayscale opacity-60 hover:opacity-100 hover:scale-105'}
                      `}
                      style={active ? { animationDelay: `${delay}s` } : {}}
                    >
                      <div className={`bg-gradient-to-br from-[#1a2235] to-[#0a0f1a] h-full w-full rounded-[2.4rem] p-5 md:p-6 flex flex-col items-center text-center relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]`}>
                        {active && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full animate-[shimmer_3s_infinite]"></div>}
                        
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-1000 ${active ? `bg-gradient-to-br ${theme} border-t border-l border-white/60 border-b border-r border-black/50 shadow-[inset_0_6px_10px_rgba(255,255,255,0.8),inset_0_-6px_10px_rgba(0,0,0,0.5)] scale-110` : 'bg-slate-800 border border-white/5 text-slate-600 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]'}`}>
                          <IconComponent size={24} className={active ? `${colorClass === 'platinum' ? 'text-slate-800' : 'text-white'} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]` : ""} />
                        </div>
                        
                        <h5 className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 leading-tight relative z-10 ${active ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>{title}</h5>
                        <p className={`text-[7px] md:text-[8px] font-bold uppercase tracking-tighter leading-tight relative z-10 ${active ? 'text-cyan-300 drop-shadow-sm' : 'text-slate-600'}`}>{desc}</p>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="bg-[#0c1220]/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <style>{`
                      @keyframes floatMedal {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                        100% { transform: translateY(0px); }
                      }
                    `}</style>
                    <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
                      <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter drop-shadow-md"><Award className="inline text-purple-400 mr-3" size={32}/> Colección de Logros</h3>
                      <div className="w-full md:w-auto text-left md:text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2">Progreso Global: <span className="text-cyan-400 text-sm">{Math.round(porcentajeProgreso)}%</span></p>
                        <div className="w-full md:w-48 h-2.5 bg-[#131a2a] rounded-full overflow-hidden border border-white/5 shadow-inner"><div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-1000" style={{width: `${porcentajeProgreso}%`}}></div></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 relative z-10">
                      {renderBadge(primerPaso, "Primer Paso", "Mes 1 Completo", "Completaste exitosamente todas las pruebas de tu primera evaluación física.", ArrowUpRight, "slate", 1)}
                      {renderBadge(isConstante, "Disciplina", "Mes 2 Completo", "Registraste tus datos en dos fases seguidas, demostrando constancia en tu proceso.", Calendar, "yellow", 2)}
                      {renderBadge(retoCompletado, "Constancia", "Reto Finalizado", "Llegaste a la meta final. Has completado las 3 fases del reto físico de la DAES.", Star, "orange", 3)}
                      {renderBadge(mejoroCardio, "Motor Imparable", "Mejora Ruffier", "Mejoraste tu capacidad cardiovascular reduciendo tu puntaje en la prueba de Ruffier.", Heart, "emerald", 4)}
                      {renderBadge(corazonAtleta, "Cardio Élite", "Ruffier Excelente", "Alcanzaste un nivel de excelencia (0-5 pts) en tu capacidad cardiovascular.", Activity, "red", 5)}
                      {renderBadge(imcSaludable, "Equilibrio", "IMC Saludable", "Lograste o mantuviste tu Índice de Masa Corporal dentro del rango saludable (18.5 - 24.9).", Weight, "cyan", 6)}
                      {renderBadge(iccSaludable, "Riesgo Cero", "ICC Bajo Riesgo", "Tu Índice Cintura-Cadera indica un riesgo cardiovascular bajo y saludable.", ShieldCheck, "rose", 7)}
                      {renderBadge(escudoInterno, "Escudo Interno", "GV Saludable", "Mantuviste tu nivel de Grasa Visceral en parámetros seguros (Nivel 1-9).", ShieldAlert, "yellow", 8)}
                      {renderBadge(mejoroCore, "Core de Acero", "Reduce Cintura", "Lograste reducir el perímetro de tu cintura en comparación con tus registros anteriores.", Ruler, "lime", 9)}
                      {renderBadge(mejoroGrasaCorp, "Definición", "Mejora GC", "Redujiste tu porcentaje de Grasa Corporal acercándote a un rango más saludable.", Flame, "rose", 10)}
                      {renderBadge(hipertrofia, "Hipertrofia", "Músculo Sano", "Alcanzaste un nivel óptimo o atlético en tu porcentaje de Músculo Esquelético.", BicepsFlexed, "blue", 11)}
                      {renderBadge(mejoroSup, "Fuerza Bruta", "Mejora T. Superior", "Aumentaste el número de repeticiones en tu prueba de fuerza de Tren Superior.", Zap, "blue", 12)}
                      {renderBadge(mejoroInf, "Pot. Explosiva", "Mejora T. Inferior", "Aumentaste el número de repeticiones en tu prueba de fuerza de Tren Inferior.", TrendingUp, "purple", 13)}
                      {renderBadge(fuerzaElite, "Fuerza Élite", "Fuerza Excelente", "Demostraste una condición excepcional obteniendo nivel Excelente en las pruebas de fuerza.", Award, "indigo", 14)}
                      {renderBadge(atletaIntegral, "Atleta Integral", "Mejora 3 Pruebas", "Mejoraste simultáneamente en tus capacidades de Cardio, Tren Superior y Tren Inferior.", Trophy, "orange", 15)}
                      
                      {renderBadge(nutM1, "Nutrición Mes 1", "Especialista Nut.", "Visualizaste todos los contenidos educativos de Nutrición correspondientes al Mes 1.", Apple, "rose", 16)}
                      {renderBadge(cfM1, "Física Mes 1", "Cultura Física", "Visualizaste todos los contenidos educativos de Cultura Física correspondientes al Mes 1.", Zap, "yellow", 17)}
                      {renderBadge(nutM2, "Nutrición Mes 2", "Especialista Nut.", "Visualizaste todos los contenidos educativos de Nutrición correspondientes al Mes 2.", Apple, "rose", 18)}
                      {renderBadge(cfM2, "Física Mes 2", "Cultura Física", "Visualizaste todos los contenidos educativos de Cultura Física correspondientes al Mes 2.", Zap, "yellow", 19)}
                      {renderBadge(nutM3, "Nutrición Mes 3", "Especialista Nut.", "Visualizaste todos los contenidos educativos de Nutrición correspondientes al Mes 3.", Apple, "rose", 20)}
                      {renderBadge(cfM3, "Física Mes 3", "Cultura Física", "Visualizaste todos los contenidos educativos de Cultura Física correspondientes al Mes 3.", Zap, "yellow", 21)}

                      <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 mt-4">
                         {renderBadge(platinoDesbloqueado, "Platino Absoluto", "Colección Completa", "¡El máximo honor del Reto Actívate! Desbloqueaste todas las medallas posibles demostrando una disciplina inquebrantable a lo largo de las 3 fases.", Crown, "platinum", 22)}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {showSurvey && (
        <div className="fixed inset-0 z-[9999] bg-[#030509]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0c1220] to-[#080b14] w-full max-w-4xl rounded-[3rem] border border-white/10 p-8 md:p-12 relative shadow-[0_30px_60px_rgba(0,0,0,0.8)] my-auto mt-10 mb-10">
            <button onClick={() => setShowSurvey(false)} className="absolute top-6 right-6 text-slate-500 bg-white/5 p-3 rounded-full hover:bg-white/10 transition-colors"><X size={20}/></button>
            <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3 drop-shadow-md"><Stethoscope size={32} className="text-indigo-400"/> Expediente Clínico</h2>
            <div className="space-y-6">
               
               <div className="flex flex-col gap-4 bg-[#131a2a]/50 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-inner">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-2">I. Salud y Seguridad</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputField label="Condición Crónica" colorClass="indigo" value={encuesta.condicionMedica} onChange={e => setEncuesta({...encuesta, condicionMedica: e.target.value})} placeholder="Ej. Ninguna"/>
                   <InputField label="Dolor Crónico" colorClass="indigo" value={encuesta.dolorCronico} onChange={e => setEncuesta({...encuesta, dolorCronico: e.target.value})} placeholder="Ej. Ninguno"/>
                   <InputField label="Medicamentos" colorClass="indigo" value={encuesta.medicamentos} onChange={e => setEncuesta({...encuesta, medicamentos: e.target.value})} placeholder="Ej. Ninguno"/>
                 </div>
               </div>

               <div className="flex flex-col gap-4 bg-[#131a2a]/50 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-inner">
                 <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-2">II. Metas y Experiencia</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputField label="Objetivo principal" colorClass="rose" value={encuesta.objetivoPrincipal} onChange={e => setEncuesta({...encuesta, objetivoPrincipal: e.target.value})} placeholder="Bajar peso, músculo..."/>
                   <InputField label="Nivel actividad física" colorClass="rose" value={encuesta.nivelActividad} onChange={e => setEncuesta({...encuesta, nivelActividad: e.target.value})} placeholder="Sedentario, activo..."/>
                 </div>
               </div>

               <div className="flex flex-col gap-4 bg-[#131a2a]/50 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-inner">
                 <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-2">III. Logística y Antecedentes</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputField label="Correo Institucional" icon={Mail} colorClass="emerald" value={encuesta.correoInstitucional} onChange={e => setEncuesta({...encuesta, correoInstitucional: e.target.value})} placeholder="alumno@alumno.buap.mx"/>
                   <InputField label="Teléfono de contacto" icon={Phone} colorClass="emerald" value={encuesta.telefono} onChange={e => setEncuesta({...encuesta, telefono: e.target.value})} placeholder="222..."/>
                   <InputField label="Defectos de postura" colorClass="emerald" value={encuesta.defectosPostura} onChange={e => setEncuesta({...encuesta, defectosPostura: e.target.value})} placeholder="Escoliosis, pie plano..."/>
                   <InputField label="Horario de contacto" icon={Clock} colorClass="emerald" value={encuesta.horarioContacto} onChange={e => setEncuesta({...encuesta, horarioContacto: e.target.value})} placeholder="Mañana / Tarde"/>
                 </div>
               </div>

               <button onClick={saveSurvey} className="w-full py-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(99,102,241,0.4)] hover:brightness-110 transition-all border border-indigo-400/50 mt-4">
                 Enviar Expediente
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;