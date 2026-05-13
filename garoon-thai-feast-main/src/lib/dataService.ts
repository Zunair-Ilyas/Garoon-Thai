import { supabase } from '@/integrations/supabase/client';
import { cacheManager, CACHE_TTL, CACHE_KEYS } from './cache';
export const menuService = {
  async getMenuItems(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.MENU_ITEMS;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.LONG });
    return data;
  },
  async getCategories(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.MENU_CATEGORIES;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.LONG });
    return data;
  },
  invalidateCache() {
    cacheManager.remove(CACHE_KEYS.MENU_ITEMS);
    cacheManager.remove(CACHE_KEYS.MENU_CATEGORIES);
  },
};
export const articlesService = {
  async getPublishedArticles(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.ARTICLES_PUBLISHED;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.LONG });
    return data;
  },
  async getAllArticles(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.ARTICLES;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.MEDIUM });
    return data;
  },
  async getArticleById(id: string, forceRefresh = false) {
    const cacheKey = `article_${id}`;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.LONG });
    return data;
  },
  invalidateCache() {
    cacheManager.invalidate(/^article/);
  },
};
export const contactService = {
  async getContactInfo(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.CONTACT_INFO;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.VERY_LONG });
    return data;
  },
  async submitMessage(name: string, email: string, message: string) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message }]);
    if (error) throw error;
    return data;
  },
  invalidateCache() {
    cacheManager.remove(CACHE_KEYS.CONTACT_INFO);
  },
};
export const newsletterService = {
  async subscribe(email: string) {
    const { data, error } = await supabase
      .from('member_subscriptions')
      .insert([{ email, is_subscribed: true }]);
    if (error) throw error;
    this.invalidateCache();
    return data;
  },
  async getSubscribers(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.MEMBER_SUBSCRIPTIONS;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('member_subscriptions')
      .select('*')
      .eq('is_subscribed', true)
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.MEDIUM });
    return data;
  },
  invalidateCache() {
    cacheManager.remove(CACHE_KEYS.MEMBER_SUBSCRIPTIONS);
  },
};
export const profileService = {
  async getProfiles(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.PROFILES;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    cacheManager.set(cacheKey, data, { ttl: CACHE_TTL.MEDIUM });
    return data;
  },
  invalidateCache() {
    cacheManager.remove(CACHE_KEYS.PROFILES);
  },
};
export const statsService = {
  async getStats(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.STATS;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }
    const [menuItems, articles, subscribers, profiles] = await Promise.all([
      supabase.from('menu_items').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('member_subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ]);
    const stats = {
      menuItems: menuItems.count || 0,
      articles: articles.count || 0,
      subscribers: subscribers.count || 0,
      profiles: profiles.count || 0
    };
    cacheManager.set(cacheKey, stats, { ttl: CACHE_TTL.SHORT });
    return stats;
  },
  invalidateCache() {
    cacheManager.remove(CACHE_KEYS.STATS);
  },
};
