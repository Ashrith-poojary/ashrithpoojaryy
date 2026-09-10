import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

/** Filter criteria supported by the game catalog query. */
export interface GameFilters {
    categoryIds?: number[];
    publisherId?: number;
}

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/**
 * Returns games matching the supplied category and publisher filters.
 *
 * @param db - The Drizzle database client.
 * @param filters - Optional category IDs and publisher ID to filter by.
 * @returns A promise that resolves to matching games ordered by title.
 */
export async function getGames(db: Database, filters: GameFilters = {}): Promise<Game[]> {
    const where = and(
        filters.categoryIds && filters.categoryIds.length > 0
            ? inArray(games.categoryId, filters.categoryIds)
            : undefined,
        filters.publisherId !== undefined ? eq(games.publisherId, filters.publisherId) : undefined,
    );
    const query = baseGamesQuery(db);
    const rows = where
        ? await query.where(where).orderBy(asc(games.title))
        : await query.orderBy(asc(games.title));

    return rows.map(mapGame);
}

/**
 * Returns all games ordered by title.
 *
 * @param db - The Drizzle database client.
 * @returns A promise that resolves to every game ordered by title.
 */
export async function getAllGames(db: Database): Promise<Game[]> {
    return getGames(db);
}

/**
 * Returns all game IDs ordered by their game title.
 *
 * @param db - The Drizzle database client.
 * @returns A promise that resolves to game IDs ordered by title.
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * Returns a single game by ID, or null when no game matches.
 *
 * @param db - The Drizzle database client.
 * @param id - The game ID to find.
 * @returns A promise that resolves to the matching game or null.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}
