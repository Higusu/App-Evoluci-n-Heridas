
import React, { useState, useCallback } from 'react';
import { 
  TipoHerida,
  Ubicacion,
  Aspecto, 
  ExudadoCalidad, 
  ExudadoCantidad, 
  PielCircundante, 
  ApositoPrimario, 
  ApositoSecundario, 
  WoundData 
} from './types';
import { generateWoundNote } from './services/geminiService';
import { FormSection } from './components/FormSection';
import { MultiSelect } from './components/MultiSelect';

const IconClipboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
const IconStethoscope = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2h0a2 2 0 0 0-2 2v12a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h0a.3.3 0 1 0 .2.3"/><path d="M9 16V2"/><path d="M15 16V2"/><path d="M8 2h8"/><path d="M3 19h18"/></svg>;
const IconMagic = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

const INITIAL_STATE: WoundData = {
  tipoHerida: '',
  tipoHeridaOtro: '',
  dehiscencia: false,
  ubicacion: '',
  ubicacionOtro: '',
  lateralidad: '',
  presenciaPuntos: false,
  tipoPuntos: '',
  estadoAposito: '',
  aspecto: [],
  tamano: '',
  exudadoCalidad: '',
  exudadoCantidad: '',
  porcentajeGranulatorio: '0',
  porcentajeEsfacelo: '0',
  porcentajeNecrotico: '0',
  edema: '',
  eva: '',
  pielCircundante: [],
  limpieza: 'Suero Fisiológico',
  apositoPrimario: [],
  apositoSecundario: [],
  proximaCuracion: '',
};

