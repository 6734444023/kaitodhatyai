
const raw = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

export const ADMIN_PASSWORD: string[] = (() => {
  if (!raw) return [];

  try {

    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      return (parsed as unknown[])
        .map((p: unknown) => String(p).trim())  
        .filter((p: string) => p.length > 0);
    }
  } catch {

  }

 
  return raw
    .split(",")
    .map((p: string) => p.trim())             
    .filter((p: string) => p.length > 0);
})();
