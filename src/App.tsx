import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  User, Lock, Eye, EyeOff, Shield, Users, LineChart as ChartIcon, Image, LogOut, 
  UserCheck, Download, Upload, ClipboardList, PlayCircle, PieChart, Activity, 
  Stethoscope, CheckCircle, AlertCircle, Trash2, ExternalLink, Youtube, Link2, 
  Award, Star, HeartPulse, Dumbbell, BookOpen, Crown, Info
} from 'lucide-react';

type Role = 'admin' | 'student';

interface Usuario {
  id: string;
  name: string;
  password?: string;
  unidad?: string;
  role: Role;
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

const DEFAULT_DB = {
  users: [
    { id: "ADMIN", password: "RETO2024", role: "admin", name: "Administrador del Sistema" } as Usuario
  ],
  settings: {
    surveyEnabled: false
  },
  content: {
    mes1: { cultura_fisica: [] as ContentItem[], nutricion: [] as ContentItem[] },
    mes2: { cultura_fisica: [] as ContentItem[], nutricion: [] as ContentItem[] },
    mes3: { cultura_fisica: [] as ContentItem[], nutricion: [] as ContentItem[] }
  },
  evaluations: {} as Record<string, Record<string, Evaluacion>>,
  surveys: {} as Record<string, any>
};

const num = (val: string | number) => parseFloat(val as string) || 0;

function clasificarIMC(peso: number, tallaCm: number) {
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
  if (nivel <= 9) return "Normal (Saludable)";
  if (nivel <= 14) return "Alto (Riesgo)";
  return "Muy Alto (Peligro)";
}

function clasificarMusculo(musculo: number, sexo: string, edad: number) {
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
  const index = ((p0 + p1 + p2) - 200) / 10;
  let clasificacion = "";
  if (index <= 0) clasificacion = "Excelente (Corazón Atleta)";
  else if (index <= 5.0) clasificacion = "Bueno (Óptimo)";
  else if (index <= 10.0) clasificacion = "Regular (Mejora Sugerida)";
  else clasificacion = "Malo (Atención Necesaria)";
  return { valor: index.toFixed(1), clasificacion };
}

function clasificarTrenSuperior(reps: number, sexo: string, edad: number) {
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
  if (sexo === 'femenino') {
    if (reps > 44) return "Excelente (Élite)"; if (reps >= 39) return "Bueno (Óptimo)"; if (reps >= 33) return "Promedio (Estándar)"; if (reps >= 29) return "Regular (Bajo)"; return "Malo (Deficiente)";
  } else {
    if (reps > 48) return "Excelente (Élite)"; if (reps >= 43) return "Bueno (Óptimo)"; if (reps >= 37) return "Promedio (Estándar)"; if (reps >= 33) return "Regular (Bajo)"; return "Malo (Deficiente)";
  }
}

function analizarEvaluacionCompleta(datos: Evaluacion) {
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
  if (/Excelente|Sano|Atleta|Óptimo/.test(text)) return 'text-green-600';
  if (/Promedio|Normal/.test(text)) return 'text-blue-600';
  if (/Regular|Elevado|Riesgo Medio|Sobrepeso/.test(text)) return 'text-yellow-600';
  return 'text-red-600';
};

export default function App() {
  const [db, setDb] = useState<typeof DEFAULT_DB>(DEFAULT_DB);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Inicializar DB
  useEffect(() => {
    const local = localStorage.getItem('retoActivateDB_v2');
    if (local) {
      try {
        setDb(JSON.parse(local));
      } catch (e) {
        console.error("Error parsing DB", e);
      }
    }
  }, []);

  // Guardar DB
  const saveDB = (newDb: typeof DEFAULT_DB) => {
    setDb(newDb);
    localStorage.setItem('retoActivateDB_v2', JSON.stringify(newDb));
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-screen w-full bg-gray-50 font-sans text-gray-800 antialiased overflow-hidden flex">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 text-white transition-all transform duration-300
          ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          <span>{toast.msg}</span>
        </div>
      )}

