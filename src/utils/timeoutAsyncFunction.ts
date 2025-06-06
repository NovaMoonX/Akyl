interface TimeoutAsyncFunctionOptions {
  timeoutMs?: number;
  maxRetries?: number;
  name?: string;
}

export default function timeoutAsyncFunction<T>(
  asyncFunction: () => Promise<T>,
  options: TimeoutAsyncFunctionOptions = {},
) {
  const { timeoutMs = 10000, maxRetries = 3, name = '' } = options;

  let retries = 0;
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out ${name ? `: ${name}` : ''}`));
    }, timeoutMs);
  });

  // Race between the async function and the timeout promise
  const retry = async (): Promise<T> => {
    try {
      return await Promise.race([asyncFunction(), timeoutPromise]);
    } catch (error) {
      console.error(error);

      retries++;
      if (retries >= maxRetries) {
        throw error;
      }

      return retry();
    }
  };

  return retry();
}
