
import { GoogleGenAI } from "@google/genai";
import { WoundData, DeviceInfo, TipoHerida, Ubicacion, ExudadoCantidad } from "../types";

const SYSTEM_INSTRUCTION_WOUND = `
Actúa como un Enfermero Especialista en Manejo de Heridas. Genera una nota técnica SIN CREATIVIDAD.
ESTRUCTURA:
1. Tipo de Herida, 2. Ubicación.
Desarrollo: Estado apósito, Aspecto, Tamaño, Exudado (Cantidad/Calidad), %, Edema, EVA, Piel.
Manejo: Limpieza (Solución mediante Método), Apósito Primario, Secundario.
Próxima curación: [Dato]
`;

const SYSTEM_INSTRUCTION_DEVICE = `
Actúa como un Enfermero Especialista en Cuidados Críticos. Tu tarea es generar una nota de evolución técnica para la "Curación y Mantención de Dispositivos Invasivos".
REGLAS: CERO CREATIVIDAD, FORMATO LIMPIO (viñetas), TERMINOLOGÍA TÉCNICA (indemne, eritematoso, etc.).
ESTRUCTURA POR DISPOSITIVO:
- CVC/Línea Arterial: Ubicación, Signos infección (SÍ/NO), Contenido, Fijación (puntos), Apósito.
- TQT: Signos infección estoma, Contenido, Granulomas (ubicación reloj), estado cánula/fijación.
- VVP: Ubicación, signos flebitis/extravasación, permeabilidad.
FORMATO DE SALIDA:
"PROCEDIMIENTO: Mantención y Curación de Dispositivos Invasivos.
[Lista de dispositivos]
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

export const generateDeviceNote = async (devices: DeviceInfo[], nextDate: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `
    DISPOSITIVOS A EVALUAR:
    ${devices.map(d => `
      - TIPO: ${d.tipo}
      - UBICACIÓN: ${d.ubicacion}
      - SIGNOS INFECCIÓN: ${d.signosInfeccion}
      - CONTENIDO/DÉBITO: ${d.contenido}
      - FIJACIÓN: ${d.fijacion}
      - APÓSITO: ${d.aposito}
      ${d.tipo === 'TQT' ? `- ESTOMA: ${d.estoma}, GRANULOMA: ${d.granuloma} ${d.granulomaHora ? `(Hora ${d.granulomaHora})` : ''}` : ''}
      ${d.tipo === 'VVP' ? `- FLEBITIS: ${d.flebitis}, PERMEABILIDAD: ${d.permeabilidad ? 'SÍ' : 'NO'}` : ''}
    `).join('\n')}
    PRÓXIMA CURACIÓN: ${nextDate || "Según protocolo"}
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
