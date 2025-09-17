'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { getFullUserInfo } from './auth'
// Use in-memory storage for demo mode, Redis for production
let memoryStore: { [key: string]: any } = {};

const getKV = async () => {
  const { isDemoMode } = await import('../../lib/demoData');

  if (isDemoMode()) {
    // Simple in-memory KV store for demo mode
    return {
      hgetall: async (key: string) => memoryStore[key] || null,
      hmset: async (key: string, data: any) => { memoryStore[key] = data; },
      hget: async (key: string, field: string) => {
        const data = memoryStore[key] || null;
        return data ? data[field] ?? null : null;
      },
      del: async (key: string) => { delete memoryStore[key]; },
      zadd: async (key: string, options: { score: number; member: string }) => {
        if (!memoryStore[key]) memoryStore[key] = [];
        // Remove existing entry with same member to avoid duplicates
        memoryStore[key] = memoryStore[key].filter((item: any) => item.member !== options.member);
        memoryStore[key].push({ score: options.score, member: options.member });
      },
      zrem: async (key: string, member: string) => {
        if (!memoryStore[key]) return;
        memoryStore[key] = memoryStore[key].filter((item: any) => item.member !== member);
      },
      zrange: async (key: string, start: number, stop: number, options?: { rev?: boolean }) => {
        const data = memoryStore[key] || [];
        const sorted = data.sort((a: any, b: any) => options?.rev ? b.score - a.score : a.score - b.score);
        return sorted.slice(start, stop === -1 ? undefined : stop + 1).map((item: any) => item.member);
      },
      pipeline: () => {
        const ops: Array<() => void> = [];
        const pipe = {
          hgetall: (key: string) => {
            // Not used in pipelines currently; no-op
            return pipe;
          },
          hmset: (key: string, data: any) => {
            ops.push(() => { memoryStore[key] = data; });
            return pipe;
          },
          zadd: (key: string, options: { score: number; member: string }) => {
            ops.push(() => {
              if (!memoryStore[key]) memoryStore[key] = [];
              memoryStore[key] = memoryStore[key].filter((item: any) => item.member !== options.member);
              memoryStore[key].push({ score: options.score, member: options.member });
            });
            return pipe;
          },
          del: (key: string) => {
            ops.push(() => { delete memoryStore[key]; });
            return pipe;
          },
          zrem: (key: string, member: string) => {
            ops.push(() => {
              if (!memoryStore[key]) return;
              memoryStore[key] = memoryStore[key].filter((item: any) => item.member !== member);
            });
            return pipe;
          },
          exec: async () => { ops.forEach(fn => fn()); return []; }
        };
        return pipe;
      }
    };
  } else {
    // Use Redis for production
    const { kv } = await import('@/lib/redis');
    return kv;
  }
};

