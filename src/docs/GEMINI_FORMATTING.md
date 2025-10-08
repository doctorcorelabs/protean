# Gemini Output Formatting System

Sistem formatting Gemini yang linear dan kontekstual untuk semua fitur aplikasi DNA.

## Overview

Sistem ini dirancang untuk memberikan output Gemini yang terstruktur, linear, dan sesuai dengan konteks setiap fitur. Output akan diformat secara otomatis berdasarkan jenis fitur dan prioritas konten.

## Komponen Utama

### 1. GeminiFormatter (`src/utils/geminiFormatter.ts`)

Utility class yang menangani formatting output Gemini berdasarkan konteks fitur.

**Fitur:**
- Parsing response mentah menjadi section terstruktur
- Prioritas konten berdasarkan keyword fitur
- Formatting otomatis (bullets, headers, code, table)
- Optimasi untuk tampilan linear

**Feature Contexts:**
- `3dviewer`: Analisis struktur 3D
- `alphafold`: Prediksi AlphaFold
- `aianalysis`: Analisis protein AI
- `labplanning`: Perencanaan laboratorium
- `pdbsearch`: Pencarian PDB
// ...existing code...

### 2. FormattedGeminiOutput (`src/components/ui/FormattedGeminiOutput.tsx`)

Komponen React untuk menampilkan output Gemini yang sudah diformat.

**Fitur:**
- Tampilan section dengan icon dan warna berbeda
- Copy to clipboard functionality
- Regenerate response
- Suggestion questions
- Loading states dan error handling

### 3. useFormattedGemini (`src/hooks/useFormattedGemini.ts`)

Custom hook yang menggabungkan Gemini service dengan formatter.

**Fitur:**
- State management untuk response
- Auto-formatting response
- Error handling
- Utility functions (copy, regenerate, clear)

### 4. GeminiAssistant (`src/components/ui/GeminiAssistant.tsx`)

Komponen wrapper yang menggabungkan semua fitur menjadi satu interface.

**Fitur:**
- Input form dengan suggestions
- Tampilan response yang diformat
- Feature-specific context
- Responsive design

## Cara Penggunaan

### Implementasi di Komponen Fitur

```tsx
import GeminiAssistant from '../ui/GeminiAssistant'

const MyFeature: React.FC = () => {
  return (
    <div>
      {/* Gemini AI Assistant */}
      <div className="max-w-4xl mx-auto mb-8">
        <GeminiAssistant
          feature="aianalysis"
          placeholder="Ask about protein analysis..."
          compact={false}
        />
      </div>
      
      {/* Rest of component */}
    </div>
  )
}
```

### Props GeminiAssistant

// ...existing code...
- `placeholder`: Placeholder text untuk input
- `title`: Judul custom (optional)
- `showSuggestions`: Tampilkan suggestion questions (default: true)
- `compact`: Mode compact (default: false)
- `className`: CSS class tambahan

## Formatting Logic

### 1. Section Types

- **highlight**: Headers dan informasi penting
- **list**: Daftar bullet points
- **code**: Code blocks
- **table**: Tabel data
- **text**: Teks biasa

### 2. Priority System

Prioritas ditentukan berdasarkan:
- Keyword matches dengan konteks fitur
- Jenis section (header > list > text > code > table)
- Urutan dalam response

### 3. Feature-Specific Keywords

Setiap fitur memiliki keyword yang relevan untuk meningkatkan prioritas konten:

```typescript
'3dviewer': ['structure', 'protein', 'molecule', '3d', 'visualization', 'pdb', 'crystal']
'alphafold': ['prediction', 'structure', 'confidence', 'plddt', 'sequence', 'folding']
'aianalysis': ['analysis', 'stability', 'binding', 'interactions', 'recommendations', 'insights']
'labplanning': ['protocol', 'experiment', 'materials', 'safety', 'timeline', 'procedure']
'pdbsearch': ['search', 'structure', 'pdb', 'database', 'protein', 'crystal']
// ...existing code...
```

## Suggestion Questions

Setiap fitur memiliki suggestion questions yang relevan:

### AI Analysis
- "Analyze protein stability"
- "Identify potential binding sites"
- "Suggest optimization strategies"
- "Evaluate functional implications"

### AlphaFold
- "Analyze the confidence of this prediction"
- "What are the most reliable regions?"
- "Compare with known structures"
- "Explain the folding pattern"

### 3D Viewer
- "Explain the structure of this protein"
- "What are the key structural features?"
- "Describe the secondary structure elements"
- "What functional domains are present?"

### Lab Planning
- "Suggest protocol improvements"
- "Identify potential issues"
- "Recommend safety measures"
- "Optimize experimental timeline"

### PDB Search
- "Find similar structures"
- "Compare structural features"
- "Identify functional homologs"
- "Suggest related proteins"

// ...existing code...
- "Explain DNA structure"
- "Describe base pairing"
- "Compare different DNA forms"
- "Explain structural variations"

## Customization

### Menambah Feature Baru

1. Tambahkan feature ke `GeminiFormatOptions['feature']`
2. Tambahkan context di `featureContexts`
3. Tambahkan suggestions di `getPromptSuggestions`
4. Update endpoint di `geminiService.ts`

### Custom Formatting

```typescript
const customFormatter = new GeminiFormatter()

const sections = customFormatter.formatResponse(response, {
  feature: 'myfeature',
  showBullets: true,
  showHeaders: true,
  compactMode: false,
  maxLength: 5
})
```

## Error Handling

Sistem menangani error dengan:
- Loading states
- Error messages yang user-friendly
- Retry functionality
- Fallback ke response mentah jika formatting gagal

## Performance

- Lazy loading untuk suggestions
- Memoization untuk formatting
- Debounced input handling
- Optimized re-renders

## Testing

Untuk testing, gunakan mock data:

```typescript
const mockResponse = `
# Analysis Results

## Stability
The protein shows high stability with confidence score of 85%.

## Binding Sites
- Active site at position 45
- Allosteric site at position 78
- Regulatory site at position 123

## Recommendations
1. Optimize pH conditions
2. Consider cofactor binding
3. Investigate allosteric regulation
`
```

## Future Enhancements

- [ ] Support untuk markdown tables
- [ ] Export functionality (PDF, CSV)
- [ ] Custom theme per feature
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Advanced filtering options





