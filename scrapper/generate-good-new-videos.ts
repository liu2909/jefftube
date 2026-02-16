const BASE = import.meta.dir;
const INPUT_DIR = `${BASE}/good-new-videos-data-set-9`;

async function main() {
  const files = (await Array.fromAsync(new Bun.Glob("*").scan(INPUT_DIR)))
    .filter((f) => !f.startsWith("."))
    .sort((a, b) => {
      const extA = a.slice(a.lastIndexOf("."));
      const extB = b.slice(b.lastIndexOf("."));
      if (extA !== extB) return extA.localeCompare(extB);
      const numA = a.match(/\d+/)?.[0] ?? "";
      const numB = b.match(/\d+/)?.[0] ?? "";
      return numA.localeCompare(numB, undefined, { numeric: true });
    });

  const output = {
    datasetId: 9,
    totalPages: 0,
    scrapedAt: new Date().toISOString(),
    mp4Files: files.map((filename) => ({
      filename,
      url: `https://www.justice.gov/epstein/files/DataSet%209/${encodeURIComponent(filename)}`,
    })),
  };

  const outPath = `${BASE}/good-new-data-set-9.json`;
  await Bun.write(outPath, JSON.stringify(output, null, 2));
  console.log(`Written ${files.length} files to ${outPath}`);
}

main();
