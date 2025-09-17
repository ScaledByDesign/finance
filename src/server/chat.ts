import db from '@/lib/db';
import { type Chat } from '@/lib/types';

/**
 * Save chat to PostgreSQL database
 */
export async function saveChatToDB(chat: Chat) {
  try {
    // Check if chat exists
    const existingChat = await db.chat.findFirst({
      where: {
        chatId: chat.id,
        userId: chat.userId
      }
    });

    if (existingChat) {
      // Update existing chat
      await db.chat.update({
        where: {
          id: existingChat.id
        },
        data: {
          title: chat.title,
          messages: JSON.stringify(chat.messages),
          path: chat.path,
          createdAt: chat.createdAt
        }
      });
    } else {
      // Create new chat
      await db.chat.create({
        data: {
          chatId: chat.id,
          userId: chat.userId,
          title: chat.title,
          messages: JSON.stringify(chat.messages),
          path: chat.path,
          createdAt: chat.createdAt
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving chat to database:', error);
    return { success: false, error };
  }
}

/**
 * Get chats from PostgreSQL database
 */
export async function getChatsFromDB(userId: string) {
  try {
    const chats = await db.chat.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return chats.map(chat => ({
      id: chat.chatId,
      title: chat.title || '',
      userId: chat.userId,
      createdAt: chat.createdAt || new Date(),
      messages: chat.messages ? JSON.parse(chat.messages) : [],
      path: chat.path || `/dashboard/chat/${chat.chatId}`
    })) as Chat[];
  } catch (error) {
    console.error('Error getting chats from database:', error);
    return [];
  }
}

/**
 * Get a single chat from PostgreSQL database
 */
export async function getChatFromDB(chatId: string, userId: string) {
  try {
    const chat = await db.chat.findFirst({
      where: {
        chatId,
        userId
      }
    });

    if (!chat) {
      return null;
    }

    return {
      id: chat.chatId,
      title: chat.title || '',
      userId: chat.userId,
      createdAt: chat.createdAt || new Date(),
      messages: chat.messages ? JSON.parse(chat.messages) : [],
      path: chat.path || `/dashboard/chat/${chat.chatId}`
    } as Chat;
  } catch (error) {
    console.error('Error getting chat from database:', error);
    return null;
  }
}

/**
 * Delete a chat from PostgreSQL database
 */
export async function deleteChatFromDB(chatId: string, userId: string) {
  try {
    await db.chat.deleteMany({
      where: {
        chatId,
        userId
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting chat from database:', error);
    return { success: false, error };
  }
}

/**
 * Clear all chats for a user from PostgreSQL database
 */
export async function clearChatsFromDB(userId: string) {
  try {
    await db.chat.deleteMany({
      where: {
        userId
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error clearing chats from database:', error);
    return { success: false, error };
  }
}

/**
 * Get chat info by chat ID
 */
export async function getChatInfoById(chatId: string, userId: string) {
  return await getChatFromDB(chatId, userId);
}

/**
 * Delete a chat channel (alias for deleteChatFromDB)
 */
export async function deleteChatChannel(chatId: string, userId: string) {
  return await deleteChatFromDB(chatId, userId);
}

/**
 * Clear chat history for a user (alias for clearChatsFromDB)
 */
export async function clearChatHistory(userId: string) {
  return await clearChatsFromDB(userId);
}

/**
 * Get chat info (alias for getChatsFromDB)
 */
export async function getChatInfo(userId: string) {
  return await getChatsFromDB(userId);
}