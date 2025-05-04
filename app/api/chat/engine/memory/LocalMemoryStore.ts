const KEY = "chatMemoryBuffer";

export const LocalMemoryStore = {
  save: (buffer: any) => {
    localStorage.setItem(KEY, JSON.stringify(buffer));
  },
  load: (): any[] => {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  },
  reset: () => {
    localStorage.removeItem(KEY);
  },
};
