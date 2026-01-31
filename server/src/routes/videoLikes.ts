import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { videos, videoLikes } from "../db/schema";
import { getClientIp, getOrCreateUser } from "./users";

// GET /api/videos/:videoId/like - get user's like status for a video
export async function handleGetVideoLike(
  req: Request,
  videoId: string,
  corsHeaders: Record<string, string>
) {
  const ip = getClientIp(req);
  const user = await getOrCreateUser(ip);

  const existing = await db
    .select({ isLike: videoLikes.isLike })
    .from(videoLikes)
    .where(
      and(
        eq(videoLikes.videoId, videoId),
        eq(videoLikes.userId, user.id)
      )
    )
    .limit(1);

  return Response.json(
    { userLike: existing.length > 0 ? existing[0].isLike : null },
    { headers: corsHeaders }
  );
}

// POST /api/videos/:videoId/like - like a video
export async function handleLikeVideo(
  req: Request,
  videoId: string,
  corsHeaders: Record<string, string>
) {
  const ip = getClientIp(req);
  const user = await getOrCreateUser(ip);

  // Check if user already has a reaction
  const existing = await db
    .select()
    .from(videoLikes)
    .where(
      and(
        eq(videoLikes.videoId, videoId),
        eq(videoLikes.userId, user.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].isLike) {
      // Already liked, remove the like
      await db.delete(videoLikes).where(eq(videoLikes.id, existing[0].id));
      await db
        .update(videos)
        .set({ likes: videos.likes })
        .where(eq(videos.id, videoId));
      // Decrement likes count
      await db.execute(
        `UPDATE videos SET likes = likes - 1 WHERE id = '${videoId}'`
      );
      return Response.json({ userLike: null }, { headers: corsHeaders });
    } else {
      // Was dislike, change to like
      await db
        .update(videoLikes)
        .set({ isLike: true })
        .where(eq(videoLikes.id, existing[0].id));
      // Increment likes, decrement dislikes
      await db.execute(
        `UPDATE videos SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = '${videoId}'`
      );
      return Response.json({ userLike: true }, { headers: corsHeaders });
    }
  }

  // No existing reaction, create like
  await db.insert(videoLikes).values({
    videoId,
    userId: user.id,
    isLike: true,
  });
  // Increment likes count
  await db.execute(
    `UPDATE videos SET likes = likes + 1 WHERE id = '${videoId}'`
  );

  return Response.json({ userLike: true }, { headers: corsHeaders });
}

// POST /api/videos/:videoId/dislike - dislike a video
export async function handleDislikeVideo(
  req: Request,
  videoId: string,
  corsHeaders: Record<string, string>
) {
  const ip = getClientIp(req);
  const user = await getOrCreateUser(ip);

  // Check if user already has a reaction
  const existing = await db
    .select()
    .from(videoLikes)
    .where(
      and(
        eq(videoLikes.videoId, videoId),
        eq(videoLikes.userId, user.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    if (!existing[0].isLike) {
      // Already disliked, remove the dislike
      await db.delete(videoLikes).where(eq(videoLikes.id, existing[0].id));
      // Decrement dislikes count
      await db.execute(
        `UPDATE videos SET dislikes = dislikes - 1 WHERE id = '${videoId}'`
      );
      return Response.json({ userLike: null }, { headers: corsHeaders });
    } else {
      // Was like, change to dislike
      await db
        .update(videoLikes)
        .set({ isLike: false })
        .where(eq(videoLikes.id, existing[0].id));
      // Decrement likes, increment dislikes
      await db.execute(
        `UPDATE videos SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = '${videoId}'`
      );
      return Response.json({ userLike: false }, { headers: corsHeaders });
    }
  }

  // No existing reaction, create dislike
  await db.insert(videoLikes).values({
    videoId,
    userId: user.id,
    isLike: false,
  });
  // Increment dislikes count
  await db.execute(
    `UPDATE videos SET dislikes = dislikes + 1 WHERE id = '${videoId}'`
  );

  return Response.json({ userLike: false }, { headers: corsHeaders });
}