export default function App() {
  const [data, setData] = useState<WoundData>(INITIAL_STATE);
  const [generatedNote, setGeneratedNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copying, setCopying] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectOne = (field: keyof WoundData, value: string | boolean) => {
    setData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'ubicacion' && typeof value === 'string' && !value.includes('D/I')) {
        newState.lateralidad = '';
      }
      if (field === 'presenciaPuntos' && value === false) {
        newState.tipoPuntos = '';
      }
      if (field === 'tipoHerida' && value !== TipoHerida.HeridaQuirurgica) {
        newState.dehiscencia = false;
      }
      return newState;
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const note = await generateWoundNote(data);
      setGeneratedNote(note);
    } catch (err) {
      console.error(err);
      alert("Error al generar la nota. Por favor, reintente.");
    } finally {
      setLoading(false);
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de borrar todos los datos del paciente actual?')) {
      setData(INITIAL_STATE);
      setGeneratedNote('');
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedNote);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }, [generatedNote]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Column: Form */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 lg:p-8 space-y-6 lg:overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg">
              <IconStethoscope />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">WoundCare Pro</h1>
          </div>
          <p className="text-slate-500 font-medium">Gestión avanzada de curaciones y generación de notas clínicas.</p>
        </header>

        <FormSection title="Clasificación" icon={<IconMapPin />}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Tipo de Herida</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(TipoHerida).map(type => (
                  <button
                    key={type}
                    onClick={() => handleSelectOne('tipoHerida', type)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      data.tipoHerida === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              {data.tipoHerida === TipoHerida.HeridaQuirurgica && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between shadow-inner">
                  <div>
                    <label className="text-sm font-bold text-blue-700">Dehiscencia</label>
                    <p className="text-xs text-blue-600">¿La herida presenta apertura espontánea?</p>
                  </div>
                  <div className="flex gap-2">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => handleSelectOne('dehiscencia', val)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all border ${
                          data.dehiscencia === val 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {val ? 'SÍ' : 'NO'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {data.tipoHerida === TipoHerida.Otro && (
                <input
                  type="text"
                  name="tipoHeridaOtro"
                  value={data.tipoHeridaOtro}
                  onChange={handleInputChange}
                  placeholder="Especifique tipo de herida..."
                  className="mt-4 w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Ubicación Anatómica</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Ubicacion).map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleSelectOne('ubicacion', loc)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      data.ubicacion === loc ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              
              {data.ubicacion === Ubicacion.Otro && (
                <input
                  type="text"
                  name="ubicacionOtro"
                  value={data.ubicacionOtro}
                  onChange={handleInputChange}
                  placeholder="Especifique ubicación..."
                  className="mt-4 w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm"
                />
              )}

              {data.ubicacion.includes('D/I') && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-inner">
                  <label className="block text-xs font-black text-indigo-700 uppercase tracking-widest mb-3">Lateralidad Requerida</label>
                  <div className="flex gap-3">
                    {['Derecha', 'Izquierda'].map(side => (
                      <button
                        key={side}
                        onClick={() => handleSelectOne('lateralidad', side as any)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all border-2 ${
                          data.lateralidad === side 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105' 
                            : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        {side === 'Derecha' ? 'DERECHA (Der)' : 'IZQUIERDA (Izq)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Evaluación Clínica" icon={<IconClipboard />}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Estado del Apósito Anterior</label>
              <input
                type="text"
                name="estadoAposito"
                value={data.estadoAposito}
                onChange={handleInputChange}
                placeholder="Ej: Saturado con contenido seroso, desprendido..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-700">Sutura (Puntos)</label>
                  <p className="text-xs text-slate-500">¿La herida presenta puntos de sutura?</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectOne('presenciaPuntos', !data.presenciaPuntos)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${data.presenciaPuntos ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${data.presenciaPuntos ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {data.presenciaPuntos && (
                <div className="pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-2">
                    {['Seda', 'Corchetes'].map(tipo => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => handleSelectOne('tipoPuntos', tipo as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all border-2 ${
                          data.tipoPuntos === tipo 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50'
                        }`}
                      >
                        {tipo.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dimensiones (cm)</label>
                <input
                  type="text"
                  name="tamano"
                  value={data.tamano}
                  onChange={handleInputChange}
                  placeholder="Ej: 5 x 3 cm"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dolor (EVA 0-10)</label>
                <input
                  type="number"
                  name="eva"
                  min="0"
                  max="10"
                  value={data.eva}
                  onChange={handleInputChange}
                  placeholder="Escala visual análoga"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Lecho de la Herida">
          <MultiSelect
            label="Aspecto Predominante (Selección Múltiple)"
            options={Object.values(Aspecto)}
            selected={data.aspecto}
            onChange={(val) => setData(prev => ({ ...prev, aspecto: val }))}
          />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter">% Granulatorio</label>
              <input type="number" name="porcentajeGranulatorio" value={data.porcentajeGranulatorio} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter">% Esfacelo</label>
              <input type="number" name="porcentajeEsfacelo" value={data.porcentajeEsfacelo} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter">% Necrótico</label>
              <input type="number" name="porcentajeNecrotico" value={data.porcentajeNecrotico} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Exudado y Edema">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Calidad</label>
              <select name="exudadoCalidad" value={data.exudadoCalidad} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccione calidad...</option>
                {Object.values(ExudadoCalidad).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad</label>
              <select name="exudadoCantidad" value={data.exudadoCantidad} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccione cantidad...</option>
                {Object.values(ExudadoCantidad).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Evaluación de Edema</label>
            <input
              type="text"
              name="edema"
              value={data.edema}
              onChange={handleInputChange}
              placeholder="Ej: Fovea (+), leve, no presenta..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        </FormSection>

        <FormSection title="Piel Circundante">
          <MultiSelect
            label="Condición de la Piel Perilesional"
            options={Object.values(PielCircundante)}
            selected={data.pielCircundante}
            onChange={(val) => setData(prev => ({ ...prev, pielCircundante: val }))}
          />
        </FormSection>

        <FormSection title="Plan de Manejo">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Procedimiento de Limpieza</label>
              <input type="text" name="limpieza" value={data.limpieza} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <MultiSelect
              label="Apósito Primario (Capa Activa)"
              options={Object.values(ApositoPrimario)}
              selected={data.apositoPrimario}
              onChange={(val) => setData(prev => ({ ...prev, apositoPrimario: val }))}
            />

            <MultiSelect
              label="Apósito Secundario (Protección/Fijación)"
              options={Object.values(ApositoSecundario)}
              selected={data.apositoSecundario}
              onChange={(val) => setData(prev => ({ ...prev, apositoSecundario: val }))}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Programación Próxima Curación</label>
              <input type="text" name="proximaCuracion" value={data.proximaCuracion} onChange={handleInputChange} placeholder="Ej: En 48 horas, según necesidad..." className="w-full px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </FormSection>

        <div className="flex gap-4 sticky bottom-4 bg-slate-50/80 backdrop-blur-sm py-4 border-t border-slate-200 z-20">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? <span className="animate-spin border-4 border-white border-t-transparent rounded-full w-6 h-6"></span> : <IconMagic />}
            GENERAR NOTA TÉCNICA
          </button>
          <button
            onClick={handleReset}
            title="Limpiar paciente"
            className="bg-white border-2 border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="lg:w-[450px] bg-white border-l border-slate-200 flex flex-col h-[500px] lg:h-screen lg:sticky lg:top-0 shadow-2xl z-30">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
            <IconClipboard />
            Nota de Evolución
          </h2>
          {generatedNote && (
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                copying ? 'bg-green-600 text-white shadow-md' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copying ? 'COPIADO ✓' : 'COPIAR'}
            </button>
          )}
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/30">
          {generatedNote ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-in zoom-in-95 duration-300">
              <pre className="whitespace-pre-wrap font-mono text-slate-800 leading-relaxed text-sm lg:text-[15px] select-all">
                {generatedNote}
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-12">
              <div className="p-6 bg-white rounded-full mb-6 shadow-sm">
                <IconMagic />
              </div>
              <p className="text-sm font-black text-slate-500 uppercase mb-2">Vista previa vacía</p>
              <p className="text-xs leading-relaxed">Complete el formulario de la izquierda y presione el botón <span className="font-bold text-blue-600">Generar</span> para crear la nota clínica bajo estándares internacionales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
