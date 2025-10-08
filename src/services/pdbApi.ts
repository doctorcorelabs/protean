// RCSB PDB Data API Service
// Documentation: https://data.rcsb.org/

// Route via our worker proxy; fall back to direct RCSB origins if proxy hiccups
const PDB_API_BASE = '/api/rcsb/rest/v1'
const PDB_GRAPHQL_BASE = '/api/rcsb/graphql'
const PDB_API_DIRECT_BASE = 'https://data.rcsb.org/rest/v1'
const PDB_GRAPHQL_DIRECT = 'https://data.rcsb.org/graphql'
const PDB_FILES_PROXY_BASE = '/api/rcsb/files'
const PDB_FILES_DIRECT_BASE = 'https://files.rcsb.org'

export interface PDBEntry {
  rcsb_id: string
  struct: {
    title: string
  }
  exptl: Array<{
    method: string
  }>
  rcsb_accession_info: {
    initial_release_date: string
  }
  audit_author: Array<{
    name: string
  }>
  rcsb_primary_citation?: {
    pdbx_database_id_PubMed?: string
    pdbx_database_id_DOI?: string
  }
}

export interface PolymerEntity {
  rcsb_id: string
  entity_poly: {
    pdbx_seq_one_letter_code: string
    pdbx_seq_one_letter_code_can: string
  }
  rcsb_entity_source_organism: Array<{
    ncbi_taxonomy_id: number
    ncbi_scientific_name: string
  }>
  rcsb_cluster_membership: Array<{
    cluster_id: string
    identity: number
  }>
}

export interface PolymerEntityInstance {
  rcsb_id: string
  rcsb_polymer_instance_annotation: Array<{
    annotation_id: string
    name: string
    type: string
  }>
  rcsb_polymer_instance_feature: Array<{
    type: string
    feature_positions: Array<{
      beg_seq_id: number
      end_seq_id: number
    }>
  }>
}

export interface ChemicalComponent {
  rcsb_id: string
  chem_comp: {
    type: string
    formula_weight: number
    name: string
    formula: string
  }
  rcsb_chem_comp_info: {
    initial_release_date: string
  }
}

export interface PDBStructureData {
  entry: PDBEntry
  polymerEntities: PolymerEntity[]
  polymerEntityInstances: PolymerEntityInstance[]
  chemicalComponents: ChemicalComponent[]
}

