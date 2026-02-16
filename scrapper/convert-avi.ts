const DOWNLOADS_DIR = `${import.meta.dir}/downloads`;
const OUTPUT_DIR = `${import.meta.dir}/downloads/converted`;
const CONCURRENCY = 4;

async function main() {
  const files = (await Array.fromAsync(new Bun.Glob("*.avi").scan(DOWNLOADS_DIR))).sort();

  if (files.length === 0) {
    console.log("No .avi files found in downloads/");
    return;
  }

  await Bun.$`mkdir -p ${OUTPUT_DIR}`.quiet();

  // Check which ones are already converted
  const remaining = [];
  for (const file of files) {
    const outName = file.replace(/\.avi$/, ".mp4");
    const outFile = Bun.file(`${OUTPUT_DIR}/${outName}`);
    if (await outFile.exists()) {
      const stat = await outFile.stat();
      if (stat && stat.size > 1000) continue; // already converted
    }
    remaining.push(file);
  }

  console.log(`Total .avi files: ${files.length}`);
  console.log(`Already converted: ${files.length - remaining.length}`);
  console.log(`To convert: ${remaining.length}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (remaining.length === 0) {
    console.log("All files already converted!");
    return;
  }

  let done = 0;
  let failed = 0;
  const failures: string[] = [];
  const startTime = Date.now();

  async function convert(filename: string) {
    const input = `${DOWNLOADS_DIR}/${filename}`;
    const output = `${OUTPUT_DIR}/${filename.replace(/\.avi$/, ".mp4")}`;

    try {
      const result = await Bun.$`ffmpeg -y -i ${input} -c:v libx264 -preset fast -crf 23 -an ${output} 2>&1`.quiet();
      done++;
      const pct = ((done + failed) / remaining.length * 100).toFixed(1);
      process.stdout.write(`\r  ${done + failed}/${remaining.length} (${pct}%) | converted: ${done} | failed: ${failed} | ${filename}          `);
    } catch (e) {
      failed++;
      failures.push(filename);
      const pct = ((done + failed) / remaining.length * 100).toFixed(1);
      process.stdout.write(`\r  ${done + failed}/${remaining.length} (${pct}%) | converted: ${done} | failed: ${failed} | FAIL: ${filename}          `);
    }
  }

  // Process in batches
  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(convert));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nDone in ${elapsed}s`);
  console.log(`Converted: ${done}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log(`\nFailed files:`);
    for (const f of failures) console.log(`  ${f}`);
  }
}

main();
