// src/services/geminiService.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Context templates for each feature
const FEATURE_CONTEXTS = {
  '3dviewer': `You are a molecular biology expert analyzing 3D protein structures. When users mention codes like "1crn", "4hhb", etc., these are PDB (Protein Data Bank) IDs referring to specific protein structures. Always interpret these in the context of protein structures, not academic credits or other meanings.

Context: 3D Structure Analysis
- Focus on protein structure, molecular visualization, and structural biology
- PDB IDs like 1CRN refer to protein structures (e.g., 1CRN is crambin protein)
- Discuss secondary structures, domains, binding sites, and molecular interactions
- Provide insights about structural features and biological function

User query: `,
  
  'alphafold': `You are an AI expert in protein structure prediction using AlphaFold technology. When users mention codes like "1crn", "4hhb", etc., these are PDB IDs referring to specific protein structures.

Context: AlphaFold Prediction Analysis
- Focus on protein structure prediction, confidence scores (pLDDT), and folding patterns
- PDB IDs like 1CRN refer to protein structures (e.g., 1CRN is crambin protein)
- Discuss prediction accuracy, reliable regions, and structural confidence
- Compare predicted vs experimental structures when relevant

User query: `,
  
  'aianalysis': `You are an AI expert in protein analysis and computational biology. When users mention codes like "1crn", "4hhb", etc., these are PDB IDs referring to specific protein structures.

Context: AI Protein Analysis
- Focus on protein stability, binding sites, interactions, and functional analysis
- PDB IDs like 1CRN refer to protein structures (e.g., 1CRN is crambin protein)
- Analyze molecular interactions, stability factors, and biological function
- Provide recommendations for protein optimization and modification

IMPORTANT: Please respond ONLY in the following JSON format, without any explanation or extra text:
{
  "stability": <number>,
  "bindingSites": [{"position": <number>, "confidence": <number>, "type": <string>}],
  "interactions": [{"type": <string>, "count": <number>, "strength": <number>}],
  "recommendations": [<string>, ...]
}

User query:`,
  
  'labplanning': `You are a laboratory expert specializing in protein research and experimental protocols. When users mention codes like "1crn", "4hhb", etc., these are PDB IDs referring to specific protein structures.

Context: Laboratory Planning
- Focus on experimental protocols, safety guidelines, and lab procedures
- PDB IDs like 1CRN refer to protein structures (e.g., 1CRN is crambin protein)
- Suggest appropriate experimental conditions, materials, and safety measures
- Optimize protocols for protein research and analysis

User query: `,
  
  'pdbsearch': `You are a database expert specializing in the Protein Data Bank (PDB) and protein structure databases. When users mention codes like "1crn", "4hhb", etc., these are PDB IDs referring to specific protein structures.

Context: PDB Structure Search
- Focus on protein structure databases, search strategies, and structural comparisons
- PDB IDs like 1CRN refer to protein structures (e.g., 1CRN is crambin protein)
- Help find similar structures, functional homologs, and related proteins
- Provide insights about protein families and structural relationships

User query: `,
  
  // ...existing code...

// ...existing code...
};

// Common PDB IDs and their descriptions
const COMMON_PDB_IDS = {
  '1crn': 'Crambin - a small plant seed protein from Crambe abyssinica',
  '4hhb': 'Human Hemoglobin - oxygen transport protein',
  '1bna': 'B-DNA - standard B-form DNA double helix',
  '1d23': 'DNA Dodecamer - DNA crystal structure',
  '1fq2': 'DNA Quadruplex - G-quadruplex DNA structure',
  '1g3x': 'DNA Triplex - triple helix DNA structure',
  '1hho': 'Human Hemoglobin - oxygen transport protein',
  '1enh': 'Engrailed Homeodomain - DNA-binding protein',
  '1fkb': 'FK506 Binding Protein - immunosuppressive drug target',
  '1gfl': 'Green Fluorescent Protein - fluorescent marker',
  '1igd': 'Immunoglobulin - antibody fragment',
  '1lmb': 'Lysozyme - antibacterial enzyme',
  '1mbn': 'Myoglobin - oxygen storage protein',
  '1pgb': 'Protein G B1 - immunoglobulin binding protein',
  '1ppt': 'Peptidase - proteolytic enzyme',
  '5fmb': 'Fumarase - metabolic enzyme',
  '6l63': 'SARS-CoV-2 Spike - viral protein',
  '7nhm': 'Neurotransmitter - neural signaling protein'
};

