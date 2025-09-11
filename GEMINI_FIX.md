# Perbaikan Error "Maximum call stack size exceeded"

## Masalah yang Ditemukan

Error "Maximum call stack size exceeded" disebabkan oleh **infinite recursion** di hook `useFormattedGemini`. Masalahnya adalah ada konflik nama antara:

1. Hook `useFormattedGemini` yang dibuat di `src/hooks/useFormattedGemini.ts`
2. Hook `useFormattedGemini` yang ada di `src/utils/geminiFormatter.ts`

Ini menyebabkan hook memanggil dirinya sendiri secara infinite, sehingga stack overflow.

## Solusi yang Diterapkan

### 1. **Mengganti Nama Hook di `geminiFormatter.ts`**

**Sebelum:**
```typescript
export const useFormattedGemini = (
  feature: GeminiFormatOptions['feature'],
  options?: Partial<GeminiFormatOptions>
) => {
  // ...
}
```

**Sesudah:**
```typescript
export const useGeminiFormatter = (
  feature: GeminiFormatOptions['feature'],
  options?: Partial<GeminiFormatOptions>
) => {
  // ...
}
```

### 2. **Update Import di `useFormattedGemini.ts`**

**Sebelum:**
```typescript
import { useFormattedGemini, GeminiFormatOptions } from '../utils/geminiFormatter'
```

**Sesudah:**
```typescript
import { useGeminiFormatter, GeminiFormatOptions } from '../utils/geminiFormatter'
```

### 3. **Update Penggunaan Hook**

**Sebelum:**
```typescript
const {
  formatResponse,
  getSuggestions,
  getContext
} = useFormattedGemini(feature, options)
```

**Sesudah:**
```typescript
const {
  formatResponse,
  getSuggestions,
  getContext
} = useGeminiFormatter(feature, options)
```

## Struktur Hook yang Benar

### `src/utils/geminiFormatter.ts`
- `GeminiFormatter` class - utility untuk formatting
- `useGeminiFormatter` hook - hook untuk formatting (nama baru)

### `src/hooks/useFormattedGemini.ts`
- `useFormattedGemini` hook - hook utama yang menggabungkan Gemini service dengan formatter

### `src/components/ui/GeminiAssistant.tsx`
- Menggunakan `useFormattedGemini` dari hooks
- Tidak ada perubahan import

## File yang Diperbaiki

1. ✅ `src/utils/geminiFormatter.ts` - Mengganti nama hook
2. ✅ `src/hooks/useFormattedGemini.ts` - Update import
3. ✅ `src/test/gemini-test.tsx` - File test untuk memastikan tidak ada recursion

## Testing

File test `src/test/gemini-test.tsx` dibuat untuk memastikan:
- Tidak ada infinite recursion
- Hook berfungsi dengan benar
- State management bekerja
- Console log untuk debugging

## Status

**✅ MASALAH TELAH DIPERBAIKI**

Error "Maximum call stack size exceeded" telah diperbaiki dengan mengganti nama hook yang konflik. Aplikasi sekarang dapat berjalan tanpa infinite recursion.

## Cara Menjalankan Test

```tsx
import GeminiTest from '../test/gemini-test'

// Gunakan di komponen untuk test
<GeminiTest />
```

Test akan menampilkan informasi state dan memungkinkan testing submit prompt tanpa error.