export async function getChats(userId?: string | null) {
  // Resolve to DB user id to avoid provider id mismatches
  let finalUserId: string | null = userId || null;
  try {
    const { getUserInfo: getAuthUserInfo } = await import('@/server/auth');
    const dbUser = await getAuthUserInfo();
    if (dbUser?.id) finalUserId = dbUser.id as string;
  } catch (e) {
    // ignore, fall back to provided userId
  }

  if (!finalUserId) {
    return []
  }

  console.log('Getting chats for user:', finalUserId);

  // Always fetch from database first (primary source of truth)
  try {
    const { getChatsFromDB } = await import('@/server/chat');
    const dbChats = await getChatsFromDB(finalUserId);

    console.log('Found chats in database:', dbChats.length);

    if (dbChats.length > 0) {
      // Try to sync to Redis for faster future access (non-critical)
      try {
        const kv = await getKV();
        for (const chat of dbChats) {
          const serializedChat = {
            id: chat.id || '',
            title: chat.title || 'New Chat',
            userId: chat.userId || '',
            createdAt: chat.createdAt ? chat.createdAt.toISOString() : new Date().toISOString(),
            messages: JSON.stringify(chat.messages || []),
            path: chat.path || ''
          };

          await kv.hmset(`chat:${chat.id}`, serializedChat);
          await kv.zadd(`user:chat:${finalUserId}`, {
            score: chat.createdAt.getTime(),
            member: `chat:${chat.id}`
          });
        }
        console.log('Synced chats to Redis cache');
      } catch (redisErr) {
        console.error('Error syncing to Redis (non-critical):', redisErr);
      }
    }

    return dbChats;
  } catch (dbErr) {
    console.error('Error getting chats from database:', dbErr);

    // Fallback to Redis if database fails
    try {
      console.log('Falling back to Redis...');
      const kv = await getKV();
      const chats: string[] = await kv.zrange(`user:chat:${finalUserId}`, 0, -1, {
        rev: true
      })

      const results = [];
      for (const chat of chats) {
        const chatData = await kv.hgetall(chat);
        if (chatData && Object.keys(chatData).length > 0) {
          // Deserialize from Redis
          const deserializedChat = {
            id: chatData.id,
            title: chatData.title,
            userId: chatData.userId,
            createdAt: new Date(chatData.createdAt),
            messages: JSON.parse(chatData.messages || '[]'),
            path: chatData.path
          };
          results.push(deserializedChat);
        }
      }

      return results as Chat[];
    } catch (redisErr) {
      console.error('Error getting chats from Redis:', redisErr);
      return []
    }
  }
}