function detectPDBId(prompt: string): string | null {
  // Look for 4-character codes that match PDB ID pattern
  const pdbMatch = prompt.match(/\b([1-9][a-z0-9]{3}|[a-z][a-z0-9]{3})\b/gi);
  if (pdbMatch) {
    const pdbId = pdbMatch[0].toLowerCase();
    return COMMON_PDB_IDS[pdbId as keyof typeof COMMON_PDB_IDS] || null;
  }
  return null;
}

function getContextualPrompt(feature: string, userPrompt: string): string {
  const context = FEATURE_CONTEXTS[feature as keyof typeof FEATURE_CONTEXTS] || '';
  
  // Check if user mentioned a PDB ID
  const pdbDescription = detectPDBId(userPrompt);
  let enhancedPrompt = context + userPrompt;
  
  if (pdbDescription) {
    enhancedPrompt = context + 
      `\n\nNote: The user mentioned a PDB ID. ${pdbDescription}. Please provide detailed analysis of this protein structure.\n\n` +
      `User query: ${userPrompt}`;
  }
  
  return enhancedPrompt;
}

// Fallback responses for when API is not available
function getFallbackResponse(feature: string, prompt: string): string {
  const pdbDescription = detectPDBId(prompt);
  
  if (pdbDescription) {
    switch (feature) {
      case '3dviewer':
        return `## 3D Structure Analysis: ${pdbDescription}

**Structural Overview:**
This protein structure can be visualized in 3D to understand its molecular architecture. The structure reveals important information about:

- **Secondary Structure Elements**: Alpha helices and beta sheets
- **Tertiary Structure**: Overall 3D folding pattern
- **Functional Domains**: Regions responsible for biological activity
- **Binding Sites**: Areas where other molecules can interact

**Visualization Tips:**
- Use different rendering modes (ribbon, surface, stick) to explore different aspects
- Rotate and zoom to examine the structure from different angles
- Look for hydrophobic and hydrophilic regions
- Identify potential binding pockets and active sites

**Key Features to Observe:**
- Overall shape and compactness
- Presence of cavities or channels
- Surface accessibility of functional groups
- Structural stability indicators`;

      case 'alphafold':
        return `## AlphaFold Prediction Analysis: ${pdbDescription}

**Prediction Confidence:**
This structure has been predicted using AlphaFold's advanced AI algorithms. Key confidence metrics include:

- **pLDDT Score**: Per-residue confidence (0-100)
- **Overall Confidence**: Average confidence across the structure
- **Reliable Regions**: High-confidence areas suitable for analysis
- **Uncertain Regions**: Low-confidence areas requiring caution

**Structural Insights:**
- **Folding Pattern**: Predicted secondary and tertiary structure
- **Domain Organization**: Functional domains and their arrangement
- **Stability Factors**: Regions contributing to structural stability
- **Functional Implications**: How structure relates to biological function

**Validation Considerations:**
- Compare with experimental structures when available
- Consider confidence scores in interpretation
- Focus analysis on high-confidence regions
- Use for hypothesis generation and experimental design`;

      case 'aianalysis':
        return `## AI Protein Analysis: ${pdbDescription}

**Stability Analysis:**
This protein shows characteristics that indicate:

- **Thermodynamic Stability**: Folding free energy and stability factors
- **Kinetic Stability**: Resistance to unfolding and degradation
- **pH Sensitivity**: Stability across different pH conditions
- **Temperature Dependence**: Thermal stability profile

**Binding Site Analysis:**
- **Active Sites**: Catalytic or functional regions
- **Allosteric Sites**: Regulatory binding locations
- **Protein-Protein Interfaces**: Interaction surfaces
- **Small Molecule Binding**: Drug or ligand binding pockets

**Molecular Interactions:**
- **Hydrogen Bonds**: Stabilizing interactions
- **Hydrophobic Contacts**: Core packing interactions
- **Electrostatic Interactions**: Charged group interactions
- **Van der Waals Forces**: Close contact interactions

**Recommendations:**
- Consider mutations for improved stability
- Identify potential drug binding sites
- Optimize conditions for protein function
- Investigate allosteric regulation mechanisms`;

      case 'labplanning':
        return `## Laboratory Planning: ${pdbDescription}

**Experimental Considerations:**
For working with this protein structure, consider:

**Sample Preparation:**
- **Expression System**: Recombinant expression requirements
- **Purification Strategy**: Chromatography and purification steps
- **Buffer Conditions**: Optimal pH and ionic strength
- **Storage Conditions**: Temperature and stability requirements

**Safety Guidelines:**
- **Biosafety Level**: Appropriate containment requirements
- **Personal Protective Equipment**: Lab coat, gloves, safety glasses
- **Chemical Safety**: Hazardous reagents and disposal
- **Equipment Safety**: Proper use of analytical instruments

**Experimental Timeline:**
- **Day 1-2**: Sample preparation and purification
- **Day 3-4**: Structural analysis and characterization
- **Day 5-7**: Functional studies and binding assays
- **Day 8-10**: Data analysis and interpretation

**Materials Needed:**
- Protein expression vectors and host cells
- Purification resins and buffers
- Analytical instruments (spectrophotometer, etc.)
- Safety equipment and personal protective gear`;

      case 'pdbsearch':
        return `## PDB Search Results: ${pdbDescription}

**Related Structures:**
This protein belongs to a family of related structures in the PDB:

**Structural Homologs:**
- **High Similarity**: Structures with >80% sequence identity
- **Medium Similarity**: Structures with 40-80% sequence identity
- **Low Similarity**: Structures with <40% sequence identity
- **Functional Homologs**: Different sequences, similar function

**Search Strategies:**
- **Sequence Similarity**: BLAST searches for related sequences
- **Structural Similarity**: DALI searches for similar folds
- **Functional Similarity**: GO term and pathway analysis
- **Evolutionary Relationships**: Phylogenetic analysis

**Database Resources:**
- **PDB**: Primary structure database
- **UniProt**: Sequence and annotation database
- **SCOP/CATH**: Structural classification databases
- **Pfam**: Protein family databases

**Analysis Tools:**
- **Structure Comparison**: Superposition and alignment tools
- **Functional Annotation**: GO term and pathway analysis
- **Evolutionary Analysis**: Phylogenetic reconstruction
- **Drug Discovery**: Binding site and druggability analysis`;

  // ...existing code...
        return `## DNA Structure Analysis: ${pdbDescription}

**DNA Structure Overview:**
This structure provides insights into DNA architecture and function:

**Double Helix Characteristics:**
- **Helix Type**: A-form, B-form, or Z-form DNA
- **Base Pairing**: Watson-Crick and non-canonical pairs
- **Groove Geometry**: Major and minor groove dimensions
- **Helical Parameters**: Rise, twist, and roll angles

**Structural Features:**
- **Backbone Conformation**: Sugar-phosphate backbone geometry
- **Base Stacking**: Interactions between adjacent bases
- **Groove Binding**: Sites for protein and drug binding
- **Flexibility**: Bending and twisting capabilities

**Biological Significance:**
- **Protein Recognition**: How proteins recognize DNA sequences
- **Drug Binding**: Small molecule interaction sites
- **Structural Motifs**: Common DNA structural elements
- **Functional Implications**: Relationship to biological processes

**Visualization Tips:**
- **Color Coding**: Different colors for different bases
- **Rendering Modes**: Stick, ball-and-stick, or surface representation
- **Animation**: Show dynamic movements and flexibility
- **Comparison**: Compare with other DNA structures`;

      default:
        return `## Analysis: ${pdbDescription}

This protein structure provides valuable insights into molecular biology and structural biochemistry. The structure reveals important information about protein function, stability, and interactions that are crucial for understanding biological processes.`;
    }
  }

  // Generic response for non-PDB queries
  return `## ${feature.toUpperCase()} Analysis

I understand you're asking about ${prompt}. In the context of ${feature}, this relates to molecular biology and structural analysis. 

**Key Areas to Consider:**
- Molecular structure and function
- Biological significance and applications
- Experimental approaches and techniques
- Data analysis and interpretation

**Next Steps:**
- Provide more specific details about your research question
- Specify the type of analysis you're interested in
- Mention any particular aspects you'd like to focus on

Please feel free to ask more specific questions about protein structures, molecular interactions, or experimental protocols.`;
}

export async function streamGemini(
  feature: string,
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  try {
    // Add contextual information to the prompt
    const contextualPrompt = getContextualPrompt(feature, prompt);
    
    const response = await fetch(`${API_BASE_URL}/api/gemini/${feature}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: contextualPrompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.substring(6));
            if (json.text) {
              onChunk(json.text);
            }
          } catch (error) {
            console.error('Failed to parse SSE chunk:', error);
          }
        }
      }
    }
  } catch (error) {
    console.warn('API request failed, using fallback response:', error);
    
    // Use fallback response
    const fallbackResponse = getFallbackResponse(feature, prompt);
    
    // Simulate streaming by sending chunks
    const words = fallbackResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      setTimeout(() => {
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
      }, i * 50); // 50ms delay between words
    }
  }
}
