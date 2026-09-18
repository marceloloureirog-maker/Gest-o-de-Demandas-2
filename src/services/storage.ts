import { DemandItem, DemandPriority, DemandStatus, Unit, UnitRecord } from '../types';

const STORAGE_KEY_UNITS = 'gestao_demandas_units_v1';
const STORAGE_KEY_DEMANDS = 'gestao_demandas_items_v1';

// Initial default units for educational / municipal facilities context
const INITIAL_UNITS: Unit[] = [
  {
    id: 'unit-1',
    name: 'Escola Municipal Paulo Freire',
    code: 'EMP-01',
    region: 'Regional Norte',
    address: 'Rua das Palmeiras, 450',
    contactName: 'Diretora Mariana Silva',
    phone: '(41) 98822-1001',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'unit-2',
    name: 'CMEI Jardim das Flores',
    code: 'CMEI-04',
    region: 'Regional Sul',
    address: 'Av. Brasil, 1200',
    contactName: 'Coord. Carlos Alberto',
    phone: '(41) 99133-2045',
    createdAt: '2026-02-10T09:30:00.000Z',
  },
  {
    id: 'unit-3',
    name: 'Escola Municipal Tiradentes',
    code: 'EMT-08',
    region: 'Regional Leste',
    address: 'Rua Sete de Setembro, 88',
    contactName: 'Diretora Fernanda Souza',
    phone: '(41) 98765-4321',
    createdAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'unit-4',
    name: 'Almoxarifado Central & Logística',
    code: 'ALM-01',
    region: 'Sede Administrativa',
    address: 'Rodovia Municipal km 4',
    contactName: 'Gerente Roberto Dias',
    phone: '(41) 99200-8811',
    createdAt: '2026-03-01T07:45:00.000Z',
  },
];

// Sample demands to provide an immediate active working state
const INITIAL_DEMANDS: DemandItem[] = [
  {
    id: 'dem-101',
    unitId: 'unit-1',
    unitName: 'Escola Municipal Paulo Freire',
    type: 'Obras',
    subtype: 'Telhado',
    priority: 'Alta',
    status: 'Em andamento',
    description: 'Telhas quebradas sobre o bloco pedagógico B após fortes chuvas, goteiras no corredor das salas 5 e 6.',
    locationDetails: 'Bloco B - Corredor superior',
    photos: [],
    createdAt: '2026-09-10T14:30:00.000Z',
    updatedAt: '2026-09-12T09:15:00.000Z',
  },
  {
    id: 'dem-102',
    unitId: 'unit-1',
    unitName: 'Escola Municipal Paulo Freire',
    type: 'Logistica',
    subtype: 'Desinsetização',
    priority: 'Média',
    status: 'Pendente',
    description: 'Dedetização preventiva semestral do refeitório e despensa de alimentos.',
    locationDetails: 'Cozinha e refeitório',
    photos: [],
    createdAt: '2026-09-14T11:00:00.000Z',
    updatedAt: '2026-09-14T11:00:00.000Z',
  },
  {
    id: 'dem-103',
    unitId: 'unit-2',
    unitName: 'CMEI Jardim das Flores',
    type: 'Logistica',
    subtype: 'Areia',
    priority: 'Alta',
    status: 'Em andamento',
    description: 'Substituição e higienização periódica da areia do parque infantil e tanque de recreação dos bebês.',
    locationDetails: 'Parque externo frontal',
    photos: [],
    createdAt: '2026-09-11T16:20:00.000Z',
    updatedAt: '2026-09-15T08:45:00.000Z',
  },
  {
    id: 'dem-104',
    unitId: 'unit-2',
    unitName: 'CMEI Jardim das Flores',
    type: 'Obras',
    subtype: 'Banheiros',
    priority: 'Média',
    status: 'Concluído',
    description: 'Vazamento reparado na válvula de descarga do sanitário infantil feminino.',
    locationDetails: 'Banheiro infantil 02',
    resolutionNotes: 'Troca do reparo da descarga e teste de vedação concluídos com sucesso.',
    photos: [],
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-08T15:30:00.000Z',
    completedAt: '2026-09-08T15:30:00.000Z',
  },
  {
    id: 'dem-105',
    unitId: 'unit-3',
    unitName: 'Escola Municipal Tiradentes',
    type: 'Obras',
    subtype: 'Podas',
    priority: 'Alta',
    status: 'Pendente',
    description: 'Galhos de árvore com risco de queda sobre a fiação elétrica externa e muro de divisa.',
    locationDetails: 'Muro lateral próximo ao portão de veículos',
    photos: [],
    createdAt: '2026-09-16T13:10:00.000Z',
    updatedAt: '2026-09-16T13:10:00.000Z',
  },
  {
    id: 'dem-106',
    unitId: 'unit-4',
    unitName: 'Almoxarifado Central & Logística',
    type: 'Logistica',
    subtype: 'Segurança Monitorada',
    priority: 'Média',
    status: 'Em andamento',
    description: 'Revisão das câmeras do circuito fechado de TV nos galpões 1 e 2.',
    locationDetails: 'Galpões de armazenamento',
    photos: [],
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-13T14:20:00.000Z',
  },
];

