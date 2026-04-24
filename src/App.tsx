import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Activity, Ruler, Weight, ClipboardCheck, Trash2, Save, Download, 
  TrendingUp, Heart, AlertCircle, Zap, Award, BarChart3, Hash, Calendar, 
  ArrowUpRight, Info, Lock, School, Sparkles, Loader2, X, Stethoscope, 
  Trophy, Star, LogOut, LogIn, UserPlus, Users, Eye, Key, AlertTriangle, FileUp, FileSpreadsheet, ShieldCheck,
  Flame, BicepsFlexed, ShieldAlert, Crown
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, addDoc, deleteDoc 
} from 'firebase/firestore';

// --- CONFIGURACIÓN FIREBASE HÍBRIDA ---
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
  if (!firebaseConfig.apiKey) throw new Error("Fallback a configuración manual");
} catch (e) {
  // TU CONFIGURACIÓN REAL PARA STACKBLITZ (CORREGIDA)
  firebaseConfig = {
    apiKey: "AIzaSyBi8Iw_DDqiW6duwgJEbIjIl2QiEjWhoFE",
    authDomain: "reto-activate-dd3cb.firebaseapp.com",
    projectId: "reto-activate-dd3cb",
    storageBucket: "reto-activate-dd3cb.firebasestorage.app",
    messagingSenderId: "230551697596",
    appId: "1:230551697596:web:6fc8a801f9445e74ea78b9",
    measurementId: "G-7HXE5F4TZC"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'reto-activate-buap';

// Carga externa de XLSX para manejo de Excel
const loadXLSX = () => {
  return new Promise((resolve) => {
    if (window.XLSX) return resolve();
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

// --- CONSTANTES ---
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

// --- COMPONENTES AUXILIARES ---
const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
        <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tighter">{titulo}</h3>
        <p className="text-slate-400 text-sm text-center mb-8 font-medium leading-relaxed">{mensaje}</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
          <button onClick={onConfirm} className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">Sí, Eliminar</button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", icon: Icon, placeholder, unit, colorClass = "blue", disabled = false }) => {
  const themes = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_10px_25px_rgba(59,130,246,0.3)] text-white border-b-4 border-blue-700",
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-[0_10px_25px_rgba(99,102,241,0.3)] text-white border-b-4 border-indigo-700",
    emerald: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.3)] text-white border-b-4 border-emerald-700",
    purple: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_10px_25px_rgba(168,85,247,0.3)] text-white border-b-4 border-purple-800",
    rose: "bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_10px_25px_rgba(225,29,72,0.3)] text-white border-b-4 border-rose-700",
    cyan: "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_10px_25px_rgba(6,182,212,0.3)] text-white border-b-4 border-cyan-700",
    orange: "bg-gradient-to-br from-orange-400 to-orange-500 shadow-[0_10px_25px_rgba(249,115,22,0.3)] text-white border-b-4 border-orange-600",
    yellow: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_10px_25px_rgba(245,158,11,0.3)] text-white border-b-4 border-orange-600",
  };
  const theme = themes[colorClass] || themes.blue;
  const interactionClasses = disabled ? "opacity-60 grayscale-[0.3] cursor-not-allowed" : "hover:scale-[1.02] focus-within:scale-[1.02] focus-within:shadow-2xl";

  return (
    <div className={`relative flex flex-col justify-center w-full p-4 md:p-5 rounded-[2rem] transition-transform ${interactionClasses} ${theme}`}>
      <div className="flex items-center gap-2 mb-1 opacity-90 drop-shadow-md">
        {Icon && <Icon size={14} />}
        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-none truncate">{label}</label>
      </div>
      <div className="flex items-center justify-between">
        <input
          type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} disabled={disabled}
          className={`w-full bg-transparent outline-none text-xl md:text-2xl font-black placeholder:text-white/40 text-white drop-shadow-md ${disabled ? 'cursor-not-allowed' : ''}`}
        />
        {unit && <span className="text-[10px] font-black uppercase opacity-70 ml-2 drop-shadow-md whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, icon: Icon, colorClass = "blue", disabled = false }) => {
  const themes = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_10px_25px_rgba(59,130,246,0.3)] text-white border-b-4 border-blue-700",
  };
  const theme = themes[colorClass] || themes.blue;
  const interactionClasses = disabled ? "opacity-60 grayscale-[0.3] cursor-not-allowed" : "hover:scale-[1.02] focus-within:scale-[1.02] focus-within:shadow-2xl";

  return (
    <div className={`relative flex flex-col justify-center w-full p-5 rounded-[2rem] transition-transform ${interactionClasses} ${theme}`}>
      <div className="flex items-center gap-2 mb-1 opacity-90 drop-shadow-md">
        {Icon && <Icon size={16} />}
        <label className="text-[11px] font-black uppercase tracking-widest">{label}</label>
      </div>
      <select
        name={name} value={value || ""} onChange={onChange} disabled={disabled}
        className={`w-full bg-transparent outline-none text-lg font-black text-white appearance-none drop-shadow-md ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <option value="" className="bg-slate-900 text-slate-400">Seleccionar...</option>
        {options.map(o => <option key={o.value || o} value={o.value || o} className="bg-slate-900 text-white">{o.label || o}</option>)}
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
    blue: { stroke: "#3b82f6" }, purple: { stroke: "#a855f7" }, yellow: { stroke: "#f59e0b" }, emerald: { stroke: "#10b981" },
    rose: { stroke: "#f43f5e" }, cyan: { stroke: "#06b6d4" }, indigo: { stroke: "#6366f1" }, orange: { stroke: "#f97316" }
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
    <div className="bg-[#0f172a]/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-xl group hover:border-white/10 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 rounded-full pointer-events-none`} style={{backgroundColor: theme.stroke}}></div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2" style={{color: theme.stroke}}>
          <TrendingUp size={14} /> {label}
        </h4>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{unit}</span>
      </div>
      <div className="relative h-40 w-full mb-4 z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <path d={`${pathData} L 100 100 L 0 100 Z`} fill={theme.stroke} fillOpacity="0.1" />
          <path d={pathData} fill="none" stroke={theme.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 4px 6px ${theme.stroke}40)` }} />
          {points.map((p, i) => (
            <g key={i} onClick={() => setSelectedPoint(i === selectedPoint ? null : i)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={selectedPoint === i ? "5" : "3"} fill={theme.stroke} className="transition-all duration-300" style={{ filter: `drop-shadow(0 0 8px ${theme.stroke})` }}/>
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

// --- APP PRINCIPAL ---
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
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, type: null, label: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  
  const fileInputRef = useRef(null);

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: '', matricula: '', unidadAcademica: '', edad: '', sexo: 'M', etapa: 'Inicial',
    peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', 
    trenSuperior: '', trenInferior: '', 
    grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: ''
  });
  
  const [nuevoEstudiante, setNuevoEstudiante] = useState({ matricula: '', password: '', nombre: '', unidadAcademica: '', edad: '', sexo: 'M' });

  const mesesEtapas = ["Inicial", "Mes 1", "Mes 2", "Mes 3"];

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
    }, (err) => console.error("Snapshot Evaluations Error"));

    let unsubUsers = () => {};
    if (userData.role === 'admin') {
      const userCol = collection(db, 'artifacts', appId, 'public', 'data', 'users');
      unsubUsers = onSnapshot(userCol, (snapshot) => {
        setUsuariosLista(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Snapshot Users Error"));
    }
    return () => { unsubEvals(); unsubUsers(); };
  }, [currentUser, userData]);

  const downloadTemplate = () => {
    if (!window.XLSX) return alert("Librería de Excel cargando...");
    const data = [
      ["Nombre", "Matricula", "Password", "Unidad Academica", "Edad", "Sexo"],
      ["Juan Perez", "2024111", "Clave123", "Facultad de Administración", "20", "M"],
      ["Maria Lopez", "2024222", "Clave456", "Facultad de Medicina", "19", "F"]
    ];
    const ws = window.XLSX.utils.aoa_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
    window.XLSX.writeFile(wb, "Plantilla_Alumnos_Reto.xlsx");
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = window.XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        for (const row of data) {
          const matricula = String(row.Matricula || row.matricula || "").trim().toUpperCase();
          if (!matricula) continue;
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', matricula), {
            nombre: String(row.Nombre || row.nombre || ""),
            matricula,
            password: String(row.Password || row.password || "RETO123"),
            unidadAcademica: String(row["Unidad Academica"] || row.unidadAcademica || ""),
            edad: String(row.Edad || row.edad || ""),
            sexo: String(row.Sexo || row.sexo || "M").toUpperCase(),
            role: 'student'
          });
          successCount++;
        }
        alert(`¡Importación completada! ${successCount} alumnos registrados.`);
      } catch (err) {
        alert("Error al procesar el Excel. Verifique el formato.");
      } finally {
        setIsImporting(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

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
        role: 'student'
      });
      alert("Alumno registrado exitosamente.");
      setNuevoEstudiante({ matricula: '', password: '', nombre: '', unidadAcademica: '', edad: '', sexo: 'M' });
    } catch (e) { alert("Error al crear usuario."); }
  };

  const exportarCSV = () => {
    const header = "Fecha,Matricula,Nombre,Etapa,Ruffier,Sup,Inf,GrasaCorp,GrasaVisc,MusculoEsq\n";
    const dataRows = historial.map(h => `${h.fecha},${h.matricula},${h.nombre},${h.etapa},${h.ruffierVal},${h.trenSuperior},${h.trenInferior},${h.grasaCorporal||''},${h.grasaVisceral||''},${h.musculoEsqueletico||''}`).join("\n");
    const blob = new Blob([header + dataRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "Reporte_DAES_BUAP.csv"; a.click();
  };

  const handlePhaseClick = (m) => {
    setRegError("");
    const record = historial.find(h => h.etapa === m);
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

  // --- MOTOR CLÍNICO: INTERPRETACIÓN DE DATOS ---
  const resultadosActuales = useMemo(() => {
    const { peso, talla, cintura, cadera, p0, p1, p2, trenSuperior, trenInferior, sexo, edad, grasaCorporal, grasaVisceral, musculoEsqueletico } = datosRegistro;
    const p = parseFloat(peso), t = parseFloat(talla), c = parseFloat(cintura), ca = parseFloat(cadera);
    const gc = parseFloat(grasaCorporal), gv = parseFloat(grasaVisceral), me = parseFloat(musculoEsqueletico);
    
    const gender = sexo || 'M';
    const age = parseInt(edad) || 20; 
    
    // IMC
    const imc = (p > 0 && t > 0) ? (p / Math.pow(t/100, 2)).toFixed(1) : null;
    let imcInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (imc) {
        if (imc < 18.5) imcInterp = { label: "Bajo Peso", color: "text-blue-400", desc: "Aumento sugerido", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (imc < 25) imcInterp = { label: "Saludable", color: "text-emerald-400", desc: "Peso óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (imc < 30) imcInterp = { label: "Sobrepeso", color: "text-yellow-400", desc: "Riesgo moderado", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else imcInterp = { label: "Obesidad", color: "text-red-400", desc: "Riesgo alto", bg: "bg-red-500/10 border-red-500/30" };
    }

    // ICC
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

    // Ruffier
    let ruffierVal = (p0 && p1 && p2) ? (((parseFloat(p0) + parseFloat(p1) + parseFloat(p2)) - 200) / 10).toFixed(1) : null;
    let ruffierInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (ruffierVal) {
        const v = parseFloat(ruffierVal);
        if (v <= 0) ruffierInterp = { label: "Excelente", color: "text-blue-400", desc: "Corazón Atleta", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v <= 5) ruffierInterp = { label: "Bueno", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v <= 10) ruffierInterp = { label: "Regular", color: "text-yellow-400", desc: "Mejora Sugerida", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else ruffierInterp = { label: "Malo", color: "text-red-400", desc: "Atención Necesaria", bg: "bg-red-500/10 border-red-500/30" };
    }

    // TREN SUPERIOR
    let supInterp = { label: "Pendiente", color: "text-slate-500", desc: "Faltan datos", bg: "bg-[#0f172a] border-white/5" };
    if (trenSuperior) {
        const v = parseFloat(trenSuperior);
        let b = gender === 'M' ? (age < 29 ? [36, 22, 17] : [30, 17, 11]) : (age < 29 ? [30, 15, 12] : [27, 13, 10]);

        if (v >= b[0]) supInterp = { label: "Excelente", color: "text-emerald-400", desc: "Élite", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v >= b[1]) supInterp = { label: "Bueno", color: "text-blue-400", desc: "Óptimo", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v >= b[2]) supInterp = { label: "Promedio", color: "text-yellow-400", desc: "Estándar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else supInterp = { label: "Regular/Pobre", color: "text-red-400", desc: "Deficiente", bg: "bg-red-500/10 border-red-500/30" };
    }

    // Tren Inferior
    let infInterp = { label: "Pendiente", color: "text-slate-500", desc: "Faltan datos", bg: "bg-[#0f172a] border-white/5" };
    if (trenInferior) {
        const v = parseFloat(trenInferior);
        const b = gender === 'M' ? [48, 43, 37, 33] : [44, 39, 33, 29];
        if (v > b[0]) infInterp = { label: "Excelente", color: "text-emerald-400", desc: "Élite", bg: "bg-emerald-500/10 border-emerald-500/30" };
        else if (v >= b[1]) infInterp = { label: "Bueno", color: "text-blue-400", desc: "Óptimo", bg: "bg-blue-500/10 border-blue-500/30" };
        else if (v >= b[2]) infInterp = { label: "Promedio", color: "text-yellow-400", desc: "Estándar", bg: "bg-yellow-500/10 border-yellow-500/30" };
        else if (v >= b[3]) infInterp = { label: "Regular", color: "text-orange-400", desc: "Bajo", bg: "bg-orange-500/10 border-orange-500/30" };
        else infInterp = { label: "Malo", color: "text-red-400", desc: "Deficiente", bg: "bg-red-500/10 border-red-500/30" };
    }

    // GRASA CORPORAL
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
      if (gc < b[0]) gcInterp = { label: "Bajo", color: "text-blue-400", desc: "Menor al sano", bg: "bg-blue-500/10 border-blue-500/30" };
      else if (gc < b[1]) gcInterp = { label: "Normal", color: "text-emerald-400", desc: "Óptimo", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (gc < b[2]) gcInterp = { label: "Elevado", color: "text-yellow-400", desc: "Precaución", bg: "bg-yellow-500/10 border-yellow-500/30" };
      else gcInterp = { label: "Muy Elevado", color: "text-red-400", desc: "Riesgo", bg: "bg-red-500/10 border-red-500/30" };
    }

    // GRASA VISCERAL
    let gvInterp = { label: "Pendiente", color: "text-slate-500", desc: "-", bg: "bg-[#0f172a] border-white/5" };
    if (!isNaN(gv)) {
      if (gv <= 9) gvInterp = { label: "Normal", color: "text-emerald-400", desc: "Saludable", bg: "bg-emerald-500/10 border-emerald-500/30" };
      else if (gv <= 14) gvInterp = { label: "Alto", color: "text-orange-400", desc: "Riesgo", bg: "bg-orange-500/10 border-orange-500/30" };
      else gvInterp = { label: "Muy Alto", color: "text-red-400", desc: "Peligro", bg: "bg-red-500/10 border-red-500/30" };
    }

    // MÚSCULO ESQUELÉTICO
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
      else meInterp = { label: "Muy Elevado", color: "text-purple-400", desc: "Gran masa", bg: "bg-purple-500/10 border-purple-500/30" };
    }

    return { imc, imcInterp, icc, iccInterp, ruffierVal, ruffierInterp, supInterp, infInterp, gcInterp, gvInterp, meInterp };
  }, [datosRegistro]);

  const evolUser = useMemo(() => {
    if (!userData || userData.role !== 'student') return null;
    const records = [...historial].sort((a, b) => mesesEtapas.indexOf(a.etapa) - mesesEtapas.indexOf(b.etapa));
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
      highlight 
    };
  }, [historial, userData]);

  const finalizarRegistro = async () => {
    setRegError("");
    const req = ['peso', 'talla', 'cintura', 'cadera', 'p0', 'p1', 'p2', 'trenSuperior', 'trenInferior', 'sexo'];
    const newReq = ['grasaCorporal', 'grasaVisceral', 'musculoEsqueletico'];
    if ([...req, ...newReq].some(f => !datosRegistro[f])) return setRegError("Complete todos los campos de evaluación (incluyendo grasa y músculo) antes de finalizar.");
    
    try {
      // 1. Guardar la fase de evaluación
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), {
        ...datosRegistro, ...resultadosActuales, matricula: userData.matricula, nombre: userData.nombre, fecha: new Date().toLocaleDateString(), timestamp: Date.now()
      });

      // 2. Si actualizaron Edad o Sexo, guardarlos en el perfil base para futuras sesiones
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

      // Limpiar y avanzar
      setDatosRegistro(p => ({ 
        ...p, 
        etapa: nextEtapa, 
        peso: '', talla: '', cintura: '', cadera: '', p0: '', p1: '', p2: '', trenSuperior: '', trenInferior: '', grasaCorporal: '', grasaVisceral: '', musculoEsqueletico: '' 
      }));
    } catch (e) { 
      console.error(e);
      alert(`Error al guardar en la base de datos: ${e.message}\nVerifica que la base de datos de Firestore esté habilitada en modo de prueba.`); 
    }
  };

  if (loading) return <div className="min-h-screen bg-[#070913] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center p-4 relative overflow-hidden">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(-15deg); }
            100% { transform: translateX(150%) skewX(-15deg); }
          }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(40px, -60px) scale(1.1); }
            66% { transform: translate(-30px, 30px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 15s infinite alternate; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
        
        {/* Fondo Animado Vibrante Premium */}
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
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.4)]"><LogIn className="text-white" size={32} /></div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-md">Reto <span className="text-cyan-400">Actívate</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-[0.3em]">DIRECCIÓN DE ATENCIÓN ESTUDIANTIL</p>
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
    <div className="min-h-screen bg-[#070913] text-slate-300 font-sans relative overflow-hidden">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      <ModalConfirmacion isOpen={deleteConfirm.show} onClose={() => setDeleteConfirm({ show: false, id: null, type: null, label: '' })} onConfirm={executeDelete} titulo="¿Confirmar Eliminación?" mensaje={`Estás a punto de borrar permanentemente a: ${deleteConfirm.label}.`} />

      {/* Fondo Neon Dark Animado Vivo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/30 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/30 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-emerald-600/20 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        {authFailed && (
           <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl mb-8 flex items-center justify-center gap-3 animate-in slide-in-from-top-4 shadow-lg shadow-red-500/20">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <p className="text-red-200 text-xs md:text-sm font-bold uppercase tracking-wide">⚠️ Error crítico: La app no puede guardar porque la Autenticación "Anónima" no está habilitada en Firebase.</p>
           </div>
        )}

        <header className="mb-12 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-[2rem] shadow-[0_0_40px_rgba(6,182,212,0.4)] border border-cyan-400/30"><Zap className="text-white fill-white" size={28} /></div>
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
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('registro')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'registro' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Registro</button>
                <button onClick={() => setActiveTab('evolución')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'evolución' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'}`}>Evolución</button>
              </>
            )}
            <button onClick={handleLogout} className="p-3 text-red-400 ml-2 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"><LogOut size={18}/></button>
          </nav>
        </header>

        {userData.role === 'admin' && activeTab === 'usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
            <div className="lg:col-span-5 space-y-8">
              {/* ALTA MANUAL */}
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

              {/* IMPORTACIÓN EXCEL */}
              <div className="bg-[#0f172a]/90 p-8 rounded-[3rem] border border-emerald-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] h-fit relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/20 blur-[50px] rounded-full"></div>
                <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-3 relative z-10"><FileSpreadsheet size={18} /> Importar Excel</h2>
                <div className="space-y-6 relative z-10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">Carga masiva. Columnas requeridas: <span className="text-emerald-400">Nombre, Matricula, Password, Unidad Academica, Edad, Sexo</span>.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={downloadTemplate} className="flex items-center justify-center gap-2 py-4 bg-[#1a1d2d] text-white border border-white/10 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-[#24293d] transition-all">
                       <Download size={14} /> Plantilla
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all border border-emerald-400/50">
                       {isImporting ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />} {isImporting ? 'Subiendo...' : 'Subir Archivo'}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleExcelUpload} accept=".xlsx, .xls" className="hidden" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0f172a]/90 p-8 rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[850px] overflow-y-auto">
              <h2 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3"><Users size={18} /> Directorio Activo ({usuariosLista.length})</h2>
              <div className="space-y-3">
                {usuariosLista.length === 0 ? <p className="text-slate-500 text-center py-20 text-[10px] font-black uppercase italic tracking-widest">Sin alumnos registrados</p> : 
                usuariosLista.map(u => (
                  <div key={u.id} className="bg-[#1a1d2d]/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center group transition-all hover:border-cyan-500/40 hover:bg-[#1a1d2d]">
                    <div>
                        <p className="text-sm font-black text-white italic">{String(u.nombre || 'Sin Nombre')}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-1">{String(u.matricula)} • {String(u.unidadAcademica)}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right"><p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Clave</p><p className="text-cyan-400 font-black text-sm tracking-widest">{String(u.password)}</p></div>
                        <button onClick={() => triggerDelete(u.matricula, 'user', u.nombre)} className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {userData.role === 'admin' && activeTab === 'historial' && (
          <div className="bg-[#0f172a]/80 rounded-[3rem] border border-white/5 overflow-hidden animate-in fade-in backdrop-blur-xl shadow-2xl">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Historial Global</h2>
                <button onClick={exportarCSV} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/50"><Download size={16}/> Exportar CSV</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
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

        {userData.role === 'student' && activeTab === 'registro' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in">
            {/* Columna Izquierda: Captura */}
            <div className="xl:col-span-7 space-y-8 pb-20">
              <div className="bg-[#0f172a]/90 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-xl">
                <h3 className="text-lg font-black text-white uppercase italic mb-4 flex items-center gap-2 tracking-tighter"><Calendar className="text-blue-500" size={20}/> Fase a Reportar</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {mesesEtapas.map(m => {
                    const isB = historial.some(h => h.etapa === m);
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

              <div className="bg-[#0f172a]/90 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 backdrop-blur-2xl space-y-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                 {(() => {
                   const isViewingMode = historial.some(h => h.etapa === datosRegistro.etapa);
                   return (
                     <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[#24293d] pb-10 relative z-10">
                    <SelectField label="Sexo Biológico" value={datosRegistro.sexo} onChange={e => setDatosRegistro({...datosRegistro, sexo: e.target.value})} options={[{label: "Masculino", value: "M"}, {label: "Femenino", value: "F"}]} icon={User} colorClass="blue" disabled={isViewingMode} />
                    <InputField label="Edad" value={datosRegistro.edad} onChange={e => setDatosRegistro({...datosRegistro, edad: e.target.value})} unit="años" icon={Calendar} colorClass="blue" disabled={isViewingMode} />
                 </div>
                 
                 <div className="relative z-10">
                   <h2 className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Ruler size={20}/> Medidas Generales</h2>
                   <div className="grid grid-cols-2 gap-4 md:gap-6">
                     <InputField label="Peso" value={datosRegistro.peso} onChange={e => setDatosRegistro({...datosRegistro, peso: e.target.value})} unit="kg" colorClass="indigo" disabled={isViewingMode} />
                     <InputField label="Talla" value={datosRegistro.talla} onChange={e => setDatosRegistro({...datosRegistro, talla: e.target.value})} unit="cm" colorClass="indigo" disabled={isViewingMode} />
                     <InputField label="Cintura" value={datosRegistro.cintura} onChange={e => setDatosRegistro({...datosRegistro, cintura: e.target.value})} unit="cm" colorClass="indigo" disabled={isViewingMode} />
                     <InputField label="Cadera" value={datosRegistro.cadera} onChange={e => setDatosRegistro({...datosRegistro, cadera: e.target.value})} unit="cm" colorClass="indigo" disabled={isViewingMode} />
                   </div>
                 </div>

                 {/* NUEVA SECCIÓN COMPOSICIÓN CORPORAL */}
                 <div className="relative z-10">
                   <h2 className="text-xs md:text-sm font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Activity size={20}/> Composición Corporal</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                     <InputField label="Grasa Corporal" value={datosRegistro.grasaCorporal} onChange={e => setDatosRegistro({...datosRegistro, grasaCorporal: e.target.value})} unit="%" colorClass="rose" icon={Flame} disabled={isViewingMode}/>
                     <InputField label="Grasa Visceral" value={datosRegistro.grasaVisceral} onChange={e => setDatosRegistro({...datosRegistro, grasaVisceral: e.target.value})} unit="Nivel" colorClass="orange" icon={ShieldAlert} disabled={isViewingMode}/>
                     <InputField label="Musc. Esquelético" value={datosRegistro.musculoEsqueletico} onChange={e => setDatosRegistro({...datosRegistro, musculoEsqueletico: e.target.value})} unit="%" colorClass="cyan" icon={BicepsFlexed} disabled={isViewingMode}/>
                   </div>
                 </div>

                 <div className="relative z-10">
                   <h2 className="text-xs md:text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Heart size={20}/> Test Ruffier</h2>
                   <div className="grid grid-cols-3 gap-3 md:gap-6">
                     <InputField label="P0 (Reposo)" value={datosRegistro.p0} onChange={e => setDatosRegistro({...datosRegistro, p0: e.target.value})} colorClass="emerald" disabled={isViewingMode} />
                     <InputField label="P1 (Post)" value={datosRegistro.p1} onChange={e => setDatosRegistro({...datosRegistro, p1: e.target.value})} colorClass="emerald" disabled={isViewingMode} />
                     <InputField label="P2 (Recup)" value={datosRegistro.p2} onChange={e => setDatosRegistro({...datosRegistro, p2: e.target.value})} colorClass="emerald" disabled={isViewingMode} />
                   </div>
                 </div>

                 <div className="relative z-10">
                   <h2 className="text-xs md:text-sm font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md"><Zap size={20}/> Potencia Muscular</h2>
                   <div className="grid grid-cols-2 gap-4 md:gap-6">
                     <InputField label="Tren Superior" value={datosRegistro.trenSuperior} onChange={e => setDatosRegistro({...datosRegistro, trenSuperior: e.target.value})} unit="reps" colorClass="blue" icon={Zap} disabled={isViewingMode}/>
                     <InputField label="Tren Inferior" value={datosRegistro.trenInferior} onChange={e => setDatosRegistro({...datosRegistro, trenInferior: e.target.value})} unit="reps" colorClass="purple" icon={TrendingUp} disabled={isViewingMode}/>
                   </div>
                 </div>
                     </>
                   );
                 })()}
              </div>
            </div>

            {/* Columna Derecha: Panel de Interpretaciones Detallado */}
            <div className="xl:col-span-5">
              <div className="sticky top-8 space-y-6 bg-[#0f172a]/90 backdrop-blur-3xl p-6 md:p-8 rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-500"></div>
                <h2 className="text-xl md:text-2xl font-black text-white italic mb-8 flex items-center gap-3 tracking-tighter"><Eye className="text-cyan-400" /> Resultados Clínicos</h2>
                
                <div className="flex flex-col gap-4">
                   {/* Tarjeta Ruffier (Principal) */}
                   <div className={`p-6 rounded-[2rem] border flex flex-col items-center justify-center relative overflow-hidden shadow-inner transition-all ${resultadosActuales.ruffierInterp.bg}`}>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 relative z-10 drop-shadow-md">Índice Ruffier (Cardio)</p>
                      <span className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg relative z-10 my-2">{String(resultadosActuales.ruffierVal ?? '--')}</span>
                      <p className={`text-[12px] font-black uppercase tracking-widest relative z-10 drop-shadow-md ${resultadosActuales.ruffierInterp.color}`}>{String(resultadosActuales.ruffierInterp.label)}</p>
                      <p className="mt-1 text-[10px] text-slate-300 italic font-bold relative z-10">{String(resultadosActuales.ruffierInterp.desc)}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {/* Grasa Corporal */}
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.gcInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">Grasa Corporal</p>
                        <p className="text-2xl font-black text-white">{String(datosRegistro.grasaCorporal || '--')}<span className="text-xs opacity-50">%</span></p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.gcInterp.color}`}>{String(resultadosActuales.gcInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.gcInterp.desc)}</p>
                      </div>

                      {/* Musculo Esqueletico */}
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.meInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">Músculo Esq.</p>
                        <p className="text-2xl font-black text-white">{String(datosRegistro.musculoEsqueletico || '--')}<span className="text-xs opacity-50">%</span></p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.meInterp.color}`}>{String(resultadosActuales.meInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.meInterp.desc)}</p>
                      </div>

                      {/* Grasa Visceral */}
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.gvInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">Grasa Visceral</p>
                        <p className="text-2xl font-black text-white">{String(datosRegistro.grasaVisceral || '--')}</p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.gvInterp.color}`}>{String(resultadosActuales.gvInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.gvInterp.desc)}</p>
                      </div>

                      {/* IMC */}
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.imcInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">IMC (Salud)</p>
                        <p className="text-2xl font-black text-white">{String(resultadosActuales.imc || '--')}</p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.imcInterp.color}`}>{String(resultadosActuales.imcInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.imcInterp.desc)}</p>
                      </div>

                      {/* Tren Superior */}
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.supInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">Tren Superior</p>
                        <p className="text-2xl font-black text-white">{String(datosRegistro.trenSuperior || '--')}</p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.supInterp.color}`}>{String(resultadosActuales.supInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.supInterp.desc)}</p>
                      </div>
                      
                      {/* Tren Inferior */}
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.infInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">Tren Inferior</p>
                        <p className="text-2xl font-black text-white">{String(datosRegistro.trenInferior || '--')}</p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.infInterp.color}`}>{String(resultadosActuales.infInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.infInterp.desc)}</p>
                      </div>

                      {/* Tarjeta ICC */}
                      <div className={`col-span-2 md:col-span-1 p-4 md:p-5 rounded-3xl border flex flex-col items-center text-center shadow-inner transition-all ${resultadosActuales.iccInterp.bg}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest drop-shadow-md">ICC (Riesgo)</p>
                        <p className="text-2xl font-black text-white">{String(resultadosActuales.icc || '--')}</p>
                        <p className={`text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-widest drop-shadow-md ${resultadosActuales.iccInterp.color}`}>{String(resultadosActuales.iccInterp.label)}</p>
                        <p className="text-[8px] text-slate-300 italic mt-1 font-bold truncate w-full px-1">{String(resultadosActuales.iccInterp.desc)}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#24293d] space-y-6 relative z-10">
                   {historial.some(h => h.etapa === datosRegistro.etapa) ? (
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
                          <Save size={20}/> Guardar Fase
                       </button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}

        {userData.role === 'student' && activeTab === 'evolución' && (
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
                 <h4 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter relative z-10">{String(evolUser?.highlight?.area || 'Cargando')}</h4>
                 <p className="text-xs text-slate-400 font-bold leading-relaxed italic relative z-10">{String(evolUser?.highlight?.msg || 'Verificando datos...')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
               <ProgressLineChart data={evolUser?.ruffier} label="Recuperación Cardio" unit="pts" colorKey="emerald" />
               <ProgressLineChart data={evolUser?.grasaCorporal} label="Grasa Corporal" unit="%" colorKey="rose" />
               <ProgressLineChart data={evolUser?.musculoEsqueletico} label="Músculo Esquelético" unit="%" colorKey="cyan" />
               <ProgressLineChart data={evolUser?.superior} label="Tren Superior" unit="reps" colorKey="blue" />
               <ProgressLineChart data={evolUser?.inferior} label="Tren Inferior" unit="reps" colorKey="purple" />
               <ProgressLineChart data={evolUser?.peso} label="Evolución de Peso" unit="kg" colorKey="indigo" />
               <ProgressLineChart data={evolUser?.grasaVisceral} label="Grasa Visceral" unit="Nivel" colorKey="orange" />
            </div>

            {/* NUEVA SECCIÓN: VITRINA DE LOGROS (GAMIFICACIÓN AMPLIA DE 16 MEDALLAS) */}
            {(() => {
              const sorted = [...historial].sort((a, b) => mesesEtapas.indexOf(a.etapa) - mesesEtapas.indexOf(b.etapa));
              const hasProgress = sorted.length > 1; 
              const ultimo = sorted.length > 0 ? sorted[sorted.length - 1] : null;

              const primerPaso = hasProgress;
              const isConstante = sorted.length >= 3;
              const retoCompletado = sorted.length === 4;

              const mejoroCardio = hasProgress && parseFloat(ultimo.ruffierVal) < parseFloat(sorted[0].ruffierVal);
              const mejoroSup = hasProgress && parseFloat(ultimo.trenSuperior) > parseFloat(sorted[0].trenSuperior);
              const mejoroInf = hasProgress && parseFloat(ultimo.trenInferior) > parseFloat(sorted[0].trenInferior);
              const mejoroCore = hasProgress && parseFloat(ultimo.cintura) < parseFloat(sorted[0].cintura);
              
              // Nuevas Medallas Composición
              const mejoroGrasaCorp = hasProgress && ultimo.grasaCorporal && parseFloat(ultimo.grasaCorporal) < parseFloat(sorted[0].grasaCorporal);
              const hipertrofia = ultimo && ultimo.musculoEsqueletico && (
                 (ultimo.sexo === 'M' && parseFloat(ultimo.musculoEsqueletico) >= 33.3) ||
                 (ultimo.sexo !== 'M' && parseFloat(ultimo.musculoEsqueletico) >= 24.3)
              );
              const escudoInterno = ultimo && ultimo.grasaVisceral && parseFloat(ultimo.grasaVisceral) <= 9;
              
              const atletaIntegral = mejoroCardio && mejoroSup && mejoroInf;
              
              const imcSaludable = hasProgress && ultimo && parseFloat(ultimo.imc) >= 18.5 && parseFloat(ultimo.imc) < 25;
              const iccSaludable = hasProgress && ultimo && (
                (ultimo.sexo === 'M' && parseFloat(ultimo.icc) < 0.95) || 
                (ultimo.sexo !== 'M' && parseFloat(ultimo.icc) < 0.80)
              );
              const corazonAtleta = hasProgress && ultimo && parseFloat(ultimo.ruffierVal) <= 3;
              const fuerzaElite = hasProgress && ultimo && (
                (ultimo.sexo === 'M' && (parseFloat(ultimo.trenSuperior) >= 55 || parseFloat(ultimo.trenInferior) > 48)) ||
                (ultimo.sexo !== 'M' && (parseFloat(ultimo.trenSuperior) >= 49 || parseFloat(ultimo.trenInferior) > 44))
              );

              // Cálculo de Progreso
              const estadosMedallas = [
                primerPaso, isConstante, retoCompletado, atletaIntegral,
                imcSaludable, iccSaludable, escudoInterno, mejoroCore,
                mejoroGrasaCorp, hipertrofia, mejoroCardio, corazonAtleta,
                mejoroSup, mejoroInf, fuerzaElite
              ];
              const totalMedallasBases = estadosMedallas.length;
              const medallasObtenidas = estadosMedallas.filter(Boolean).length;
              const medallasFaltantes = totalMedallasBases - medallasObtenidas;
              const platinoDesbloqueado = medallasObtenidas === totalMedallasBases;
              const porcentajeProgreso = (medallasObtenidas / totalMedallasBases) * 100;

              const renderBadge = (active, title, desc, IconComponent, colorClass) => {
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
                const theme = themes[colorClass] || themes.blue;

                return (
                  <div className={`p-5 md:p-6 rounded-[2.5rem] border-[1px] flex flex-col items-center text-center transition-all duration-500 relative group 
                    ${active 
                      ? `${colorClass === 'platinum' ? theme.cardBg : 'bg-[#1e2336]'} ${theme.border} ${theme.glow} hover:scale-105 hover:-translate-y-2 z-10 hover:z-20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]` 
                      : 'bg-[#0f172a]/40 border-white/5 opacity-60 grayscale-[0.8] hover:grayscale-[0.4] hover:opacity-100 shadow-none'}`}>
                    
                    {/* Animated Shine Effect on hover */}
                    {active && (
                      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out]"></div>
                      </div>
                    )}

                    {/* Glowing back blob */}
                    {active && colorClass !== 'platinum' && <div className={`absolute top-[-30px] right-[-30px] w-24 h-24 blur-[35px] rounded-full opacity-40 ${theme.iconBg}`}></div>}
                    
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 border relative z-10 transition-transform duration-500 shadow-inner
                      ${active ? `${theme.iconBg} border-white/30 text-white shadow-lg scale-110 group-hover:scale-125 group-hover:rotate-12` : 'bg-[#131620] border-white/5 text-slate-500'}`}>
                      {active ? <IconComponent size={24} className={`md:w-7 md:h-7 drop-shadow-md ${colorClass === 'platinum' ? 'text-slate-800' : 'text-white'}`} /> : <Lock size={20} className="md:w-6 md:h-6" />}
                    </div>
                    
                    <h5 className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1 md:mb-2 relative z-10 leading-tight 
                      ${active ? (colorClass === 'platinum' ? 'text-slate-900 drop-shadow-sm' : 'text-white drop-shadow-md') : 'text-slate-500'}`}>{title}</h5>
                    
                    <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tighter relative z-10 leading-tight px-1 
                      ${active ? theme.text : 'text-slate-600'}`}>{desc}</p>
                  </div>
                );
              };

              return (
                <div className="bg-[#0f172a]/90 backdrop-blur-3xl p-6 md:p-10 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden mt-6">
                  <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  <h3 className="text-2xl md:text-3xl font-black text-white italic mb-2 flex items-center gap-3 md:gap-4 relative z-10 tracking-tighter"><Award className="text-cyan-400" size={32} /> Vitrina de Logros</h3>
                  
                  {/* BARRA DE PROGRESO */}
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
                    {/* Fila 1: Disciplina */}
                    {renderBadge(primerPaso, "Primer Paso", "Mes 1 Completado", ArrowUpRight, "slate")}
                    {renderBadge(isConstante, "Disciplina", "Mes 2 Completado", Calendar, "yellow")}
                    {renderBadge(retoCompletado, "Constancia", "Reto Finalizado", Star, "orange")}
                    {renderBadge(atletaIntegral, "Atleta Integral", "Mejora en 3 pruebas", Trophy, "orange")}
                    
                    {/* Fila 2: Composición Corporal */}
                    {renderBadge(imcSaludable, "Equilibrio", "IMC Saludable", Weight, "cyan")}
                    {renderBadge(iccSaludable, "Riesgo Cero", "ICC Bajo Riesgo", ShieldCheck, "pink")}
                    {renderBadge(escudoInterno, "Escudo Interno", "Grasa Visceral Sana", ShieldAlert, "yellow")}
                    {renderBadge(mejoroCore, "Core de Acero", "Reducción de Cintura", Ruler, "lime")}
                    
                    {/* Fila 3: Grasa y Músculo */}
                    {renderBadge(mejoroGrasaCorp, "Definición", "Mejoró Grasa Corp.", Flame, "rose")}
                    {renderBadge(hipertrofia, "Hipertrofia", "Músculo en Nivel Sano", BicepsFlexed, "blue")}
                    {renderBadge(mejoroCardio, "Motor Imparable", "Mejora Test Ruffier", Heart, "emerald")}
                    {renderBadge(corazonAtleta, "Cardio Élite", "Ruffier Nivel Excelente", Activity, "red")}

                    {/* Fila 4: Rendimiento Físico y Platino */}
                    {renderBadge(mejoroSup, "Fuerza Bruta", "Mejora Tren Superior", Zap, "blue")}
                    {renderBadge(mejoroInf, "Pot. Explosiva", "Mejora Tren Inferior", TrendingUp, "purple")}
                    {renderBadge(fuerzaElite, "Fuerza Élite", "Fuerza Nivel Excelente", Award, "indigo")}
                    {renderBadge(platinoDesbloqueado, "Platino Absoluto", "Colección Completa", Crown, "platinum")}
                  </div>
                </div>
              );
            })()}
            
            <div className="p-6 bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border border-white/5 flex gap-4 items-center shadow-inner">
                <Info size={18} className="text-blue-500 shrink-0" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haz clic en los puntos de las gráficas para ver el valor exacto de cada mes.</p>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center pb-20 border-t border-[#24293d] pt-10">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em]">Reto Actívate System • v9.5 Firebase Fixed • DAES BUAP</p>
        </footer>
      </div>
    </div>
  );
};

export default App;