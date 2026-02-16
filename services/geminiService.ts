import { GoogleGenAI } from "@google/genai";
import { WoundData, DeviceInfo, TipoHerida, Ubicacion, ExudadoCantidad } from "../types";

const SYSTEM_INSTRUCTION_WOUND = `
Actúa como un Enfermero Especialista en Manejo de Heridas. Genera una nota técnica SIN CREATIVIDAD.
ESTRUCTURA:
1. Tipo de Herida, 2. Ubicación.
Desarrollo: Estado apósito, Aspecto, Tamaño, Exudado (Cantidad/Calidad), %, Edema, EVA, Piel.
Manejo: Limpieza (Solución mediante Método), Apósito Primario, Secundario.
Información adicional: [Solo si se proporciona]
Próxima curación: [Dato]
`;

const SYSTEM_INSTRUCTION_DEVICE = `
Actúa como un Enfermero Especialista en Cuidados Críticos. Tu tarea es generar una nota de evolución técnica para la "Curación y Mantención de Dispositivos Invasivos".

REGLAS CRÍTICAS:
1. CERO CREATIVIDAD: Solo usa los datos entregados.
2. FORMATO LIMPIO: Usa guiones simples (-) para cada dispositivo.
3. PREFIJO OBLIGATORIO: Cada dispositivo debe comenzar exactamente así: "- [Nombre Dispositivo], Se realiza curación."
4. SIN MARKDOWN: NO utilices asteriscos (*), ni negritas (**), ni ningún otro símbolo de formato markdown. La salida debe ser texto plano limpio.
5. FILTRADO DINÁMICO: Si un campo viene vacío o no es proporcionado, NO lo menciones en la nota final.
6. TERMINOLOGÍA: Usa términos técnicos de enfermería (indemne, permeable, sin signos de flebitis, etc.).

ESTRUCTURA POR DISPOSITIVO:

- Si es CVC, MidLine, PiccLine o Línea Arterial:
  Prefijo: "- [Tipo], Se realiza curación."
  Luego: Ubicación, Signos de infección (SÍ/NO y cuáles), Salida de contenido (Características), Estado de la fijación y tipo de apósito.
  PARA CVC/MIDLINE/PICCLINE: Incluir obligatoriamente la permeabilidad de cada lumen (especificando nombre y estado: Infunde, Refluye, Sellado).
  PARA LÍNEA ARTERIAL: Especificar si el dispositivo es Arteriofix o Bránula e incluir permeabilidad del lumen (Infunde o Infunde y refluye).

- Si es Traqueotomía (TQT):
  Prefijo: "- TQT, Se realiza curación."
  Luego: Signos de infección en estoma, Salida de contenido, Presencia de granulomas (ubicación específica), estado de la fijación.

- Si es Curación Simple (VVP):
  Prefijo: "- VVP, Se realiza curación."
  Luego: Ubicación, signos de flebitis o extravasación, permeabilidad.

- Si es un dispositivo personalizado (Otro):
  Mencionar el nombre del dispositivo proporcionado y listar solo los hallazgos que tengan información (Ubicación, Infección, Fijación, Contenido, Apósito). OMITIR campos vacíos.

ESTRUCTURA FINAL DE LA NOTA:
"PROCEDIMIENTO: Mantención y Curación de Dispositivos Invasivos.
[Lista de dispositivos detallados]
Información adicional: [Si se proporciona]
Próxima curación: [Fecha/Turno]"
`;

