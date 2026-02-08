/**
 * Slug generation utilities for workspace names
 */

/**
 * Generate a URL-friendly slug from a workspace name
 * @param name - The workspace name
 * @returns A slugified version of the name
 * 
 * @example
 * generateSlug("My Cool Workspace") // "my-cool-workspace"
 * generateSlug("Out of the Blue!") // "out-of-the-blue"
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to a readable name (title case)
 * @param slug - The URL slug
 * @returns A human-readable name
 * 
 * @example
 * slugToName("my-cool-workspace") // "My Cool Workspace"
 * slugToName("out-of-the-blue") // "Out Of The Blue"
 */
export function slugToName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Ensure a slug is unique by appending a number if necessary
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 * 
 * @example
 * ensureUniqueSlug("my-workspace", ["my-workspace"]) // "my-workspace-2"
 * ensureUniqueSlug("my-workspace", ["my-workspace", "my-workspace-2"]) // "my-workspace-3"
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    if (!existingSlugs.includes(baseSlug)) {
        return baseSlug;
    }

    let counter = 2;
    let uniqueSlug = `${baseSlug}-${counter}`;

    while (existingSlugs.includes(uniqueSlug)) {
        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
    }

    return uniqueSlug;
}
