# DOJ Epstein Files Scraper

Scrapes MP4 file URLs from DOJ Epstein disclosure data sets with parallel fetching and fail-safe progress tracking.

## Setup

```bash
# Install dependencies
bun install

# Install Chromium browser for Playwright
bunx playwright install chromium
```

## Usage

### Quick Start

```bash
# Test with 50 pages
bun run scrape:test

# Scrape all datasets (9, 10, 11)
bun run scrape

# Scrape with higher concurrency (faster)
bun run scrape:fast
```

### Scrape Specific Dataset

```bash
bun run scrape:9   # Dataset 9 only
bun run scrape:10  # Dataset 10 only
bun run scrape:11  # Dataset 11 only
```

### Resume & Retry

The scraper automatically resumes from where it left off. If it crashes or you stop it:

```bash
# Just run again - it will skip completed pages
bun run scrape

# Only retry pages that previously failed
bun run scrape:retry

# Start completely fresh (clear all progress)
bun run scrape:fresh
```

### Run with Visible Browser

Useful for debugging verification popups:

```bash
bun run scrape:visible
```

### Custom Options

```bash
# Scrape dataset 9, max 100 pages, 15 parallel workers, visible browser
bun run scraper.ts --dataset 9 --max-pages 100 --concurrency 15 --visible

# Retry only failed pages for dataset 10
bun run scraper.ts --dataset 10 --retry-failed
```

## Options

| Flag                | Description                              | Default |
|---------------------|------------------------------------------|---------|
| `--dataset <id>`    | Scrape only this dataset (9, 10, or 11)  | all     |
| `--max-pages <n>`   | Limit to first n pages per dataset       | all     |
| `--concurrency <n>` | Number of parallel page fetches          | 10      |
| `--visible`         | Run browser in visible mode              | false   |
| `--retry-failed`    | Only retry previously failed pages       | false   |
| `--clear-progress`  | Start fresh, ignore previous progress    | false   |

## Output

Results are saved as JSON files:

- `data-set-9.json`
- `data-set-10.json`
- `data-set-11.json`

Format:

```json
{
  "datasetId": 9,
  "totalPages": 9000,
  "scrapedAt": "2026-02-02T...",
  "mp4Files": [
    {
      "filename": "EFTA00039025.mp4",
      "url": "https://www.justice.gov/epstein/files/DataSet%209/EFTA00039025.mp4"
    }
  ]
}
```

## Progress Tracking (Fail-Safe)

Progress is saved to `progress-{id}.json` every 10 seconds, tracking:

- **completedPages**: List of all successfully fetched page numbers
- **failedPages**: List of pages that failed (for retry)
- **mp4Files**: All MP4 files found so far

This means:

- If you fetch pages 1-10 and 15-25, then stop, it knows pages 11-14 are missing
- On restart, it only fetches the missing pages (11-14)
- Failed pages are automatically retried on next run
- You can use `--retry-failed` to only retry failed pages

To check progress:

```bash
cat progress-9.json | jq '.completedPages | length'
```

To start fresh:

```bash
rm progress-9.json
# or
bun run scrape:fresh --dataset 9
```

## Features

- Parallel page fetching (default 10 concurrent, configurable)
- Immediate next-page start when any fetch completes
- **Fail-safe progress**: tracks individual pages, not just "last page"
- **Gap detection**: knows exactly which pages are missing
- **Auto-retry**: failed pages are retried on next run
- Handles DOJ age verification popup automatically
- Handles "I am not a robot" check automatically
- Auto-stops after 15 consecutive errors
- Duration and pages/sec stats
- Headless or visible browser mode
