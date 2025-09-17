import { createClient } from 'redis';

// Create Redis client that's compatible with Vercel KV interface
// Use container name for Docker, localhost for local development
const defaultRedisUrl = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres:5432')
  ? 'redis://redis:6379'
  : 'redis://localhost:6380';
const redisUrl = process.env.KV_URL || process.env.REDIS_URL || defaultRedisUrl;

console.log('Redis URL:', redisUrl);
console.log('Environment:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');

export const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    connectTimeout: 10000,
    // 'lazyConnect' not in current Redis typings; omit to satisfy TS
  },
});

redis.on('error', (err) => {
  console.log('Redis Client Error', err);
  isConnected = false;
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
  isConnected = true;
});

redis.on('disconnect', () => {
  console.log('Redis Client Disconnected');
  isConnected = false;
});

redis.on('reconnecting', () => {
  console.log('Redis Client Reconnecting');
  isConnected = false;
});

// Connection state management
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const ensureConnection = async () => {
  // Check if already connected
  if (isConnected && redis.isOpen) return;

  // Check if already connecting
  if (connectionPromise) return connectionPromise;

  // Start new connection
  connectionPromise = (async () => {
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
      isConnected = true;
      console.log('Redis connected successfully');
    } catch (err) {
      console.error('Redis connection failed:', err);
      connectionPromise = null;
      isConnected = false;
      throw err;
    }
  })();

  return connectionPromise;
};

// Wrapper function to ensure connection before operations
const withConnection = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    await ensureConnection();
    return await operation();
  } catch (error) {
    console.error('Redis operation failed:', error);
    // Reset connection state on certain errors
    const msg = (error as any)?.message || ''
    if (msg.includes('closed') || msg.includes('connection')) {
      isConnected = false;
      connectionPromise = null;
    }
    throw error;
  }
};

// KV-compatible interface
export const kv = {
  get: async (key: string) => {
    return withConnection(async () => {
      try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    });
  },

  set: async (key: string, value: any, options?: { ex?: number }) => {
    return withConnection(async () => {
      const stringValue = JSON.stringify(value);
      if (options?.ex) {
        await redis.setEx(key, options.ex, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    });
  },

  del: async (key: string) => {
    return withConnection(async () => {
      await redis.del(key);
    });
  },

  exists: async (key: string) => {
    return withConnection(async () => {
      const result = await redis.exists(key);
      return result === 1;
    });
  },

  keys: async (pattern: string) => {
    return withConnection(async () => {
      return await redis.keys(pattern);
    });
  },

  hget: async (key: string, field: string) => {
    return withConnection(async () => {
      return await redis.hGet(key, field);
    });
  },

  hset: async (key: string, field: string, value: string) => {
    return withConnection(async () => {
      return await redis.hSet(key, field, value);
    });
  },

  hgetall: async (key: string) => {
    return withConnection(async () => {
      return await redis.hGetAll(key);
    });
  },

  zrem: async (key: string, member: string) => {
    return withConnection(async () => {
      return await redis.zRem(key, member);
    });
  },

  // Accept both (key, score, member) and (key, { score, member }) signatures
  zadd: async (key: string, arg2: number | { score: number; member: string }, arg3?: string) => {
    return withConnection(async () => {
      let score: number;
      let member: string;
      if (typeof arg2 === 'object') {
        score = arg2.score;
        member = arg2.member;
      } else {
        score = arg2;
        member = arg3 as string;
      }
      return await redis.zAdd(key, { score, value: member });
    });
  },

  zrange: async (key: string, start: number, stop: number, options?: { rev?: boolean }) => {
    return withConnection(async () => {
      if (options?.rev) {
        return await redis.zRange(key, start, stop, { REV: true });
      }
      return await redis.zRange(key, start, stop);
    });
  },

  // Pipeline support for batch operations
  pipeline: () => {
    let multi: any = null;

    const pipe = {
      hgetall: (key: string) => {
        if (!multi) multi = redis.multi();
        multi.hGetAll(key);
        return pipe;
      },
      hmset: (key: string, data: any) => {
        if (!multi) multi = redis.multi();
        // Ensure all values are strings for Redis
        const stringifiedData: Record<string, string> = {};
        for (const [field, value] of Object.entries(data)) {
          stringifiedData[field] = typeof value === 'string' ? value : String(value);
        }
        multi.hSet(key, stringifiedData);
        return pipe;
      },
      zadd: (key: string, options: { score: number; member: string }) => {
        if (!multi) multi = redis.multi();
        multi.zAdd(key, { score: options.score, value: options.member });
        return pipe;
      },
      del: (key: string) => {
        if (!multi) multi = redis.multi();
        multi.del(key);
        return pipe;
      },
      zrem: (key: string, member: string) => {
        if (!multi) multi = redis.multi();
        multi.zRem(key, member);
        return pipe;
      },
      exec: async () => {
        return withConnection(async () => {
          if (!multi) return [];
          return await multi.exec();
        });
      }
    };

    return pipe;
  },

  // Additional methods for chat functionality
  hmset: async (key: string, data: any) => {
    return withConnection(async () => {
      // Ensure all values are strings for Redis
      const stringifiedData: Record<string, string> = {};
      for (const [field, value] of Object.entries(data)) {
        stringifiedData[field] = typeof value === 'string' ? value : String(value);
      }
      return await redis.hSet(key, stringifiedData);
    });
  },
};

export default kv;