export class PDBApiService {
  // Internal: robust JSON fetch with proxy->direct fallback and light retry
  private static async fetchJsonWithFallback(proxyUrl: string, directUrl: string, init?: RequestInit): Promise<any> {
    const attempts = [proxyUrl, directUrl, proxyUrl]
    let lastError: any = null
    for (let i = 0; i < attempts.length; i++) {
      const url = attempts[i]
      try {
        const response = await fetch(url, init)
        if (response.ok) {
          return await response.json()
        }
        lastError = new Error(`${response.status} ${response.statusText}`)
      } catch (err) {
        lastError = err
      }
      // brief jitter before retry (non-blocking precision not required)
      await new Promise(res => setTimeout(res, i === attempts.length - 1 ? 0 : 150))
    }
    throw lastError || new Error('Unknown network error')
  }
  // Search functionality
  static async searchStructures(query: string, limit = 10): Promise<{ pdbId: string, title: string }[]> {
    try {
      // Alternative approach: Use GraphQL to search for entries with title containing the query
      const graphqlQuery = `
        query SearchStructures {
          entries(entry_ids: ["1CRN", "1ENH", "1FKB", "1GFL", "1HHO", "1IGD", "1LMB", "1MBN", "1PGB", "1PPT", "1R69", "1SHG", "1TEN", "1UBQ", "1WAP", "2CRO", "2GB1", "2LZM", "2PTC", "3CLN", "4HHB", "1A3N", "1ABC", "1ACB", "1ACE", "1ALA", "1AMB", "1ANF", "1ARB", "1ASH", "1ATN", "1ATP", "1B8G", "1BAB", "1BCF", "1BEC", "1BET", "1BGF", "1BIR", "1BLH", "1BMV", "1BOV", "1BPT", "1BTL", "1BUP", "1BVC", "1BYB", "1BZO", "1C1A", "1C75", "1CAT", "1CAU", "1CDG", "1CEW", "1CFB", "1CFC", "1CKA", "1CKV", "1CLS", "1CMB", "1COL", "1CPO", "1CPP", "1CRB", "1CTS", "1CYC", "1CYO", "1CZF", "1DAD", "1DDT", "1DEF", "1DFN", "1DKT", "1DMS", "1DT3", "1DUN", "1DUX", "1DWP", "1E0F", "1E2I", "1E6Y", "1E9H", "1EAR", "1EBG", "1EBX", "1EFN", "1EGY", "1EHZ", "1ELN", "1ELS", "1EMT", "1ENY", "1EPB", "1EQG", "1ERN", "1ETL", "1ETS", "1EUO", "1EXE", "1EYS", "1F3G", "1F4S", "1F51", "1F5U", "1F6S", "1F74", "1F85", "1F8E", "1F9Y", "1FA9", "1FB5", "1FBL", "1FC2", "1FD3", "1FE8", "1FFO", "1FG7", "1FHA", "1FI8", "1FIN", "1FIR", "1FJG", "1FKJ", "1FL0", "1FLM", "1FLR", "1FMK", "1FN9", "1FNL", "1FO5", "1FOS", "1FPZ", "1FQJ", "1FR3", "1FS1", "1FTF", "1FTN", "1FU7", "1FUJ", "1FV1", "1FWP", "1FX7", "1FYX", "1FZV", "1G2E", "1G3P", "1G41", "1G4Y", "1G5Y", "1G66", "1G6G", "1G6N", "1G7I", "1G8E", "1G9O", "1GAI", "1GBF", "1GBP", "1GBX", "1GCE", "1GCR", "1GDJ", "1GDO", "1GE8", "1GEF", "1GG2", "1GGS", "1GH6", "1GHG", "1GIH", "1GJ4", "1GJC", "1GK8", "1GKY", "1GL0", "1GLQ", "1GM2", "1GMX", "1GN5", "1GNP", "1GOF", "1GP6", "1GPW", "1GQV", "1GRJ", "1GS9", "1GT0", "1GU4", "1GUX", "1GV7", "1GWD", "1GX8", "1GY7", "1GYM", "1GZ7", "1H0D", "1H1E", "1H25", "1H2T", "1H3E", "1H4G", "1H57", "1H5Q", "1H6H", "1H70", "1H8E", "1H9D", "1HAG", "1HBN", "1HCL", "1HDM", "1HE8", "1HF6", "1HFH", "1HG7", "1HH2", "1HIA", "1HIW", "1HJE", "1HKG", "1HLE", "1HLU", "1HMY", "1HN2", "1HO3", "1HPH", "1HQL", "1HRC", "1HS1", "1HTQ", "1HUB", "1HV4", "1HWQ", "1HXN", "1HYP", "1HZH", "1I0R", "1I1Y", "1I2M", "1I3Q", "1I4B", "1I50", "1I5N", "1I6H", "1I7A", "1I84", "1I9R", "1IAB", "1IB1", "1IC2", "1IDK", "1IE9", "1IF7", "1IG5", "1IH7", "1II5", "1IJD", "1IK4", "1ILQ", "1IML", "1INQ", "1IOH", "1IPQ", "1IQZ", "1IRK", "1ISU", "1ITV", "1IU5", "1IVA", "1IWG", "1IXH", "1IYS", "1IZ7", "1J06", "1J1E", "1J2J", "1J3A", "1J4N", "1J5E", "1J6Z", "1J7D", "1J8H", "1J9P", "1JAE", "1JBE", "1JCO", "1JD1", "1JE8", "1JFH", "1JGU", "1JHV", "1JI7", "1JJI", "1JKS", "1JL5", "1JMO", "1JNR", "1JOH", "1JPF", "1JQH", "1JR3", "1JSP", "1JTG", "1JUJ", "1JV5", "1JWH", "1JXO", "1JYS", "1JZ8", "1K0F", "1K1E", "1K2P", "1K3U", "1K4I", "1K5N", "1K6F", "1K7I", "1K8A", "1K9M", "1KAC", "1KBH", "1KCI", "1KDH", "1KEG", "1KFB", "1KGC", "1KHH", "1KI0", "1KJ4", "1KK7", "1KLN", "1KMV", "1KNW", "1KOD", "1KPF", "1KQF", "1KR7", "1KSA", "1KTF", "1KUH", "1KVK", "1KWF", "1KXP", "1KYC", "1KZ1", "1L0Y", "1L1U", "1L2Y", "1L3R", "1L4L", "1L5I", "1L6N", "1L7A", "1L84", "1L9H", "1LAC", "1LBA", "1LCL", "1LDG", "1LEA", "1LFA", "1LGP", "1LHO", "1LI1", "1LJO", "1LKK", "1LLR", "1LMO", "1LNI", "1LOX", "1LPG", "1LQU", "1LRV", "1LST", "1LTI", "1LU0", "1LVL", "1LWW", "1LXY", "1LYB", "1LZT"]) {
            rcsb_id
            struct {
              title
            }
          }
        }
      `;

      // Get a large sample of entries and filter by title
      const data = await this.graphqlQuery(graphqlQuery);
      const entries = data.entries || [];
      
      // Filter entries whose title contains the search query
      const filteredEntries = entries.filter((entry: any) => 
        entry.struct?.title?.toLowerCase().includes(query.toLowerCase())
      );

      return filteredEntries.slice(0, limit).map((entry: any) => ({
        pdbId: entry.rcsb_id,
        title: entry.struct?.title || `PDB Structure ${entry.rcsb_id}`
      }));
      
    } catch (err) {
      console.error("Search error:", err);
      
      // Fallback to simple static results for common queries
      const fallbackResults = [
        { pdbId: "1CRN", title: "Crambin" },
        { pdbId: "4HHB", title: "Hemoglobin" },
        { pdbId: "2LZM", title: "Lysozyme" },
        { pdbId: "1MBN", title: "Myoglobin" },
        { pdbId: "1UBQ", title: "Ubiquitin" },
        { pdbId: "1GFL", title: "Green Fluorescent Protein" },
        { pdbId: "1HRC", title: "Cytochrome C" },
        { pdbId: "1ENH", title: "Engrailed Homeodomain" }
      ];
      
      return fallbackResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.pdbId.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    }
  }
  // REST API Methods
  static async getEntry(pdbId: string): Promise<PDBEntry> {
    return this.fetchJsonWithFallback(
      `${PDB_API_BASE}/core/entry/${pdbId}`,
      `${PDB_API_DIRECT_BASE}/core/entry/${pdbId}`
    )
  }

