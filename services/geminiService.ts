
import { GoogleGenAI } from "@google/genai";
import { WoundData, TipoHerida, Ubicacion } from "../types";

const SYSTEM_INSTRUCTION = `
Actúa como un Enfermero Especialista en Manejo de Heridas. Tu objetivo es generar una nota de evolución técnica, precisa y SIN CREATIVIDAD. Solo usa los datos proporcionados.

ESTRUCTURA DE ENCABEZADO:
1. Tipo de Herida: [Dato]
2. Ubicación: [Dato]

ESTRUCTURA DE DESARROLLO (Estricta):
"Se realiza curación avanzada por enfermería y presenta:
Estado del apósito: [Dato]
Características de la herida:
- Aspecto: [Dato]
- Tamaño en cm: [Dato]
- Presencia de exudado calidad y cantidad: [Calidad] / [Cantidad]
- % tejido granulatorio: [Dato]%
- % tejido esfacelo: [Dato]%
- % tejido necrotico: [Dato]%
- Presencia de edema: [Dato]
- Dolor (valoración EVA): [Dato]/10
- Características piel circundante: [Dato]
[Si hay dehiscencia en herida quirúrgica, agregar: - Presencia de dehiscencia: Sí]
[Si hay puntos, agregar una línea: - Presencia de puntos: (Seda o Corchetes)]

Manejo:
- Limpieza: [Dato]
- Apósito Primario (Activo): [Dato]
- Apósito Secundario: [Dato]

Fecha de próxima curación: [Dato]"

REGLAS DE ORO:
- CERO CREATIVIDAD. No inventes datos ni adjetivos.
- Si un campo no tiene información, pon "No evaluado".
- Mantén el formato estricto solicitado. No agregues introducciones ni despedidas.
- Si NO hay puntos de sutura indicados, NO los menciones en la evolución.
- Si NO es una herida quirúrgica con dehiscencia, NO menciones dehiscencia.
- Usa terminología técnica basada estrictamente en el input.
`;

export const generateWoundNote = async (data: WoundData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Logic to process the type and location strings
  const tipoFinal = data.tipoHerida === TipoHerida.Otro ? data.tipoHeridaOtro : data.tipoHerida;
  
  let ubicacionFinal = data.ubicacion === Ubicacion.Otro ? data.ubicacionOtro : data.ubicacion;
  if (data.ubicacion.includes('D/I') && data.lateralidad) {
    ubicacionFinal = ubicacionFinal.replace('D/I', data.lateralidad);
  }

  const prompt = `
    DATOS PARA LA NOTA:
    Tipo de Herida: ${tipoFinal || "No evaluado"}
    ${data.tipoHerida === TipoHerida.HeridaQuirurgica ? `Presenta Dehiscencia: ${data.dehiscencia ? 'SÍ' : 'NO'}` : ''}
    Ubicación: ${ubicacionFinal || "No evaluado"}
    Presencia de puntos: ${data.presenciaPuntos ? `SÍ (${data.tipoPuntos})` : "NO"}
    Estado del apósito anterior: ${data.estadoAposito || "No evaluado"}
    Aspecto observado: ${data.aspecto.join(", ") || "No evaluado"}
    Tamaño actual: ${data.tamano || "No evaluado"}
    Calidad de Exudado: ${data.exudadoCalidad || "No evaluado"}
    Cantidad de Exudado: ${data.exudadoCantidad || "No evaluado"}
    % Granulatorio: ${data.porcentajeGranulatorio || "0"}
    % Esfacelo: ${data.porcentajeEsfacelo || "0"}
    % Necrótico: ${data.porcentajeNecrotico || "0"}
    Edema: ${data.edema || "No evaluado"}
    EVA: ${data.eva || "No evaluado"}
    Piel Circundante: ${data.pielCircundante.join(", ") || "No evaluado"}
    Mecanismo de Limpieza: ${data.limpieza || "No evaluado"}
    Apósito Primario: ${data.apositoPrimario.join(", ") || "No evaluado"}
    Apósito Secundario: ${data.apositoSecundario.join(", ") || "No evaluado"}
    Próxima Curación Programada: ${data.proximaCuracion || "No evaluado"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0, 
      },
    });

    return response.text?.trim() || "Error al generar la nota.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error de conexión con el servicio de IA.";
  }
};
