const BASE = import.meta.dir;

// Parse CSV and extract file names (first column, skip header)
function parseFileNames(csv: string): string[] {
  return csv
    .trim()
    .split("\n")
    .slice(1) // skip header
    .map((line) => {
      // Handle CSV with quoted fields (commas inside quotes)
      const match = line.match(/^([^,]+)/);
      return match ? match[1].trim() : "";
    })
    .filter(Boolean);
}

// Load CSVs for a dataset and combine all file names (deduplicated)
async function loadNewFileNames(dataset: number): Promise<Set<string>> {
  const appended = await Bun.file(
    `${BASE}/new-files/Non-PDF in Epstein Files - Data Set ${dataset} appended.csv`
  ).text();
  const incomplete = await Bun.file(
    `${BASE}/new-files/Non-PDF in Epstein Files - Data Set ${dataset} incomplete.csv`
  ).text();

  const names = new Set<string>();
  for (const name of parseFileNames(appended)) names.add(name);
  for (const name of parseFileNames(incomplete)) names.add(name);
  return names;
}

// Load existing filenames from JSON
async function loadExistingFileNames(dataset: number): Promise<Set<string>> {
  const data = await Bun.file(`${BASE}/data-set-${dataset}.json`).json();
  return new Set(data.mp4Files.map((f: { filename: string }) => f.filename));
}

async function main() {
  for (const dataset of [9, 10]) {
    const csvNames = await loadNewFileNames(dataset);
    const existingNames = await loadExistingFileNames(dataset);

    // Find names in CSVs that are NOT in the existing JSON
    const newNames = [...csvNames].filter((name) => !existingNames.has(name));

    console.log(`\n--- Data Set ${dataset} ---`);
    console.log(`Total names from CSVs (combined): ${csvNames.size}`);
    console.log(`Existing names in JSON: ${existingNames.size}`);
    console.log(`New file names found: ${newNames.length}`);

    // Sort: by extension, then by EFTA number
    const sorted = newNames.sort((a, b) => {
      const extA = a.slice(a.lastIndexOf("."));
      const extB = b.slice(b.lastIndexOf("."));
      if (extA !== extB) return extA.localeCompare(extB);
      const numA = a.match(/\d+/)?.[0] ?? "";
      const numB = b.match(/\d+/)?.[0] ?? "";
      return numA.localeCompare(numB, undefined, { numeric: true });
    });

    // Write in same format as data-set-*.json so downloader.ts can use it directly
    const output = {
      datasetId: dataset,
      totalPages: 0,
      scrapedAt: new Date().toISOString(),
      mp4Files: sorted.map((filename) => ({
        filename,
        url: `https://www.justice.gov/epstein/files/DataSet%20${dataset}/${encodeURIComponent(filename)}`,
      })),
    };

    const outPath = `${BASE}/new-data-set-${dataset}.json`;
    await Bun.write(outPath, JSON.stringify(output, null, 2));
    console.log(`Written to: ${outPath}`);
  }
}

main();
