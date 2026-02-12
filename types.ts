
export interface WoundData {
  tipoHerida: string;
  tipoHeridaOtro: string;
  ubicacion: string;
  ubicacionOtro: string;
  lateralidad: 'Derecha' | 'Izquierda' | '';
  presenciaPuntos: boolean;
  tipoPuntos: 'Seda' | 'Corchetes' | '';
  estadoAposito: string;
  aspecto: string[];
  tamano: string;
  exudadoCalidad: string;
  exudadoCantidad: string;
  porcentajeGranulatorio: string;
  porcentajeEsfacelo: string;
  porcentajeNecrotico: string;
  edema: string;
  eva: string;
  pielCircundante: string[];
  limpieza: string;
  apositoPrimario: string[];
  apositoSecundario: string[];
  proximaCuracion: string;
}

export enum TipoHerida {
  LPPI = 'LPP Grado I',
  LPPII = 'LPP Grado II',
  LPPIII = 'LPP Grado III',
  LPPIV = 'LPP Grado IV',
  UlceraVenosa = 'Úlcera Venosa',
  UlceraArterial = 'Úlcera Arterial',
  PieDiabetico = 'Pie Diabético',
  HeridaQuirurgica = 'Herida Quirúrgica / Dehiscencia',
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
  Escaso = 'Escaso',
  Moderado = 'Moderado',
  Abundante = 'Abundante'
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