      {!currentUser ? (
        <LoginView db={db} onLogin={(user) => { setCurrentUser(user); showToast(`Bienvenido ${user.name}`); }} />
      ) : currentUser.role === 'admin' ? (
        <AdminView db={db} saveDB={saveDB} onLogout={() => setCurrentUser(null)} showToast={showToast} />
      ) : (
        <StudentView db={db} saveDB={saveDB} user={currentUser} onLogout={() => setCurrentUser(null)} showToast={showToast} />
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
    else alert("Credenciales incorrectas"); // Simplificado para componente, usa alert nativo o podrías pasar showToast
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#003b5c] to-[#005587] absolute inset-0 z-50">
      <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl w-[90%] max-w-md text-center transform transition-all duration-500 hover:scale-[1.01]">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-[#cda036] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <Activity className="text-white w-12 h-12" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#003b5c] mb-2">RETO ACTÍVATE</h1>
        <h2 className="text-xl text-gray-500 mb-8 font-light tracking-widest">ESTUDIANTIL</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="text-gray-400 w-5 h-5" />
            </div>
            <input type="text" required placeholder="Matrícula / ID Institucional" value={id} onChange={e => setId(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#003b5c] focus:border-[#003b5c] bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-colors" />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="text-gray-400 w-5 h-5" />
            </div>
            <input type={showPwd ? "text" : "password"} required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-[#003b5c] focus:border-[#003b5c] bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-colors" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#003b5c] focus:outline-none">
              {showPwd ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
            </button>
          </div>
          
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#003b5c] hover:bg-[#005587] focus:outline-none transition-all uppercase tracking-wider">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminView({ db, saveDB, onLogout, showToast }: any) {
  const [tab, setTab] = useState<'usuarios' | 'historial' | 'contenido'>('usuarios');

  // Formularios de admin
  const [alta, setAlta] = useState({ nombre: '', matricula: '', password: '', unidad: '' });
  const [cont, setCont] = useState({ mes: 'mes1', categoria: 'cultura_fisica', estado: 'activo', titulo: '', url: '' });

  const handleAlta = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.users.find((u: any) => u.id === alta.matricula)) return showToast("Matrícula existente", "error");
    const newDb = { ...db, users: [...db.users, { id: alta.matricula, name: alta.nombre, password: alta.password, unidad: alta.unidad, role: 'student' }] };
    saveDB(newDb);
    setAlta({ nombre: '', matricula: '', password: '', unidad: '' });
    showToast("Alumno registrado exitosamente");
  };

  const handleBorrarUsuario = (id: string) => {
    if(!window.confirm(`¿Estás seguro de que quieres borrar a este usuario (Matrícula: ${id})?`)) return;
    const newDb = { ...db, users: db.users.filter((u:any) => u.id !== id) };
    delete newDb.evaluations[id];
    delete newDb.surveys[id];
    saveDB(newDb);
    showToast("Usuario borrado");
  };

  const handleAgregarContenido = (e: React.FormEvent) => {
    e.preventDefault();
    const newDb = { ...db };
    newDb.content[cont.mes][cont.categoria].push({ id: Date.now().toString(), titulo: cont.titulo, url: cont.url, estado: cont.estado });
    saveDB(newDb);
    setCont({ ...cont, titulo: '', url: '' });
    showToast("Contenido agregado");
  };

  const toggleEncuesta = () => {
    saveDB({ ...db, settings: { ...db.settings, surveyEnabled: !db.settings.surveyEnabled } });
    showToast(db.settings.surveyEnabled ? "Encuesta deshabilitada" : "Encuesta habilitada", "success");
  };

  const simularCarga = () => {
    showToast("Simulando carga masiva...");
    setTimeout(() => showToast("Carga simulada completa", "success"), 1500);
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
    a.download = "historial_global.csv";
    a.click();
  };

  return (
    <div className="flex w-full h-full">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
          <div className="bg-[#003b5c] text-white p-2 rounded-lg"><Shield className="w-6 h-6"/></div>
          <div><h2 className="text-lg font-bold text-gray-800">Panel Admin</h2><p className="text-xs text-gray-500">Gestión General</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarBtn active={tab === 'usuarios'} onClick={() => setTab('usuarios')} icon={<Users/>} label="Usuarios" />
          <SidebarBtn active={tab === 'historial'} onClick={() => setTab('historial')} icon={<ChartIcon/>} label="Historial Global" />
          <SidebarBtn active={tab === 'contenido'} onClick={() => setTab('contenido')} icon={<Image/>} label="Contenido" />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5"/> <span>Salir del Perfil</span>
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-800">
            {tab === 'usuarios' ? 'Gestión de Usuarios' : tab === 'historial' ? 'Historial Global' : 'Gestor de Contenidos'}
          </h1>
          <span className="text-sm text-gray-500">Sesión: <strong className="text-[#003b5c]">ADMIN</strong></span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* TAB: USUARIOS */}
          {tab === 'usuarios' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Alta de Estudiante (Manual)</h3>
                  <form onSubmit={handleAlta} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" required placeholder="Nombre Completo" value={alta.nombre} onChange={e=>setAlta({...alta, nombre: e.target.value})} className="p-2 border rounded focus:ring-[#003b5c] focus:border-[#003b5c]" />
                    <input type="text" required placeholder="Matrícula" value={alta.matricula} onChange={e=>setAlta({...alta, matricula: e.target.value})} className="p-2 border rounded focus:ring-[#003b5c]" />
                    <input type="text" required placeholder="Contraseña" value={alta.password} onChange={e=>setAlta({...alta, password: e.target.value})} className="p-2 border rounded focus:ring-[#003b5c]" />
                    <select required value={alta.unidad} onChange={e=>setAlta({...alta, unidad: e.target.value})} className="p-2 border rounded focus:ring-[#003b5c]">
                      <option value="">Seleccione Unidad...</option>
                      <option value="Dirección de Atención Estudiantil">Dirección de Atención Estudiantil</option>
                      <option value="Facultad de Medicina">Facultad de Medicina</option>
                      <option value="Facultad de Computación">Facultad de Computación</option>
                      <option value="Otra">Otra Unidad Académica...</option>
                    </select>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" className="bg-[#003b5c] text-white px-6 py-2 rounded-lg hover:bg-[#005587]">Registrar</button>
                    </div>
                  </form>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Carga Masiva</h3>
                    <div className="flex flex-col space-y-3">
                      <button className="text-[#003b5c] text-sm flex items-center hover:underline"><Download className="w-4 h-4 mr-1"/> Descargar Plantilla</button>
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                        <span className="text-sm text-gray-600">Subir CSV</span>
                        <input type="file" className="hidden" accept=".csv" onChange={simularCarga} />
                      </label>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Encuesta Clínica</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Habilitar Expediente</span>
                      <button onClick={toggleEncuesta} className={`w-12 h-6 rounded-full transition-colors relative ${db.settings.surveyEnabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${db.settings.surveyEnabled ? 'translate-x-6' : ''}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50"><h3 className="font-semibold text-gray-700">Directorio Activo</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase">
                      <tr><th className="p-3">Matrícula</th><th className="p-3">Nombre</th><th className="p-3">Unidad</th><th className="p-3">Clave</th><th className="p-3 text-center">Acción</th></tr>
                    </thead>
                    <tbody>
                      {db.users.filter((u:any)=>u.role==='student').map((s:any) => (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-3 font-medium">{s.id}</td><td className="p-3">{s.name}</td><td className="p-3 text-xs">{s.unidad}</td><td className="p-3 font-mono">{s.password}</td>
                          <td className="p-3 text-center">
                            <button onClick={()=>handleBorrarUsuario(s.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5 mx-auto"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORIAL */}
          {tab === 'historial' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Evaluaciones Globales</h3>
                  <button onClick={descargarHistorial} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center">
                    <Download className="w-4 h-4 mr-2"/> Exportar Analítico
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <tr><th className="p-3">Fase</th><th className="p-3">Estudiante</th><th className="p-3">Composición</th><th className="p-3">Rendimiento</th><th className="p-3">Acción</th></tr>
                    </thead>
                    <tbody>
                      {db.users.filter((u:any)=>u.role==='student').map((student:any) => {
                        if(!db.evaluations[student.id]) return null;
                        return Object.keys(db.evaluations[student.id]).map(fase => {
                          const d = db.evaluations[student.id][fase];
                          const res = analizarEvaluacionCompleta(d);
                          return (
                            <tr key={`${student.id}-${fase}`} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="p-3 uppercase text-xs font-bold">{fase}</td>
                              <td className="p-3">{student.name} <span className="block text-xs text-gray-400">{student.id}</span></td>
                              <td className="p-3 text-xs">IMC: {res.imc.valor} | Grasa: {d.grasa}% | Musc: {d.musculo}%</td>
                              <td className="p-3 text-xs">Ruffier: {res.ruffier.clasificacion} | T.Sup: {d.trensup} | T.Inf: {d.treninf}</td>
                              <td className="p-3">
                                <button onClick={() => {
                                  if(window.confirm("Borrar historial de esta fase?")) {
                                    const newDb = {...db}; delete newDb.evaluations[student.id][fase]; saveDB(newDb);
                                  }
                                }} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
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

          {/* TAB: CONTENIDO */}
          {tab === 'contenido' && (
             <div className="space-y-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Gestor de Contenidos</h3>
                  <form onSubmit={handleAgregarContenido} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={cont.mes} onChange={e=>setCont({...cont, mes: e.target.value})} className="p-2 border rounded"><option value="mes1">Mes 1</option><option value="mes2">Mes 2</option><option value="mes3">Mes 3</option></select>
                        <select value={cont.categoria} onChange={e=>setCont({...cont, categoria: e.target.value})} className="p-2 border rounded"><option value="cultura_fisica">Cultura Física</option><option value="nutricion">Nutrición</option></select>
                        <select value={cont.estado} onChange={e=>setCont({...cont, estado: e.target.value})} className="p-2 border rounded"><option value="activo">Visible</option><option value="oculto">Oculto</option></select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" required placeholder="Título" value={cont.titulo} onChange={e=>setCont({...cont, titulo: e.target.value})} className="p-2 border rounded" />
                        <input type="url" required placeholder="URL (Enlace)" value={cont.url} onChange={e=>setCont({...cont, url: e.target.value})} className="p-2 border rounded" />
                    </div>
                    <div className="flex justify-end"><button type="submit" className="bg-[#003b5c] text-white px-6 py-2 rounded">Añadir</button></div>
                  </form>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                 <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Publicado</h3>
                 {['mes1','mes2','mes3'].map(mes => (
                    <div key={mes} className="mb-4">
                      <h4 className="font-bold uppercase bg-gray-100 p-2 rounded text-sm">{mes}</h4>
                      {['cultura_fisica', 'nutricion'].map(cat => {
                        const items = db.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'];
                        return items.length > 0 ? (
                          <div key={cat} className="ml-4 mt-2">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase">{cat.replace('_', ' ')}</h5>
                            <ul className="space-y-2 mt-1">
                              {items.map((it:any) => (
                                <li key={it.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-sm">
                                  <a href={it.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center">
                                    {it.estado === 'activo' ? <Eye className="w-4 h-4 text-green-500 mr-2"/> : <EyeOff className="w-4 h-4 text-gray-400 mr-2"/>}
                                    {it.titulo}
                                  </a>
                                  <div className="space-x-2">
                                    <button onClick={()=>{
                                      const newDb = {...db}; 
                                      const target = newDb.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'].find((x:any)=>x.id===it.id);
                                      if(target) target.estado = target.estado === 'activo' ? 'oculto' : 'activo';
                                      saveDB(newDb);
                                    }} className="text-xs bg-gray-200 px-2 py-1 rounded">Alternar</button>
                                    <button onClick={()=>{
                                      const newDb = {...db}; 
                                      newDb.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'] = newDb.content[mes as keyof typeof db.content][cat as 'cultura_fisica'|'nutricion'].filter((x:any)=>x.id!==it.id);
                                      saveDB(newDb);
                                    }} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null;
                      })}
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

// Simple helper component for Admin Sidebar
function SidebarBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active ? 'text-[#003b5c] bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>
      <span className="w-5">{icon}</span> <span>{label}</span>
    </button>
  );
}

function StudentView({ db, saveDB, user, onLogout, showToast }: any) {
  const [tab, setTab] = useState<'registro' | 'contenido' | 'evolucion'>('registro');
  const [fase, setFase] = useState('inicial');
  const [showSurvey, setShowSurvey] = useState(false);

  return (
    <div className="flex w-full h-full relative">
      {/* Sidebar Student */}
      <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0 z-10">
        <div className="p-4 md:p-6 flex items-center justify-center md:justify-start space-x-3 border-b border-gray-100">
          <div className="bg-[#cda036] text-white p-2 rounded-lg"><UserCheck className="w-6 h-6"/></div>
          <div className="hidden md:block overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 truncate">{user.name}</h2>
            <p className="text-xs text-gray-500 truncate">{user.id}</p>
          </div>
        </div>
        <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto">
          <SidebarBtn active={tab === 'registro'} onClick={() => setTab('registro')} icon={<ClipboardList/>} label="Registro" />
          <SidebarBtn active={tab === 'contenido'} onClick={() => setTab('contenido')} icon={<PlayCircle/>} label="Contenido" />
          <SidebarBtn active={tab === 'evolucion'} onClick={() => setTab('evolucion')} icon={<PieChart/>} label="Evolución" />
          
          {db.settings.surveyEnabled && (
            <div className="pt-4 border-t border-gray-100 mt-4">
              <button onClick={() => setShowSurvey(true)} className="w-full flex items-center justify-center md:justify-start space-x-3 px-4 py-3 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                 <Stethoscope className="w-5 h-5 animate-pulse"/> <span className="hidden md:inline">Expediente Clínico</span>
              </button>
            </div>
          )}
        </nav>
        <div className="p-2 md:p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center justify-center md:justify-start space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
            <LogOut className="w-5 h-5"/> <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            {tab === 'registro' ? 'Registro de Evaluación' : tab === 'contenido' ? 'Recursos Educativos' : 'Mi Evolución y Logros'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative no-scrollbar">
          {tab === 'registro' && <StudentRegistro db={db} saveDB={saveDB} user={user} fase={fase} setFase={setFase} showToast={showToast}/>}
          {tab === 'contenido' && <StudentContenido db={db} showToast={showToast}/>}
          {tab === 'evolucion' && <StudentEvolucion db={db} user={user}/>}
        </div>
      </main>

      {/* Modal Survey */}
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
    showToast(`Evaluación de ${fase} guardada. Datos bloqueados.`);
    if(fase === 'inicial') showToast('🏆 Trofeo: Primer Paso Desbloqueado!', 'success');
  };

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-2">
        {['inicial', 'mes1', 'mes2', 'mes3'].map(f => (
          <button key={f} onClick={() => setFase(f)} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap capitalize ${fase === f ? 'border-[#003b5c] text-[#003b5c]' : 'border-transparent text-gray-500'}`}>{f}</button>
        ))}
      </div>

      {isReadOnly && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 text-sm flex">
          <Info className="w-5 h-5 mr-2 flex-shrink-0"/> <p>Estás viendo datos completados. Son de solo lectura.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Formulario simplificado visualmente para mantener tamaño de código */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Datos Base</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div><label className="block text-xs mb-1">Sexo</label>
               <select name="sexo" required disabled={isReadOnly} value={form.sexo||''} onChange={handleChange} className="w-full p-2 border rounded text-sm disabled:bg-gray-100"><option value="">Select...</option><option value="masculino">Masc</option><option value="femenino">Fem</option></select>
             </div>
             <Input disabled={isReadOnly} label="Edad" name="edad" type="number" val={form.edad} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Peso (kg)" name="peso" type="number" step="0.1" val={form.peso} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Talla (cm)" name="talla" type="number" val={form.talla} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Cintura (cm)" name="cintura" type="number" val={form.cintura} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Cadera (cm)" name="cadera" type="number" val={form.cadera} onChange={handleChange} />
             <Input disabled={isReadOnly} label="% Grasa" name="grasa" type="number" step="0.1" val={form.grasa} onChange={handleChange} />
             <Input disabled={isReadOnly} label="% Músculo" name="musculo" type="number" step="0.1" val={form.musculo} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Grasa Visceral" name="visceral" type="number" val={form.visceral} onChange={handleChange} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Pruebas Físicas</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <Input disabled={isReadOnly} label="Ruffier P0" name="p0" type="number" val={form.p0} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Ruffier P1" name="p1" type="number" val={form.p1} onChange={handleChange} />
             <Input disabled={isReadOnly} label="Ruffier P2" name="p2" type="number" val={form.p2} onChange={handleChange} />
             <Input disabled={isReadOnly} label="T. Superior (Reps)" name="trensup" type="number" val={form.trensup} onChange={handleChange} />
             <Input disabled={isReadOnly} label="T. Inferior (Reps)" name="treninf" type="number" val={form.treninf} onChange={handleChange} />
           </div>
        </div>

        {isReadOnly && savedData && (
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003b5c]">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Resultados Clínicos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
               {(()=>{
                 const res = analizarEvaluacionCompleta(savedData);
                 return (
                   <>
                    <ResBox label="IMC" val={res.imc.valor} cl={res.imc.clasificacion} />
                    <ResBox label="ICC" val={res.icc.valor} cl={res.icc.clasificacion} />
                    <ResBox label="% Grasa" val={savedData.grasa} cl={res.grasa} />
                    <ResBox label="% Músculo" val={savedData.musculo} cl={res.musculo} />
                    <ResBox label="G. Visceral" val={savedData.visceral} cl={res.visceral} />
                    <ResBox label="Ruffier" val={res.ruffier.valor} cl={res.ruffier.clasificacion} />
                    <ResBox label="Fuerza Sup." val={savedData.trensup} cl={res.superior} />
                    <ResBox label="Fuerza Inf." val={savedData.treninf} cl={res.inferior} />
                   </>
                 )
               })()}
            </div>
          </div>
        )}

        {!isReadOnly && (
          <div className="flex justify-end pt-4"><button type="submit" className="bg-[#003b5c] text-white px-8 py-3 rounded-xl hover:bg-[#005587] font-bold shadow-lg">Guardar Evaluación</button></div>
        )}
      </form>
    </div>
  );
}

function Input({label, name, val, onChange, disabled, type, step}: any) {
  return <div>
    <label className="block text-xs mb-1 text-gray-600">{label}</label>
    <input name={name} type={type} step={step} required disabled={disabled} value={val||''} onChange={onChange} className="w-full p-2 border rounded text-sm disabled:bg-gray-100 disabled:text-gray-500" />
  </div>;
}

function ResBox({label, val, cl}: any) {
  return <div className="p-2 bg-gray-50 rounded border">
    <span className="block text-xs text-gray-500">{label}</span>
    <span className="font-bold">{val}</span> <span className={`block text-xs ${colorClass(cl)} font-medium`}>{cl}</span>
  </div>;
}

function StudentContenido({ db, showToast }: any) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {['mes1', 'mes2', 'mes3'].map(mes => {
        const cf = db.content[mes as keyof typeof db.content].cultura_fisica.filter((i:any) => i.estado==='activo');
        const nu = db.content[mes as keyof typeof db.content].nutricion.filter((i:any) => i.estado==='activo');
        if(cf.length===0 && nu.length===0) return null;

        return (
          <div key={mes} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#003b5c] px-6 py-3"><h3 className="text-white font-bold uppercase">{mes.replace('mes', 'Fase Mes ')}</h3></div>
            <div className="p-6 space-y-6">
              {cf.length > 0 && <div>
                <h4 className="flex items-center text-[#005587] font-bold mb-4 border-b pb-2"><Dumbbell className="w-5 h-5 mr-2"/> Cultura Física</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cf.map((it:any) => <ContentCard key={it.id} item={it} color="blue" showToast={showToast} />)}
                </div>
              </div>}
              {nu.length > 0 && <div>
                <h4 className="flex items-center text-green-600 font-bold mb-4 border-b pb-2"><HeartPulse className="w-5 h-5 mr-2"/> Nutrición</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nu.map((it:any) => <ContentCard key={it.id} item={it} color="green" showToast={showToast} />)}
                </div>
              </div>}
            </div>
          </div>
        )
      })}
    </div>
  );
}

