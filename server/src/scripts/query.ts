import { db } from "../db";
import { comments } from "../db/schema";
import { eq, like, sql } from "drizzle-orm";

// Write your query below
// const result = await db
//     .delete(comments)
//     .where(eq(comments.content, 'trans rights are human rights'));

// const result3 = await db
//     .delete(comments)
//     .where(
//         sql`${comments.content} LIKE '%elegram%'`
//     )
//     .returning();
// console.log(`Deleted ${result3.length} rows`);

// const result2 = await db
//     .select({ count: sql<number>`count(*)::int` })
//     .from(comments)
//     .where(
//         sql`${comments.content} = 'Yo'`
//     );
// console.log(`Count: ${result2[0].count}`);
// Execute each statement separately to avoid transaction issues
// await db.execute(sql`
//   DO $$
//   DECLARE r record;
//   BEGIN
//     FOR r IN
//       SELECT
//         c.conname,
//         c.conrelid::regclass AS table_name
//       FROM pg_constraint c
//       JOIN pg_class t ON t.oid = c.conrelid
//       WHERE c.contype = 'f'
//         AND t.relname IN ('comments', 'comment_likes', 'video_likes')
//     LOOP
//       EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.table_name, r.conname);
//     END LOOP;
//   END $$;
// `);

// // Convert user_id columns from UUID -> TEXT
// await db.execute(sql`
//   ALTER TABLE public.comments
//     ALTER COLUMN user_id TYPE text USING user_id::text;
// `);

// await db.execute(sql`
//   ALTER TABLE public.comment_likes
//     ALTER COLUMN user_id TYPE text USING user_id::text;
// `);

// await db.execute(sql`
//   ALTER TABLE public.video_likes
//     ALTER COLUMN user_id TYPE text USING user_id::text;
// `);

// await db.execute(sql`  DROP TABLE IF EXISTS public.users;`);
// console.log('Migration completed successfully');

// const result = await db.execute(sql`  SELECT table_name, column_name, data_type
//     FROM information_schema.columns
//     WHERE table_schema = 'public'
//       AND table_name IN ('comments', 'comment_likes', 'video_likes')
//       AND column_name = 'user_id';`);
// console.log(result);

const recentComments = await db
  .delete(comments)
console.log(recentComments);

// console.log('10 most recent comments:');
// recentComments.forEach((comment, index) => {
//     console.log(`${index + 1}. ${comment.content}`);
// });


// const result = await db
//     .select({ count: sql<number>`count(*)::int` })
//     .from(comments);
// console.log(`Total comments: ${result[0].count}`);

process.exit(0);