export const generateWoundNote = async (data: WoundData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const tipoFinal = data.tipoHerida === TipoHerida.Otro ? data.tipoHeridaOtro : data.tipoHerida;
  let ubicacionFinal = data.ubicacion === Ubicacion.Otro ? data.ubicacionOtro : data.ubicacion;
  if (data.ubicacion.includes('D/I') && data.lateralidad) {
    ubicacionFinal = ubicacionFinal.replace('D/I', data.lateralidad);
  }

  const prompt = `
    Tipo: ${tipoFinal}
    ${data.tipoHerida === TipoHerida.HeridaQuirurgica ? `Dehiscencia: ${data.dehiscencia ? 'SÍ' : 'NO'}` : ''}
    Ubicación: ${ubicacionFinal}
    Puntos: ${data.presenciaPuntos ? `SÍ (${data.tipoPuntos})` : "NO"}
    Apósito anterior: ${data.estadoAposito}
    Aspecto: ${data.aspecto.join(", ")}
    Tamaño: ${data.tamano}
    Cantidad Exudado: ${data.exudadoCantidad}
    Calidad Exudado: ${data.exudadoCantidad === ExudadoCantidad.SinExudado ? 'N/A' : data.exudadoCalidad}
    % Granul: ${data.porcentajeGranulatorio}, % Esfac: ${data.porcentajeEsfacelo}, % Necr: ${data.porcentajeNecrotico}
    Edema: ${data.edema}, EVA: ${data.eva}
    Piel: ${data.pielCircundante.join(", ")}
    Limpieza: ${data.limpiezaSolucion} mediante ${data.limpiezaMetodo}
    Apósito Prim: ${data.apositoPrimario.join(", ")}, Sec: ${data.apositoSecundario.join(", ")}
    Información Adicional: ${data.informacionAdicional || 'N/A'}
    Próxima: ${data.proximaCuracion}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION_WOUND, temperature: 0 },
    });
    return response.text?.trim() || "Error.";
  } catch (error) { return "Error de conexión."; }
};

export const generateDeviceNote = async (devices: DeviceInfo[], nextDate: string, extraInfo: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `
    DISPOSITIVOS A EVALUAR:
    ${devices.map(d => {
      const isOtro = d.tipo === 'Otro';
      const signs = Array.isArray(d.signosInfeccion) ? d.signosInfeccion.join(', ') : d.signosInfeccion;
      const dressingFinal = d.aposito === 'Otro' ? d.apositoOtro : d.aposito;
      
      let lumensStr = '';
      if (d.lumens && d.lumens.length > 0) {
        lumensStr = '\nPERMEABILIDAD LÚMENES: ' + d.lumens.map(l => `${l.nombre || 'Lumen'}: ${l.estado}`).join('; ');
      }

      const infoTipoArterial = d.tipo === 'Línea Arterial' ? `\nINSUMO: ${d.tipoLineaArterial || 'Arteriofix'}` : '';

      return `
      - TIPO: ${isOtro ? (d.tipoOtro || 'Dispositivo Genérico') : d.tipo}${infoTipoArterial}
      - HALLAZGO: Se realiza curación.
      - UBICACIÓN: ${d.ubicacion || (d.tipo === 'TQT' ? 'Pericanular' : '')}
      - SIGNOS INFECCIÓN: ${signs}
      - CONTENIDO/DÉBITO: ${d.contenido}
      - FIJACIÓN: ${d.fijacion}
      - APÓSITO: ${dressingFinal} ${lumensStr}
      ${d.tipo === 'TQT' ? `- ESTOMA: ${d.estoma}, GRANULOMA: ${d.granuloma} ${d.granulomaHora ? `(Hora ${d.granulomaHora})` : ''}` : ''}
      ${d.tipo === 'VVP' ? `- FLEBITIS: ${d.flebitis}, PERMEABILIDAD: ${d.permeabilidad ? 'SÍ' : 'NO'}` : ''}
      `.split('\n').filter(line => line.trim() !== '' && !line.includes(':  ') && !line.endsWith(': ')).join('\n');
    }).join('\n')}
    INFORMACIÓN ADICIONAL LIBRE: ${extraInfo || 'N/A'}
    PRÓXIMA CURACIÓN: ${nextDate || "Según protocolo institucional (7 días o SOS)"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION_DEVICE, temperature: 0 },
    });
    return response.text?.trim() || "Error.";
  } catch (error) { return "Error de conexión."; }
};