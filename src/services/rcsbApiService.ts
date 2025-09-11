// src/services/rcsbApiService.ts

export async function fetchRCSBMetadata(pdbId: string) {
  const res = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`)
  if (!res.ok) throw new Error('Failed to fetch RCSB metadata')
  return await res.json()
}
