let lastQuery = "";

export const ghostMemory = {
  set(query: string) {
    lastQuery = query;
  },
  get() {
    const result = lastQuery;
    lastQuery = ""; // clear after one use if needed
    return result;
  },
};