
import React, { useState, useCallback } from 'react';
import { 
  TipoHerida, Ubicacion, Aspecto, ExudadoCalidad, ExudadoCantidad, 
  LimpiezaSolucion, LimpiezaMetodo, PielCircundante, ApositoPrimario, 
  ApositoSecundario, WoundData, DeviceInfo, DeviceType 
} from './types';
import { generateWoundNote, generateDeviceNote } from './services/geminiService';
import { FormSection } from './components/FormSection';
import { MultiSelect } from './components/MultiSelect';

const IconWound = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
const IconDevice = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h12"/><path d="M12 2v16"/><path d="m9 15 3 3 3-3"/><path d="m15 5-3-3-3 3"/></svg>;
const IconMagic = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const INITIAL_WOUND: WoundData = {
  tipoHerida: '', tipoHeridaOtro: '', dehiscencia: false, ubicacion: '', ubicacionOtro: '',
  lateralidad: '', presenciaPuntos: false, tipoPuntos: '', estadoAposito: '', aspecto: [],
  tamano: '', exudadoCantidad: '', exudadoCalidad: '', porcentajeGranulatorio: '0',
  porcentajeEsfacelo: '0', porcentajeNecrotico: '0', edema: '', eva: '', pielCircundante: [],
  limpiezaSolucion: LimpiezaSolucion.Suero, limpiezaMetodo: LimpiezaMetodo.Gasa,
  apositoPrimario: [], apositoSecundario: [], proximaCuracion: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'wound' | 'device'>('wound');
  const [woundData, setWoundData] = useState<WoundData>(INITIAL_WOUND);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [deviceNextDate, setDeviceNextDate] = useState('');
  const [generatedNote, setGeneratedNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  // Wound handlers
  const handleWoundChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWoundData(prev => ({ ...prev, [name]: value }));
  };

  const handleWoundSelect = (field: keyof WoundData, value: any) => {
    setWoundData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'exudadoCantidad' && value === ExudadoCantidad.SinExudado) newState.exudadoCalidad = '';
      return newState;
    });
  };

  // Device handlers
  const addDevice = () => {
    const newDevice: DeviceInfo = {
      id: Math.random().toString(36).substr(2, 9),
      tipo: 'CVC', ubicacion: '', signosInfeccion: 'Sin signos',
      contenido: 'Seco', fijacion: 'Indemne con puntos', aposito: 'Tegaderm (Transparente)',
      estoma: 'Sano', granuloma: 'No presenta', permeabilidad: true, flebitis: 'Sin signos'
    };
    setDevices([...devices, newDevice]);
  };

  const updateDevice = (id: string, field: keyof DeviceInfo, value: any) => {
    setDevices(devices.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDevice = (id: string) => setDevices(devices.filter(d => d.id !== id));

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const note = activeTab === 'wound' 
        ? await generateWoundNote(woundData) 
        : await generateDeviceNote(devices, deviceNextDate);
      setGeneratedNote(note);
    } catch (err) { alert("Error al generar."); }
    setLoading(false);
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedNote);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }, [generatedNote]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 bg-slate-900 flex flex-row lg:flex-col py-4 lg:py-8 px-4 gap-4 z-50 overflow-x-auto lg:overflow-x-visible">
        <div className="hidden lg:flex items-center gap-3 mb-8 px-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <IconMagic />
          </div>
          <span className="text-white font-black tracking-tighter text-xl">WoundCare+</span>
        </div>
        
        <button 
          onClick={() => setActiveTab('wound')}
          className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-4 rounded-xl transition-all font-black text-xs uppercase tracking-wider ${activeTab === 'wound' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <IconWound />
          <span>Curación Avanzada</span>
        </button>
        <button 
          onClick={() => setActiveTab('device')}
          className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-4 rounded-xl transition-all font-black text-xs uppercase tracking-wider ${activeTab === 'device' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <IconDevice />
          <span>Curación de Dispositivo</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Form Column */}
        <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto bg-slate-50">
          <header className="mb-6">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {activeTab === 'wound' ? 'Curación Avanzada' : 'Curación de Dispositivo'}
            </h1>
            <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full"></div>
          </header>

          {activeTab === 'wound' ? (
            <div className="animate-in fade-in slide-in-from-left duration-300 space-y-6">
              <FormSection title="Clasificación">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Tipo de Herida</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(TipoHerida).map(t => (
                      <button key={t} onClick={() => handleWoundSelect('tipoHerida', t)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${woundData.tipoHerida === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>{t}</button>
                    ))}
                  </div>
                  {woundData.tipoHerida === TipoHerida.Otro && (
                    <input 
                      type="text" 
                      name="tipoHeridaOtro" 
                      value={woundData.tipoHeridaOtro} 
                      onChange={handleWoundChange} 
                      placeholder="Especifique tipo de herida..." 
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm animate-in fade-in" 
                    />
                  )}

                  {/* Sección de Puntos de Sutura */}
                  <div className="mt-2 p-4 bg-slate-100 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase">¿Presenta Puntos de Sutura?</span>
                      <span className="text-[10px] text-slate-500 font-medium">Cierres mecánicos o manuales</span>
                    </div>
                    <div className="flex gap-2">
                      {[true, false].map(v => (
                        <button 
                          key={String(v)} 
                          onClick={() => handleWoundSelect('presenciaPuntos', v)} 
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all ${woundData.presenciaPuntos === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-100'}`}
                        >
                          {v ? 'SÍ' : 'NO'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {woundData.presenciaPuntos && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between animate-in slide-in-from-top-2">
                      <span className="text-xs font-black text-blue-700 uppercase">Tipo de Puntos</span>
                      <div className="flex gap-2">
                        {['Seda', 'Corchetes'].map(tp => (
                          <button 
                            key={tp} 
                            onClick={() => handleWoundSelect('tipoPuntos', tp)} 
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all ${woundData.tipoPuntos === tp ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-blue-500 border-blue-200 hover:bg-blue-100'}`}
                          >
                            {tp.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {woundData.tipoHerida === TipoHerida.HeridaQuirurgica && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center shadow-inner">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-blue-700 uppercase">¿Presenta Dehiscencia?</span>
                        <span className="text-[10px] text-blue-600 font-medium">Apertura espontánea de los bordes</span>
                      </div>
                      <div className="flex gap-2">
                        {[true, false].map(v => <button key={String(v)} onClick={() => handleWoundSelect('dehiscencia', v)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all ${woundData.dehiscencia === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-100'}`}>{v ? 'SÍ' : 'NO'}</button>)}
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Localización Anatómica">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Ubicación</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Ubicacion).map(u => (
                      <button key={u} onClick={() => handleWoundSelect('ubicacion', u)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${woundData.ubicacion === u ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>{u}</button>
                    ))}
                  </div>
                  
                  {woundData.ubicacion === Ubicacion.Otro && (
                    <input 
                      type="text" 
                      name="ubicacionOtro" 
                      value={woundData.ubicacionOtro} 
                      onChange={handleWoundChange} 
                      placeholder="Especifique ubicación..." 
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm animate-in fade-in" 
                    />
                  )}

                  {woundData.ubicacion.includes('D/I') && (
                    <div className="mt-2 p-3 bg-slate-100 rounded-xl flex items-center justify-between border border-slate-200">
                      <span className="text-xs font-black text-slate-600 uppercase">Lateralidad</span>
                      <div className="flex gap-2">
                        {['Derecha', 'Izquierda'].map(l => (
                          <button 
                            key={l} 
                            onClick={() => handleWoundSelect('lateralidad', l)} 
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all ${woundData.lateralidad === l ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'}`}
                          >
                            {l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Evaluación del Lecho">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Dimensiones (cm)</label>
                    <input type="text" name="tamano" value={woundData.tamano} onChange={handleWoundChange} placeholder="Ej: 10 x 2 cm" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Dolor EVA (0-10)</label>
                    <input type="number" name="eva" value={woundData.eva} onChange={handleWoundChange} placeholder="0 al 10" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>
                
                <MultiSelect label="Aspecto" options={Object.values(Aspecto)} selected={woundData.aspecto} onChange={(v) => handleWoundSelect('aspecto', v)} />
                
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Distribución del Tejido (%)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Granulatorio</label>
                      <div className="relative">
                        <input type="number" name="porcentajeGranulatorio" value={woundData.porcentajeGranulatorio} onChange={handleWoundChange} className="w-full pr-6 pl-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none" min="0" max="100" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Esfacelado</label>
                      <div className="relative">
                        <input type="number" name="porcentajeEsfacelo" value={woundData.porcentajeEsfacelo} onChange={handleWoundChange} className="w-full pr-6 pl-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none" min="0" max="100" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Necrótico</label>
                      <div className="relative">
                        <input type="number" name="porcentajeNecrotico" value={woundData.porcentajeNecrotico} onChange={handleWoundChange} className="w-full pr-6 pl-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none" min="0" max="100" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Cantidad Exudado</label>
                    <select name="exudadoCantidad" value={woundData.exudadoCantidad} onChange={handleWoundChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
                      <option value="">Seleccione...</option>
                      {Object.values(ExudadoCantidad).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  {woundData.exudadoCantidad !== ExudadoCantidad.SinExudado && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Calidad Exudado</label>
                      <select name="exudadoCalidad" value={woundData.exudadoCalidad} onChange={handleWoundChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
                        <option value="">Seleccione...</option>
                        {Object.values(ExudadoCalidad).map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Plan de Manejo">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Solución Limpieza</label>
                    <select name="limpiezaSolucion" value={woundData.limpiezaSolucion} onChange={handleWoundChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
                      {Object.values(LimpiezaSolucion).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Método Limpieza</label>
                    <select name="limpiezaMetodo" value={woundData.limpiezaMetodo} onChange={handleWoundChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
                      {Object.values(LimpiezaMetodo).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <MultiSelect label="Apósito Primario (Capa Activa)" options={Object.values(ApositoPrimario)} selected={woundData.apositoPrimario} onChange={(v) => handleWoundSelect('apositoPrimario', v)} />
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Próxima Curación</label>
                  <input type="text" name="proximaCuracion" value={woundData.proximaCuracion} onChange={handleWoundChange} placeholder="Fecha o Turno" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </FormSection>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-4">
              {devices.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border-2 border-dashed border-slate-200 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <IconPlus />
                  </div>
                  <h3 className="text-lg font-black text-slate-700 uppercase tracking-tighter">Sin dispositivos agregados</h3>
                  <p className="text-slate-500 text-sm mt-1">Presione el botón inferior para añadir un nuevo dispositivo invasivo.</p>
                </div>
              ) : (
                devices.map((device, index) => (
                  <div key={device.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative group transition-all hover:shadow-md">
                    <button onClick={() => removeDevice(device.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <IconTrash />
                    </button>
                    
                    <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-3">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-md">{index + 1}</span>
                      {device.tipo === 'Otro' ? (device.tipoOtro || 'DISPOSITIVO PERSONALIZADO').toUpperCase() : device.tipo.toUpperCase()}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tipo Selector */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Categoría</label>
                        <div className="flex flex-wrap gap-1">
                          {['CVC', 'Línea Arterial', 'TQT', 'VVP', 'Otro'].map(t => (
                            <button key={t} onClick={() => updateDevice(device.id, 'tipo', t as any)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all ${device.tipo === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}>{t}</button>
                          ))}
                        </div>
                      </div>

                      {/* --- LÓGICA DINÁMICA DE CAMPOS --- */}
                      
                      {device.tipo === 'Otro' ? (
                        /* MODO TEXTO LIBRE (OTRO) */
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre del Dispositivo</label>
                            <input type="text" value={device.tipoOtro || ''} onChange={(e) => updateDevice(device.id, 'tipoOtro', e.target.value)} placeholder="Ej: Drenaje Jackson-Pratt" className="w-full px-3 py-2.5 rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ubicación Anatómica</label>
                            <input type="text" value={device.ubicacion} onChange={(e) => updateDevice(device.id, 'ubicacion', e.target.value)} placeholder="Ej: Flanco derecho" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Signos Infección / Estado Local</label>
                            <input type="text" value={device.signosInfeccion} onChange={(e) => updateDevice(device.id, 'signosInfeccion', e.target.value)} placeholder="Ej: Sin signos inflamatorios" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fijación / Estabilidad</label>
                            <input type="text" value={device.fijacion} onChange={(e) => updateDevice(device.id, 'fijacion', e.target.value)} placeholder="Ej: Suturado a piel" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contenido / Débito</label>
                            <input type="text" value={device.contenido} onChange={(e) => updateDevice(device.id, 'contenido', e.target.value)} placeholder="Ej: Escaso serohemático" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tipo de Apósito</label>
                            <input type="text" value={device.aposito} onChange={(e) => updateDevice(device.id, 'aposito', e.target.value)} placeholder="Ej: Gasa y tela" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
                          </div>
                        </>
                      ) : (
                        /* MODO PREDEFINIDO */
                        <>
                          {device.tipo !== 'TQT' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ubicación Anatómica</label>
                              <input type="text" value={device.ubicacion} onChange={(e) => updateDevice(device.id, 'ubicacion', e.target.value)} placeholder="Ej: Yugular Interno Der..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                          )}
                          {device.tipo === 'TQT' && (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estado Estoma</label>
                                <div className="flex gap-1">
                                  {['Sano', 'Eritematoso', 'Macerado'].map(s => <button key={s} onClick={() => updateDevice(device.id, 'estoma', s)} className={`flex-1 py-2 rounded-lg text-[10px] font-black border-2 transition-all ${device.estoma === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-600 border-slate-200'}`}>{s}</button>)}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Granuloma (Posición Reloj)</label>
                                <div className="flex gap-2 items-center">
                                  <select value={device.granuloma} onChange={(e) => updateDevice(device.id, 'granuloma', e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                                    <option value="No presenta">No presenta</option>
                                    <option value="Presenta">Presenta</option>
                                  </select>
                                  {device.granuloma === 'Presenta' && (
                                    <select value={device.granulomaHora} onChange={(e) => updateDevice(device.id, 'granulomaHora', e.target.value)} className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                                      {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                          {device.tipo === 'VVP' && (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Signos Flebitis/Extravasación</label>
                                <input type="text" value={device.flebitis} onChange={(e) => updateDevice(device.id, 'flebitis', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="Sin signos..." />
                              </div>
                              <div className="space-y-2 flex flex-col">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Permeable?</label>
                                <button onClick={() => updateDevice(device.id, 'permeabilidad', !device.permeabilidad)} className={`py-2 rounded-xl font-black text-xs border-2 transition-all ${device.permeabilidad ? 'bg-green-600 border-green-600 text-white' : 'bg-red-600 border-red-600 text-white'}`}>{device.permeabilidad ? 'SÍ (Permeable)' : 'NO (Obstruida)'}</button>
                              </div>
                            </>
                          )}
                          {(device.tipo === 'CVC' || device.tipo === 'Línea Arterial') && (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Signos Infección</label>
                                <select value={device.signosInfeccion} onChange={(e) => updateDevice(device.id, 'signosInfeccion', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                                  <option>Sin signos</option><option>Eritema</option><option>Calor local</option><option>Sensibilidad</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fijación Mecánica</label>
                                <select value={device.fijacion} onChange={(e) => updateDevice(device.id, 'fijacion', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                                  <option>Indemne con puntos</option><option>Punto suelto</option><option>Fijación reforzada</option>
                                </select>
                              </div>
                            </>
                          )}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contenido / Débito</label>
                            <select value={device.contenido} onChange={(e) => updateDevice(device.id, 'contenido', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                              <option>Seco</option><option>Seroso</option><option>Escaso Seroso</option><option>Hemático</option><option>Purulento</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tipo Apósito</label>
                            <select value={device.aposito} onChange={(e) => updateDevice(device.id, 'aposito', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                              {device.tipo === 'TQT' ? (
                                <><option>Gasa</option><option>Hipoalergénico</option></>
                              ) : (
                                <><option>Tegaderm (Transparente)</option><option>Gasa y tela</option><option>Hipoalergénico</option></>
                              )}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}

              <button onClick={addDevice} className="w-full py-5 rounded-2xl border-2 border-dashed border-blue-300 text-blue-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-sm">
                <IconPlus /> AGREGAR DISPOSITIVO
              </button>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Programación de Próxima Curación</label>
                <input type="text" value={deviceNextDate} onChange={(e) => setDeviceNextDate(e.target.value)} placeholder="Ej: Protocolo institucional (7 días o SOS)" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex gap-4 sticky bottom-0 bg-slate-50 py-4 z-10">
            <button
              onClick={handleGenerate}
              disabled={loading || (activeTab === 'device' && devices.length === 0)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? <div className="animate-spin border-4 border-white border-t-transparent rounded-full w-5 h-5"></div> : <IconMagic />}
              GENERAR NOTA TÉCNICA
            </button>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:w-[500px] bg-white border-l border-slate-200 flex flex-col h-[500px] lg:h-auto lg:sticky lg:top-0 shadow-2xl z-40">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="font-black text-slate-800 text-lg uppercase tracking-tighter">Evolución Generada</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vista previa clínica</span>
            </div>
            {generatedNote && (
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  copying ? 'bg-green-600 text-white shadow-lg' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-95'
                }`}
              >
                {copying ? <IconCheck /> : null}
                {copying ? 'COPIADO ✓' : 'COPIAR NOTA'}
              </button>
            )}
          </div>
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
            {generatedNote ? (
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-500 ring-1 ring-slate-200">
                <pre className="whitespace-pre-wrap font-mono text-slate-800 leading-relaxed text-[15px] select-all">
                  {generatedNote}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-12">
                <div className="p-8 bg-white rounded-full mb-6 shadow-md border border-slate-100 animate-pulse">
                  <IconMagic />
                </div>
                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Esperando datos</h4>
                <p className="text-xs leading-relaxed max-w-[200px]">Complete el formulario y presione generar para obtener la nota clínica técnica.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 text-center">
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Herramienta de Apoyo Profesional • Enfermería 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
