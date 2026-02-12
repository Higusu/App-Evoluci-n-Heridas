
export interface WoundData {
  tipoHerida: string;
  tipoHeridaOtro: string;
  dehiscencia: boolean;
  ubicacion: string;
  ubicacionOtro: string;
  lateralidad: 'Derecha' | 'Izquierda' | '';
  presenciaPuntos: boolean;
  tipoPuntos: 'Seda' | 'Corchetes' | '';
  estadoAposito: string;
  aspecto: string[];
  tamano: string;
  exudadoCantidad: string;
  exudadoCalidad: string;
  porcentajeGranulatorio: string;
  porcentajeEsfacelo: string;
  porcentajeNecrotico: string;
  edema: string;
  eva: string;
  pielCircundante: string[];
  limpiezaSolucion: string;
  limpiezaMetodo: string;
  apositoPrimario: string[];
  apositoSecundario: string[];
  proximaCuracion: string;
}

export type DeviceType = 'CVC' | 'Línea Arterial' | 'TQT' | 'VVP';

export interface DeviceInfo {
  id: string;
  tipo: DeviceType;
  ubicacion: string;
  signosInfeccion: string;
  contenido: string;
  fijacion: string;
  aposito: string;
  // TQT specific
  estoma?: string;
  granuloma?: string;
  granulomaHora?: string;
  // VVP specific
  flebitis?: string;
  permeabilidad?: boolean;
}

export enum TipoHerida {
  LPPI = 'LPP Grado I',
  LPPII = 'LPP Grado II',
  LPPIIII = 'LPP Grado III',
  LPPIV = 'LPP Grado IV',
  UlceraVenosa = 'Úlcera Venosa',
  UlceraArterial = 'Úlcera Arterial',
  PieDiabetico = 'Pie Diabético',
  HeridaQuirurgica = 'Herida Quirúrgica',
  Dermatitis = 'Dermatitis asociada a incontinencia',
  Otro = 'Otro'
}

export enum Ubicacion {
  Sacro = 'Región Sacra',
  Isquion = 'Isquion D/I',
  Trocanter = 'Trocánter D/I',
  Talon = 'Talón D/I',
  Maleolo = 'Maléolo D/I',
  Planta = 'Planta pie',
  Abdomen = 'Abdomen',
  Gluteo = 'Glúteo D/I',
  Dorso = 'Dorso',
  Otro = 'Otro'
}

export enum Aspecto {
  Granulatorio = 'Granulatorio',
  Esfacelado = 'Esfacelado',
  Necrotico = 'Necrótico',
  Epitelizacion = 'Epitelización',
  Infectado = 'Infectado'
}

export enum ExudadoCalidad {
  Seroso = 'Seroso',
  Hematico = 'Hemático',
  Serosanguinolento = 'Serosanguinolento',
  Turbio = 'Turbio',
  Purulento = 'Purulento'
}

export enum ExudadoCantidad {
  SinExudado = 'Sin exudado',
  Escaso = 'Escaso',
  Moderado = 'Moderado',
  Abundante = 'Abundante'
}

export enum LimpiezaSolucion {
  Limpiador = 'Limpiador de Heridas',
  Suero = 'Suero fisiológico'
}

export enum LimpiezaMetodo {
  Duchoterapia = 'Duchoterapia',
  Jeringa = 'Limpieza con jeringa y aguja',
  Gasa = 'Gasa/tórula estéril'
}

export enum PielCircundante {
  Sana = 'Sana',
  Eritematosa = 'Eritematosa',
  Macerada = 'Macerada',
  Descamada = 'Descamada',
  Pigmentada = 'Pigmentada',
  Eczematosa = 'Eczematosa'
}

export enum ApositoPrimario {
  Hidrogel = 'Hidrogel',
  GasaParafinada = 'Gasa Parafinada',
  CarbonPlata = 'Carbón plata',
  AlginatoCalcio = 'Alginato de Calcio',
  Pasivo = 'Pasivo'
}

export enum ApositoSecundario {
  Pasivo = 'Apósito Pasivo',
  Vendaje = 'Vendaje',
  Fixomull = 'Fixomull'
}