  static async getPolymerEntity(pdbId: string, entityId: string): Promise<PolymerEntity> {
    return this.fetchJsonWithFallback(
      `${PDB_API_BASE}/core/polymer_entity/${pdbId}/${entityId}`,
      `${PDB_API_DIRECT_BASE}/core/polymer_entity/${pdbId}/${entityId}`
    )
  }

  static async getPolymerEntityInstance(pdbId: string, chainId: string): Promise<PolymerEntityInstance> {
    return this.fetchJsonWithFallback(
      `${PDB_API_BASE}/core/polymer_entity_instance/${pdbId}/${chainId}`,
      `${PDB_API_DIRECT_BASE}/core/polymer_entity_instance/${pdbId}/${chainId}`
    )
  }

  static async getChemicalComponent(compId: string): Promise<ChemicalComponent> {
    return this.fetchJsonWithFallback(
      `${PDB_API_BASE}/core/chem_comp/${compId}`,
      `${PDB_API_DIRECT_BASE}/core/chem_comp/${compId}`
    )
  }

  // GraphQL API Methods
  static async graphqlQuery(query: string, variables?: Record<string, any>): Promise<any> {
    const body = JSON.stringify({ query, variables })
    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }

    const attempts = [PDB_GRAPHQL_BASE, PDB_GRAPHQL_DIRECT, PDB_GRAPHQL_BASE]
    let lastErr: any = null
    for (let i = 0; i < attempts.length; i++) {
      try {
        const resp = await fetch(attempts[i], init)
        if (!resp.ok) {
          lastErr = new Error(`${resp.status} ${resp.statusText}`)
        } else {
          const result = await resp.json()
          if (result.errors) {
            lastErr = new Error(result.errors.map((e: any) => e.message).join(', '))
          } else {
            return result.data
          }
        }
      } catch (e) {
        lastErr = e
      }
      await new Promise(res => setTimeout(res, i === attempts.length - 1 ? 0 : 150))
    }
    throw new Error(`GraphQL query failed: ${lastErr}`)
  }

  // Complex queries using GraphQL
  static async getStructureInfo(pdbIds: string[]): Promise<PDBEntry[]> {
    const query = `
      query GetStructureInfo($ids: [String!]!) {
        entries(entry_ids: $ids) {
          rcsb_id
          struct {
            title
          }
          exptl {
            method
          }
          rcsb_accession_info {
            initial_release_date
          }
          audit_author {
            name
          }
          rcsb_primary_citation {
            pdbx_database_id_PubMed
            pdbx_database_id_DOI
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { ids: pdbIds })
    return data.entries
  }

  static async getPolymerEntityInfo(entityIds: string[]): Promise<PolymerEntity[]> {
    const query = `
      query GetPolymerEntityInfo($ids: [String!]!) {
        polymer_entities(entity_ids: $ids) {
          rcsb_id
          entity_poly {
            pdbx_seq_one_letter_code
            pdbx_seq_one_letter_code_can
          }
          rcsb_entity_source_organism {
            ncbi_taxonomy_id
            ncbi_scientific_name
          }
          rcsb_cluster_membership {
            cluster_id
            identity
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { ids: entityIds })
    return data.polymer_entities
  }

  static async getPolymerInstanceInfo(instanceIds: string[]): Promise<PolymerEntityInstance[]> {
    const query = `
      query GetPolymerInstanceInfo($ids: [String!]!) {
        polymer_entity_instances(instance_ids: $ids) {
          rcsb_id
          rcsb_polymer_instance_annotation {
            annotation_id
            name
            type
          }
          rcsb_polymer_instance_feature {
            type
            feature_positions {
              beg_seq_id
              end_seq_id
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { ids: instanceIds })
    return data.polymer_entity_instances
  }

  static async getChemicalComponentInfo(compIds: string[]): Promise<ChemicalComponent[]> {
    const query = `
      query GetChemicalComponentInfo($ids: [String!]!) {
        chem_comps(comp_ids: $ids) {
          rcsb_id
          chem_comp {
            type
            formula_weight
            name
            formula
          }
          rcsb_chem_comp_info {
            initial_release_date
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { ids: compIds })
    return data.chem_comps
  }

  // Get complete structure data (robust: entry is required; others are best-effort)
  static async getCompleteStructureData(pdbId: string): Promise<PDBStructureData> {
    // Entry (REST) is critical; fail if we cannot fetch it
    const entry = await this.getEntry(pdbId)

    // Best-effort GraphQL fetches
    let polymerEntities: PolymerEntity[] = []
    let polymerEntityInstances: PolymerEntityInstance[] = []
    const chemicalComponents: ChemicalComponent[] = []

    try {
      const entityIds = [`${pdbId}_1`]
      polymerEntities = await this.getPolymerEntityInfo(entityIds)
    } catch (e) {
      console.warn(`Polymer entities unavailable for ${pdbId}:`, e)
    }

    try {
      const instanceIds = [`${pdbId}.A`]
      polymerEntityInstances = await this.getPolymerInstanceInfo(instanceIds)
    } catch (e) {
      console.warn(`Polymer instances unavailable for ${pdbId}:`, e)
    }

    return {
      entry,
      polymerEntities,
      polymerEntityInstances,
      chemicalComponents,
    }
  }

  // Search functionality

  // Get PDB file URL
  static getPDBFileUrl(pdbId: string): string {
    // Use proxy path that the worker maps to files.rcsb.org
    return `${PDB_FILES_PROXY_BASE}/download/${pdbId}.pdb`
  }

  // Get structure image URL
  static getStructureImageUrl(pdbId: string, size = 'medium'): string {
    // Images are CDN and usually CORS-safe; keep direct URL
    return `https://cdn.rcsb.org/images/structures/${pdbId.toLowerCase()}_${size}.jpg`
  }

  // Fetch raw PDB text with proxy->direct fallback
  static async fetchPDBText(pdbId: string): Promise<string> {
    const attempts = [
      `${PDB_FILES_PROXY_BASE}/download/${pdbId}.pdb`,
      `${PDB_FILES_DIRECT_BASE}/download/${pdbId}.pdb`,
      `${PDB_FILES_PROXY_BASE}/download/${pdbId}.pdb`,
    ]
    let lastErr: any = null
    for (let i = 0; i < attempts.length; i++) {
      try {
        const resp = await fetch(attempts[i])
        if (resp.ok) {
          return await resp.text()
        }
        lastErr = new Error(`${resp.status} ${resp.statusText}`)
      } catch (e) {
        lastErr = e
      }
      await new Promise(res => setTimeout(res, i === attempts.length - 1 ? 0 : 150))
    }
    throw new Error(`Failed to fetch PDB file for ${pdbId}: ${lastErr}`)
  }

  // Validate PDB ID
  static validatePDBId(pdbId: string): boolean {
    return /^[0-9][A-Z0-9]{3}$/i.test(pdbId)
  }

  // Get current PDB holdings
  static async getCurrentPDBIds(): Promise<string[]> {
    try {
      const response = await fetch('https://data.rcsb.org/rest/v1/holdings/current/entry_ids')
      if (!response.ok) {
        throw new Error('Failed to fetch current PDB IDs')
      }
      return response.json()
    } catch (error) {
      console.warn('Failed to fetch current PDB IDs, using fallback list')
      // Fallback to a curated list of popular structures
      return [
        '1CRN', '1ENH', '1FKB', '1GFL', '1HHO', '1IGD', '1LMB', '1MBN', '1PGB', '1PPT',
        '1R69', '1SHG', '1TEN', '1UBQ', '1WAP', '2CRO', '2GB1', '2LZM', '2PTC', '3CLN',
        '4HHB', '5FMB', '6L63', '7NHM', '8ZZ3', '8ZZ4', '9A2F'
      ]
    }
  }
}

export default PDBApiService







