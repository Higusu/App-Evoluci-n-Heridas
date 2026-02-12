
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
      // Reset lateralidad if location doesn't support it
      if (field === 'ubicacion' && typeof value === 'string' && !value.includes('D/I')) {
        newState.lateralidad = '';
      }
      // Reset tipoPuntos if presenciaPuntos is false
      if (field === 'presenciaPuntos' && value === false) {
        newState.tipoPuntos = '';
      }
      return newState;
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    const note = await generateWoundNote(data);
    setGeneratedNote(note);
    setLoading(false);
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column: Form */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 lg:p-8 space-y-6 lg:overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <IconStethoscope />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">WoundCare Pro</h1>
          </div>
          <p className="text-slate-500">Gestión avanzada de curaciones y generación de notas clínicas.</p>
        </header>

        <FormSection title="Clasificación" icon={<IconMapPin />}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Tipo de Herida</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(TipoHerida).map(type => (
                  <button
                    key={type}
                    onClick={() => handleSelectOne('tipoHerida', type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      data.tipoHerida === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {data.tipoHerida === TipoHerida.Otro && (
                <input
                  type="text"
                  name="tipoHeridaOtro"
                  value={data.tipoHeridaOtro}
                  onChange={handleInputChange}
                  placeholder="Especifique tipo de herida..."
                  className="mt-3 w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Ubicación</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Ubicacion).map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleSelectOne('ubicacion', loc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
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
                  className="mt-3 w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              )}

              {data.ubicacion.includes('D/I') && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Lateralidad</label>
                  <div className="flex gap-2">
                    {['Derecha', 'Izquierda'].map(side => (
                      <button
                        key={side}
                        onClick={() => handleSelectOne('lateralidad', side)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all border ${
                          data.lateralidad === side 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                            : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        {side === 'Derecha' ? 'Derecha (Der)' : 'Izquierda (Izq)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Evaluación del Apósito y Herida" icon={<IconClipboard />}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Estado del Apósito Anterior</label>
              <input
                type="text"
                name="estadoAposito"
                value={data.estadoAposito}
                onChange={handleInputChange}
                placeholder="Ej: Desprendido, seco, saturado seroso..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">¿Posee puntos de sutura?</label>
                <button
                  onClick={() => handleSelectOne('presenciaPuntos', !data.presenciaPuntos)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.presenciaPuntos ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.presenciaPuntos ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {data.presenciaPuntos && (
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                  {['Seda', 'Corchetes'].map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => handleSelectOne('tipoPuntos', tipo)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        data.tipoPuntos === tipo 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tamaño Actual (cm)</label>
                <input
                  type="text"
                  name="tamano"
                  value={data.tamano}
                  onChange={handleInputChange}
                  placeholder="Ej: 3x2 cm"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dolor (EVA 0-10)</label>
                <input
                  type="number"
                  name="eva"
                  min="0"
                  max="10"
                  value={data.eva}
                  onChange={handleInputChange}
                  placeholder="0-10"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Lecho de la Herida">
          <MultiSelect
            label="Aspecto Predominante"
            options={Object.values(Aspecto)}
            selected={data.aspecto}
            onChange={(val) => setData(prev => ({ ...prev, aspecto: val }))}
          />
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">% Granulatorio</label>
              <input type="number" name="porcentajeGranulatorio" value={data.porcentajeGranulatorio} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">% Esfacelo</label>
              <input type="number" name="porcentajeEsfacelo" value={data.porcentajeEsfacelo} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">% Necrótico</label>
              <input type="number" name="porcentajeNecrotico" value={data.porcentajeNecrotico} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Exudado y Edema">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Calidad</label>
              <select name="exudadoCalidad" value={data.exudadoCalidad} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white">
                <option value="">Seleccione...</option>
                {Object.values(ExudadoCalidad).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cantidad</label>
              <select name="exudadoCantidad" value={data.exudadoCantidad} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white">
                <option value="">Seleccione...</option>
                {Object.values(ExudadoCantidad).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Edema</label>
            <input
              type="text"
              name="edema"
              value={data.edema}
              onChange={handleInputChange}
              placeholder="Ej: No presenta, (+), leve maleolar..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </FormSection>

        <FormSection title="Piel Circundante">
          <MultiSelect
            label="Condición de la Piel"
            options={Object.values(PielCircundante)}
            selected={data.pielCircundante}
            onChange={(val) => setData(prev => ({ ...prev, pielCircundante: val }))}
          />
        </FormSection>

        <FormSection title="Manejo de Curación">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Limpieza / Lavado</label>
              <input type="text" name="limpieza" value={data.limpieza} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
            </div>
            
            <MultiSelect
              label="Apósito Primario (Activo)"
              options={Object.values(ApositoPrimario)}
              selected={data.apositoPrimario}
              onChange={(val) => setData(prev => ({ ...prev, apositoPrimario: val }))}
            />

            <MultiSelect
              label="Apósito Secundario"
              options={Object.values(ApositoSecundario)}
              selected={data.apositoSecundario}
              onChange={(val) => setData(prev => ({ ...prev, apositoSecundario: val }))}
            />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Frecuencia / Próxima Curación</label>
              <input type="text" name="proximaCuracion" value={data.proximaCuracion} onChange={handleInputChange} placeholder="Ej: En 72 horas, diario, 3 días..." className="w-full px-4 py-2 rounded-lg border border-slate-200" />
            </div>
          </div>
        </FormSection>

        <div className="flex gap-4 sticky bottom-4 bg-slate-50 py-4 border-t border-slate-200 z-10">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span> : <IconMagic />}
            Generar Evolución
          </button>
          <button
            onClick={handleReset}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="lg:w-96 xl:w-[450px] bg-white border-l border-slate-200 flex flex-col h-[500px] lg:h-screen lg:sticky lg:top-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <IconClipboard />
            Nota de Evolución
          </h2>
          {generatedNote && (
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                copying ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copying ? '¡Copiado!' : 'Copiar'}
            </button>
          )}
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          {generatedNote ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-sm lg:text-base select-text">
                {generatedNote}
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-8">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <IconMagic />
              </div>
              <p className="text-sm font-medium">Complete la evaluación clínica</p>
              <p className="text-xs mt-2">La IA generará una nota técnica precisa y formateada lista para copiar a la ficha clínica.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