export async function getChat(id: string, userId: string) {
  // Resolve to DB user id to avoid mismatches with provider ids
  let finalUserId: string = userId;
  try {
    const { getUserInfo: getAuthUserInfo } = await import('@/server/auth');
    const dbUser = await getAuthUserInfo();
    if (dbUser?.id) finalUserId = dbUser.id as string;
  } catch {}

  console.log('Getting chat:', { id, userId: finalUserId });

  // Try database first (primary source)
  try {
    const { getChatFromDB } = await import('@/server/chat');
    const chat = await getChatFromDB(id, finalUserId) as Chat;

    if (chat) {
      console.log('Found chat in database:', chat.title);
      return chat;
    }
  } catch (dbErr) {
    console.error('Error getting chat from database:', dbErr);
  }

  // Fallback to Redis if database fails
  try {
    console.log('Falling back to Redis for chat:', id);
    const kv = await getKV();
    const chatData = await kv.hgetall(`chat:${id}`);

    if (chatData && Object.keys(chatData).length > 0) {
      // Deserialize from Redis
      const chat = {
        id: chatData.id,
        title: chatData.title,
        userId: chatData.userId,
        createdAt: new Date(chatData.createdAt),
        messages: JSON.parse(chatData.messages || '[]'),
        path: chatData.path
      } as Chat;

      if (finalUserId && chat.userId !== finalUserId) {
        return null;
      }

      return chat;
    }
  } catch (redisErr) {
    console.error('Error getting chat from Redis:', redisErr);
  }

  return null;
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await getFullUserInfo()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  // Normalize to DB user id
  let finalUserId: string | null = null
  // Prefer session.id if present (demo mode returns an object with id)
  if (typeof session === 'object' && session !== null && 'id' in session && session.id) {
    finalUserId = String((session as any).id)
  }
  // Try to resolve DB user id for non-demo sessions
  try {
    const { getUserInfo: getAuthUserInfo } = await import('@/server/auth');
    const dbUser = await getAuthUserInfo();
    if (dbUser?.id) finalUserId = String(dbUser.id);
  } catch {}

  if (!finalUserId) {
    return { error: 'Unauthorized' }
  }

  const kv = await getKV();
  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid && uid !== finalUserId) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${finalUserId}`, `chat:${id}`)

  // Also delete from database
  try {
    const { deleteChatFromDB } = await import('@/server/chat');
    await deleteChatFromDB(id, finalUserId);
  } catch (err) {
    console.error('Error deleting chat from database:', err);
  }

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await getFullUserInfo();

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  // Normalize to DB user id
  let finalUserId: string | null = null
  if (typeof session === 'object' && session !== null && 'id' in session && (session as any).id) {
    finalUserId = String((session as any).id)
  }
  try {
    const { getUserInfo: getAuthUserInfo } = await import('@/server/auth');
    const dbUser = await getAuthUserInfo();
    if (dbUser?.id) finalUserId = String(dbUser.id);
  } catch {}

  if (!finalUserId) {
    return { error: 'Unauthorized' }
  }

  const kv = await getKV();
  const chats: string[] = await kv.zrange(`user:chat:${finalUserId}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${finalUserId}`, chat)
  }

  await pipeline.exec()

  // Also clear from database
  try {
    const { clearChatsFromDB } = await import('@/server/chat');
    await clearChatsFromDB(finalUserId);
  } catch (err) {
    console.error('Error clearing chats from database:', err);
  }

  revalidatePath('/dashboard/chat')
  return redirect('/dashboard/chat')
}

export async function removeChatsBulk({ ids }: { ids: string[] }) {
  'use server'

  const session = await getFullUserInfo();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  // Normalize to DB user id
  let finalUserId: string | null = null
  if (typeof session === 'object' && session !== null && 'id' in session && (session as any).id) {
    finalUserId = String((session as any).id)
  }
  try {
    const { getUserInfo: getAuthUserInfo } = await import('@/server/auth');
    const dbUser = await getAuthUserInfo();
    if (dbUser?.id) finalUserId = String(dbUser.id);
  } catch {}

  if (!finalUserId) {
    return { error: 'Unauthorized' }
  }

  if (!ids || ids.length === 0) {
    return { error: 'No chats selected' };
  }

  try {
    const kv = await getKV();
    const pipeline = kv.pipeline();
    for (const id of ids) {
      pipeline.del(`chat:${id}`);
      // Remove from the user zset by value
      pipeline.zrem(`user:chat:${finalUserId}`, `chat:${id}`);
    }
    await pipeline.exec();
  } catch (err) {
    console.error('Error deleting chats from Redis:', err);
  }

  // Delete from DB
  try {
    const { deleteChatFromDB } = await import('@/server/chat');
    for (const id of ids) {
      await deleteChatFromDB(id, finalUserId);
    }
  } catch (err) {
    console.error('Error deleting chats from database:', err);
  }

  // Revalidate chat pages
  try {
    revalidatePath('/dashboard/chat');
    revalidatePath('/');
  } catch {}

  return { success: true };
}

export async function saveChat(chat: Chat) {
  const session = await getFullUserInfo()

  if (session) {
    console.log('Attempting to save chat:', {
      id: chat.id,
      title: chat.title,
      userId: chat.userId,
      messagesCount: chat.messages?.length || 0
    });

    // Always save to PostgreSQL for persistence (primary storage)
    try {
      const { saveChatToDB } = await import('@/server/chat');
      const result = await saveChatToDB(chat);
      console.log('Chat saved to database:', result);
    } catch (dbErr) {
      console.error('Error saving chat to database:', dbErr);
      return; // If database save fails, don't continue
    }

    // Try to save to Redis for fast access (secondary/cache)
    try {
      const kv = await getKV();

      // Serialize the chat object for Redis storage
      const serializedChat = {
        id: chat.id || '',
        title: chat.title || 'New Chat',
        userId: chat.userId || '',
        createdAt: chat.createdAt ? chat.createdAt.toISOString() : new Date().toISOString(),
        messages: JSON.stringify(chat.messages || []),
        path: chat.path || ''
      };

      await kv.hmset(`chat:${chat.id}`, serializedChat);
      await kv.zadd(`user:chat:${chat.userId}`, {
        score: Date.now(),
        member: `chat:${chat.id}`
      });

      console.log('Chat saved to Redis successfully');
    } catch (redisErr) {
      console.error('Error saving chat to Redis (non-critical):', redisErr);
      // Redis failure is non-critical since we have database storage
    }
  } else {
    console.log('No session found, cannot save chat');
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