class StorageService {
  private units: Unit[] = [];
  private demands: DemandItem[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      const storedUnits = localStorage.getItem(STORAGE_KEY_UNITS);
      if (storedUnits) {
        this.units = JSON.parse(storedUnits);
      } else {
        this.units = [...INITIAL_UNITS];
        this.saveUnits();
      }

      const storedDemands = localStorage.getItem(STORAGE_KEY_DEMANDS);
      if (storedDemands) {
        this.demands = JSON.parse(storedDemands);
      } else {
        this.demands = [...INITIAL_DEMANDS];
        this.saveDemands();
      }
      this.initialized = true;
    } catch (err) {
      console.warn('Erro ao inicializar localStorage, usando memória:', err);
      this.units = [...INITIAL_UNITS];
      this.demands = [...INITIAL_DEMANDS];
    }
  }

  private saveUnits() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(this.units));
    } catch (err) {
      console.error('Erro ao salvar unidades:', err);
    }
  }

  private saveDemands() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_DEMANDS, JSON.stringify(this.demands));
    } catch (err) {
      console.error('Erro ao salvar demandas:', err);
    }
  }

  // --- UNIDADES ---
  public getUnits(): Unit[] {
    if (!this.initialized) this.init();
    return [...this.units].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  public getUnitById(unitId: string): Unit | undefined {
    return this.units.find((u) => u.id === unitId);
  }

  public createUnit(data: Omit<Unit, 'id' | 'createdAt'>): Unit {
    const newUnit: Unit = {
      ...data,
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.units.unshift(newUnit);
    this.saveUnits();
    return newUnit;
  }

  public updateUnit(unitId: string, data: Partial<Omit<Unit, 'id' | 'createdAt'>>): Unit | null {
    const idx = this.units.findIndex((u) => u.id === unitId);
    if (idx === -1) return null;
    this.units[idx] = { ...this.units[idx], ...data };
    // update unit name in demands if changed
    if (data.name) {
      this.demands.forEach((d) => {
        if (d.unitId === unitId) d.unitName = data.name!;
      });
      this.saveDemands();
    }
    this.saveUnits();
    return this.units[idx];
  }

  public deleteUnit(unitId: string): boolean {
    this.units = this.units.filter((u) => u.id !== unitId);
    this.demands = this.demands.filter((d) => d.unitId !== unitId);
    this.saveUnits();
    this.saveDemands();
    return true;
  }

  // --- DEMANDAS E REGISTROS CONSOLIDADOS POR UNIDADE ---
  public getAllDemands(): DemandItem[] {
    if (!this.initialized) this.init();
    return [...this.demands].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getDemandsByUnit(unitId: string): DemandItem[] {
    return this.getAllDemands().filter((d) => d.unitId === unitId);
  }

  /**
   * Retorna o registro mestre consolidado da unidade com todas as suas demandas
   * Regra solicitada: 'ao inserir a demanda da respectiva unidade, caso a mesma tenha uma nova
   * demanda a ser cadastrada, ela seja inserida no mesmo registro, ou seja, que o registro seja sempre
   * atualizado com as novas ou conclusões de demandas.'
   */
  public getUnitRecord(unitId: string): UnitRecord | null {
    const unit = this.getUnitById(unitId);
    if (!unit) return null;
    const demands = this.getDemandsByUnit(unitId);
    const lastUpdated = demands.length > 0
      ? demands.reduce((latest, d) => (new Date(d.updatedAt) > new Date(latest) ? d.updatedAt : latest), demands[0].updatedAt)
      : unit.createdAt;

    return {
      unit,
      demands,
      lastUpdated,
    };
  }

  public getAllUnitRecords(): UnitRecord[] {
    const units = this.getUnits();
    return units.map((unit) => {
      const demands = this.getDemandsByUnit(unit.id);
      const lastUpdated = demands.length > 0
        ? demands.reduce((latest, d) => (new Date(d.updatedAt) > new Date(latest) ? d.updatedAt : latest), demands[0].updatedAt)
        : unit.createdAt;
      return { unit, demands, lastUpdated };
    });
  }

  /**
   * Insere nova demanda no registro da unidade ou atualiza uma existente
   */
  public saveDemand(
    demandData: Omit<DemandItem, 'id' | 'createdAt' | 'updatedAt' | 'unitName'> & { id?: string }
  ): DemandItem {
    const unit = this.getUnitById(demandData.unitId);
    const unitName = unit ? unit.name : 'Unidade não identificada';
    const now = new Date().toISOString();

    if (demandData.id) {
      // Atualizar demanda existente no registro da unidade
      const idx = this.demands.findIndex((d) => d.id === demandData.id);
      if (idx !== -1) {
        const existing = this.demands[idx];
        const isNowCompleted = demandData.status === 'Concluído' && existing.status !== 'Concluído';
        const isNowReopened = demandData.status !== 'Concluído' && existing.status === 'Concluído';

        const updated: DemandItem = {
          ...existing,
          ...demandData,
          unitName,
          updatedAt: now,
          completedAt: isNowCompleted ? now : isNowReopened ? undefined : existing.completedAt,
        };
        this.demands[idx] = updated;
        this.saveDemands();
        return updated;
      }
    }

    // Inserir nova demanda no registro da unidade
    const newDemand: DemandItem = {
      ...demandData,
      id: `dem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      unitName,
      createdAt: now,
      updatedAt: now,
      completedAt: demandData.status === 'Concluído' ? now : undefined,
    };

    this.demands.unshift(newDemand);
    this.saveDemands();
    return newDemand;
  }

  public updateDemandStatus(
    demandId: string,
    status: DemandStatus,
    resolutionNotes?: string
  ): DemandItem | null {
    const idx = this.demands.findIndex((d) => d.id === demandId);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const existing = this.demands[idx];

    const updated: DemandItem = {
      ...existing,
      status,
      resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : existing.resolutionNotes,
      updatedAt: now,
      completedAt: status === 'Concluído' ? now : undefined,
    };

    this.demands[idx] = updated;
    this.saveDemands();
    return updated;
  }

  public deleteDemand(demandId: string): boolean {
    this.demands = this.demands.filter((d) => d.id !== demandId);
    this.saveDemands();
    return true;
  }

  public resetToSampleData(): void {
    this.units = [...INITIAL_UNITS];
    this.demands = [...INITIAL_DEMANDS];
    this.saveUnits();
    this.saveDemands();
  }
}

export const storageService = new StorageService();