function ContentCard({ item, color, showToast }: any) {
  const isBlue = color === 'blue';
  return (
    <a href={item.url} target="_blank" rel="noreferrer" onClick={()=>{
      if(!sessionStorage.getItem('vistoVideo')) {
        setTimeout(() => showToast('🏆 Trofeo Desbloqueado: Estudioso!', 'success'), 2000);
        sessionStorage.setItem('vistoVideo', 'true');
      }
    }} className={`block p-4 border rounded-xl hover:shadow-md transition group ${isBlue ? 'border-blue-100 bg-blue-50/30' : 'border-green-100 bg-green-50/30'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg shadow-sm"><Youtube className={`w-5 h-5 ${isBlue ? 'text-red-500' : 'text-green-500'}`}/></div>
          <span className="font-medium text-gray-800">{item.titulo}</span>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400"/>
      </div>
    </a>
  );
}

function StudentEvolucion({ db, user }: any) {
  const evals = db.evaluations[user.id] || {};
  const data = useMemo(() => {
    const arr = [];
    for(const fase of ['inicial', 'mes1', 'mes2', 'mes3']) {
      if(evals[fase]) {
        const d = evals[fase];
        const res = analizarEvaluacionCompleta(d);
        arr.push({
          name: fase.toUpperCase(),
          imc: parseFloat(res.imc.valor), peso: parseFloat(d.peso),
          grasa: parseFloat(d.grasa), musculo: parseFloat(d.musculo),
          ruffier: parseFloat(res.ruffier.valor),
          trensup: parseFloat(d.trensup), treninf: parseFloat(d.treninf)
        });
      }
    }
    return arr;
  }, [evals]);

  // Gamification Logic
  const isEstudioso = sessionStorage.getItem('vistoVideo') === 'true';
  const l = data.length;
  const t1 = l > 0;
  const t2 = l > 1;
  const t3 = l > 1 && (data[l-1].trensup > data[0].trensup || data[l-1].treninf > data[0].treninf);
  const t4 = l > 1 && (data[l-1].ruffier < data[0].ruffier); // Ruffier menor es mejor
  const t5 = isEstudioso;
  const t6 = t1 && t2 && t3 && t4 && t5; // Platino
  
  const trophies = [
    { id: 't1', icon: <Star/>, name: 'Primer Paso', desc: 'Fase Inicial', unl: t1, c: 'text-green-400' },
    { id: 't2', icon: <Activity/>, name: 'Constancia', desc: 'Registro Mes 1', unl: t2, c: 'text-orange-400' },
    { id: 't3', icon: <Dumbbell/>, name: 'Fuerza Bruta', desc: 'Mejorar reps', unl: t3, c: 'text-purple-400' },
    { id: 't4', icon: <HeartPulse/>, name: 'Corazón Hierro', desc: 'Mejorar Ruffier', unl: t4, c: 'text-red-400' },
    { id: 't5', icon: <BookOpen/>, name: 'Estudioso', desc: 'Ver contenido', unl: t5, c: 'text-blue-400' },
    { id: 't6', icon: <Crown/>, name: 'Leyenda Activa', desc: 'Todos los trofeos', unl: t6, c: 'text-yellow-200' },
  ];
  const unlockedCount = trophies.filter(t=>t.unl).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003b5c] to-[#005587] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center">
        <div><h2 className="text-2xl font-bold">{user.name}</h2><p className="text-blue-100">{user.unidad} | {user.id}</p></div>
        <div className="mt-4 md:mt-0 bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/30 text-center">
          <p className="text-sm font-medium text-blue-100 uppercase">Fases Registradas</p>
          <p className="text-2xl font-bold mt-1">{l} / 4</p>
        </div>
      </div>

      {/* Charts */}
      {l > 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Análisis Visual</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <ChartWrapper title="Composición Básica (IMC / Peso)" data={data} lines={[{k:'imc', c:'#005587'},{k:'peso', c:'#cda036'}]} />
             <ChartWrapper title="Grasa vs Músculo (%)" data={data} lines={[{k:'grasa', c:'#ef4444'},{k:'musculo', c:'#10b981'}]} />
             <ChartWrapper title="Fuerza (Repeticiones)" data={data} lines={[{k:'trensup', c:'#8b5cf6'},{k:'treninf', c:'#f59e0b'}]} />
             <ChartWrapper title="Índice Ruffier Dickson" data={data} lines={[{k:'ruffier', c:'#3b82f6'}]} />
          </div>
        </div>
      ) : (
        <div className="text-center p-10 bg-white rounded-xl border"><p className="text-gray-500">Registra tu fase inicial para ver gráficas de evolución.</p></div>
      )}

      {/* Gamification */}
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div><h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#cda036] to-yellow-200 uppercase tracking-wider mb-2">Vitrina de Logros</h3></div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Colección: {unlockedCount} / 6</p>
            <div className="w-32 bg-gray-700 h-2 rounded-full overflow-hidden">
               <div className="bg-[#cda036] h-full transition-all duration-1000" style={{width: `${(unlockedCount/6)*100}%`}}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
          {trophies.map((t) => (
             <div key={t.id} className={`bg-gray-800 border border-gray-700 rounded-xl p-4 text-center transition-all ${t.unl ? 'transform hover:scale-105 shadow-[0_0_15px_rgba(205,160,54,0.3)]' : 'opacity-50 grayscale'}`}>
               <div className={`h-12 flex justify-center items-center mb-2 ${t.unl ? t.c : 'text-gray-500'}`}>{React.cloneElement(t.icon as React.ReactElement, { size: 32 })}</div>
               <h4 className="font-bold text-sm leading-tight mb-1">{t.name}</h4>
               <p className="text-[10px] text-gray-400">{t.desc}</p>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartWrapper({title, data, lines}: any) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-64 flex flex-col">
      <h4 className="text-center text-sm font-medium text-gray-600 mb-2">{title}</h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 10}} tickMargin={10} />
            <YAxis tick={{fontSize: 10}} />
            <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
            <Legend wrapperStyle={{fontSize: '10px'}} />
            {lines.map((l:any) => <Line key={l.k} type="monotone" dataKey={l.k} stroke={l.c} strokeWidth={2} activeDot={{ r: 6 }} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SurveyModal({ db, saveDB, user, onClose, showToast }: any) {
  const savedData = db.surveys[user.id];
  const [form, setForm] = useState(savedData || {});
  
  const handleChange = (e:any) => setForm({...form, [e.target.name]: e.target.value});
  
  const handleSubmit = (e:any) => {
    e.preventDefault();
    const newDb = {...db};
    newDb.surveys[user.id] = form;
    saveDB(newDb);
    showToast("Expediente clínico guardado y bloqueado.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex justify-center items-center backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center"><Stethoscope className="mr-2"/> Expediente Clínico</h2>
          <button onClick={onClose} className="text-white hover:text-green-200 text-2xl">&times;</button>
        </div>
        
        {savedData && (
           <div className="bg-blue-50 p-4 text-blue-800 text-sm text-center border-b border-blue-100 flex justify-center items-center">
             <CheckCircle className="w-4 h-4 mr-2"/> Datos enviados. Solo lectura.
           </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <SurveySection title="I. Salud Clínica">
               <SInput n="cronica" l="Condición Crónica" ph="Asma, Ninguna" f={form} c={handleChange} d={!!savedData} />
               <SInput n="dolor" l="Dolor/Lesiones" ph="Rodilla, Ninguno" f={form} c={handleChange} d={!!savedData} />
               <SInput n="meds" l="Medicamentos" ph="Uso frecuente" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
             <SurveySection title="II. Objetivos y Actividad">
               <SInput n="objetivo" l="Objetivo principal" ph="Bajar peso, salud" f={form} c={handleChange} d={!!savedData} />
               <SInput n="actividad" l="Nivel actividad" ph="Sedentario, activo" f={form} c={handleChange} d={!!savedData} />
               <SInput n="atractivas" l="Actividades preferidas" ph="Correr, pesas" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
             <SurveySection title="III. Entrenamiento">
               <SInput n="tiempo" l="Tiempo disponible" ph="1 hora diaria" f={form} c={handleChange} d={!!savedData} />
               <SInput n="lugar" l="Lugar de entreno" ph="Casa, gimnasio" f={form} c={handleChange} d={!!savedData} />
               <SInput n="obstaculo" l="Mayor obstáculo" ph="Tiempo, pereza" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
             <SurveySection title="IV. Estilo de Vida">
               <SInput n="sueno" l="Calidad sueño" ph="Buena (7h)" f={form} c={handleChange} d={!!savedData} />
               <SInput n="energia" l="Nivel energía" ph="Alto, fluctuante" f={form} c={handleChange} d={!!savedData} />
               <SInput n="motivacion" l="Motivación" ph="Estética, salud" f={form} c={handleChange} d={!!savedData} />
             </SurveySection>
          </div>
          {!savedData && (
            <div className="flex justify-end pt-4 border-t">
              <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-bold shadow-lg">Enviar Expediente</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SurveySection({title, children}:any) {
  return <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
    <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 text-sm">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>;
}

function SInput({n, l, ph, f, c, d}:any) {
  return <div>
    <label className="text-xs text-gray-600 mb-1 block">{l}</label>
    <input name={n} required disabled={d} placeholder={ph} value={f[n]||''} onChange={c} className="w-full p-2 border rounded text-sm disabled:bg-gray-200 disabled:text-gray-500" />
  </div>;
}

export default App;