/**
 * Tipos para o Sistema de Gerenciamento de Demandas (Android/PWA)
 */

export type DemandMainType = 'Obras' | 'Logistica';

export type ObrasSubtype =
  | 'Podas'
  | 'Telhado'
  | 'Elétrica'
  | 'Armazenamento hídrico'
  | 'Muros'
  | 'Rachaduras'
  | 'Infiltrações'
  | 'Banheiros'
  | 'Adaptações'
  | 'Outros';

export type LogisticaSubtype =
  | 'Desinsetização'
  | 'Areia'
  | 'Parques'
  | 'Segurança Monitorada'
  | 'Outros';

export type DemandPriority = 'Alta' | 'Média' | 'Baixa';

export type DemandStatus = 'Pendente' | 'Em andamento' | 'Concluído';

export interface DemandPhoto {
  id: string;
  dataUrl: string; // Base64 data URL
  name: string;
  createdAt: string;
}

export interface DemandItem {
  id: string;
  unitId: string;
  unitName: string;
  type: DemandMainType;
  subtype: string; // ObrasSubtype | LogisticaSubtype | custom string
  isCustomSubtype?: boolean;
  priority: DemandPriority;
  status: DemandStatus;
  description: string;
  locationDetails?: string; // ex: Pátio, Bloco B, Sala 4
  photos: DemandPhoto[]; // até 4 fotos
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolutionNotes?: string;
}

export interface Unit {
  id: string;
  name: string;
  code?: string;
  region?: string;
  address?: string;
  contactName?: string;
  phone?: string;
  createdAt: string;
}

export interface UnitRecord {
  unit: Unit;
  demands: DemandItem[];
  lastUpdated: string;
}

export interface ReportFilterOptions {
  unitId?: string; // 'ALL' or specific unit ID
  type?: 'ALL' | DemandMainType;
  subtype?: string; // 'ALL' or specific subtype like 'Podas', 'Telhado', 'Desinsetização'
  status?: 'ALL' | DemandStatus;
  priority?: 'ALL' | DemandPriority;
  startDate?: string;
  endDate?: string;
  includePhotosInPdf?: boolean;
}

export const OBRAS_SUBTYPES: ObrasSubtype[] = [
  'Podas',
  'Telhado',
  'Elétrica',
  'Armazenamento hídrico',
  'Muros',
  'Rachaduras',
  'Infiltrações',
  'Banheiros',
  'Adaptações',
  'Outros',
];

export const LOGISTICA_SUBTYPES: LogisticaSubtype[] = [
  'Desinsetização',
  'Areia',
  'Parques',
  'Segurança Monitorada',
  'Outros',
];
