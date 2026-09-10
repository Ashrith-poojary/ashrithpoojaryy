/**
 * Category data-access helpers for the Tailspin Toys Crowd Funding platform.
 * Provides functions to retrieve category information from the database.
 */
import { asc } from 'drizzle-orm';
import type { Database } from './db';
import { categories } from '../../db/schema';
import type { Category } from '../types/game';

/**
 * Returns a list of all categories with their id and name.
 *
 * @param db - The Drizzle database client.
 * @returns A promise that resolves to an array of category objects.
 */
export async function getAllCategories(db: Database): Promise<Category[]> {
    return db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name));
}
