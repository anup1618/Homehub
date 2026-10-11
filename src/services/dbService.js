import { supabase, isLiveMode } from './supabase.js';
import { properties as defaultProperties } from '../data/properties.js';

export const dbService = {
  /**
   * Fetch all properties from Supabase or default catalog
   */
  async getProperties() {
    if (isLiveMode) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          // Normalize column names if needed
          return data.map(p => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            priceFormatted: p.price_formatted || `$${Number(p.price).toLocaleString()}`,
            location: p.location,
            city: p.city,
            neighborhood: p.neighborhood,
            beds: p.beds,
            baths: p.baths,
            sqft: p.sqft,
            lotSize: p.lot_size,
            type: p.type,
            status: p.status,
            tag: p.tag,
            description: p.description,
            mainImage: p.main_image,
            gallery: p.gallery || [],
            amenities: p.amenities || [],
            specifications: p.specifications || {}
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch properties from Supabase, using local catalog:', err);
      }
    }

    return defaultProperties;
  },

  /**
   * Save a newly listed property
   */
  async createProperty(propertyData, userId = null) {
    if (isLiveMode) {
      try {
        const row = {
          id: 'prop-' + Date.now(),
          title: propertyData.title || propertyData.address,
          price: propertyData.price || 15000000,
          price_formatted: propertyData.priceFormatted || `$${(propertyData.price || 15000000).toLocaleString()}`,
          location: propertyData.address + (propertyData.city ? `, ${propertyData.city}` : ''),
          city: propertyData.city || 'Los Angeles',
          neighborhood: propertyData.city || 'Bel Air',
          beds: propertyData.beds || 5,
          baths: propertyData.baths || 6,
          sqft: propertyData.sqft || 7500,
          lot_size: propertyData.lotSize || '1.0 Acre',
          type: propertyData.type || 'Villa',
          status: 'Active',
          description: propertyData.description || 'Exclusive luxury architectural estate.',
          main_image: propertyData.mainImage || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
          amenities: propertyData.amenities || [],
          created_by: userId
        };

        const { data, error } = await supabase
          .from('properties')
          .insert([row])
          .select();

        if (error) throw error;
        return data?.[0] || row;
      } catch (err) {
        console.warn('Supabase createProperty error, fallback to local:', err);
      }
    }

    // Fallback: local memory
    return {
      id: 'prop-' + Date.now(),
      title: propertyData.title || propertyData.address,
      ...propertyData
    };
  },

  /**
   * Fetch user favorites from Supabase
   */
  async getUserFavorites(userId) {
    if (!userId) return null;

    if (isLiveMode) {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', userId);

        if (error) throw error;
        return data.map(item => item.property_id);
      } catch (err) {
        console.warn('Supabase fetch favorites error:', err);
      }
    }

    return null;
  },

  /**
   * Add a property to user favorites
   */
  async addFavorite(userId, propertyId) {
    if (!userId) return;

    if (isLiveMode) {
      try {
        const { error } = await supabase
          .from('favorites')
          .upsert([{ user_id: userId, property_id: propertyId }], { onConflict: 'user_id,property_id' });

        if (error) throw error;
      } catch (err) {
        console.warn('Supabase add favorite error:', err);
      }
    }
  },

  /**
   * Remove a property from user favorites
   */
  async removeFavorite(userId, propertyId) {
    if (!userId) return;

    if (isLiveMode) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: userId, property_id: propertyId });

        if (error) throw error;
      } catch (err) {
        console.warn('Supabase remove favorite error:', err);
      }
    }
  },

  /**
   * Book a private tour in Supabase
   */
  async bookTour(tourDetails, userId = null) {
    if (isLiveMode) {
      try {
        const row = {
          user_id: userId || null,
          property_id: tourDetails.propertyId || 'prop-bel-air-1240',
          property_title: tourDetails.propertyTitle || 'Luxury Estate Showing',
          full_name: tourDetails.name || 'Private Guest',
          email: tourDetails.email,
          phone: tourDetails.phone || null,
          tour_date: tourDetails.date || new Date().toISOString().split('T')[0],
          tour_time: tourDetails.time || '14:00',
          tour_type: tourDetails.type || 'VIP In-Person Showing',
          notes: tourDetails.notes || '',
          status: 'confirmed'
        };

        const { data, error } = await supabase
          .from('booked_tours')
          .insert([row])
          .select();

        if (error) throw error;
        return data?.[0] || row;
      } catch (err) {
        console.warn('Supabase bookTour error:', err);
      }
    }

    return tourDetails;
  },

  /**
   * Fetch tours for authenticated user
   */
  async getUserTours(userId) {
    if (!userId) return [];

    if (isLiveMode) {
      try {
        const { data, error } = await supabase
          .from('booked_tours')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Supabase getUserTours error:', err);
      }
    }

    return [];
  }
};
