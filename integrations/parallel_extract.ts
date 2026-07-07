import Parallel from "parallel-web";

type ParallelExtractOptions = {
  urls?: string[];
  fullContent?: boolean;
  objective?: string;
};

export async function extractWithParallel(options: ParallelExtractOptions = {}) {
  const apiKey = process.env.PARALLEL_API_KEY;
  if (!apiKey) {
    throw new Error("PARALLEL_API_KEY is not configured.");
  }

  const client = new Parallel({ apiKey });
  return client.extract({
    urls: options.urls ?? ["https://www.google.com"],
    objective: options.objective,
    advanced_settings: {
      full_content: options.fullContent ?? false,
    },
  });
}

if (process.argv[1]?.endsWith("parallel_extract.ts")) {
  extractWithParallel()
    .then((response) => {
      console.log(JSON.stringify(response, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
