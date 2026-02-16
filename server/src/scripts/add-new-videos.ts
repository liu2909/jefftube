import { db } from "../db";
import { videos } from "../db/schema";
import data from "../data.json";
import videoState from "../video-state.json";

interface VideoData {
  title: string | null;
  filename: string;
  length: string;
  hasThumbnail: boolean;
}

interface VideoStateEntry {
  filename: string;
  nsfw: boolean;
  is_shorts: boolean;
  playlist: string | null;
  title: string | null;
}

function getIdFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

const videoStateMap = new Map<string, VideoStateEntry>(
  (videoState as VideoStateEntry[]).map((entry) => [entry.filename, entry])
);

async function addNewVideos() {
  const allVideos = data as VideoData[];
  const videoData = allVideos.filter((video) => {
    if (video.title === null) return false;
    const state = videoStateMap.get(video.filename);
    if (state?.nsfw) return false;
    return true;
  });

  console.log(`Found ${videoData.length} eligible videos, inserting new ones...`);

  let inserted = 0;
  const batchSize = 100;
  for (let i = 0; i < videoData.length; i += batchSize) {
    const batch = videoData.slice(i, i + batchSize);
    const result = await db
      .insert(videos)
      .values(
        batch.map((video) => {
          const state = videoStateMap.get(video.filename);
          return {
            id: getIdFromFilename(video.filename),
            title: state?.title ?? video.title,
            filename: video.filename,
            length: parseTimeToSeconds(video.length),
            hasThumbnail: video.hasThumbnail,
            is_shorts: state?.is_shorts ?? false,
            playlist: state?.playlist ?? null,
          };
        })
      )
      .onConflictDoNothing();

    inserted += result.count;
  }

  console.log(`Done! Inserted ${inserted} new videos (skipped existing).`);
  process.exit(0);
}

addNewVideos().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
