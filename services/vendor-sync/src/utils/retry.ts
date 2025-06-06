export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      const backoff = delayMs * 2 ** attempt;
      console.warn(`Retry #${attempt} in ${backoff}ms...`);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  throw new Error("Max retries reached");
};
