import type { Project } from '../schema';

const modules = import.meta.glob<{ default: Project }>(['./*.ts', '!./index.ts'], { eager: true });

/** Every project file in this folder, keyed by slug. */
export const projects: Record<string, Project> = Object.fromEntries(
	Object.values(modules).map((m) => [m.default.slug, m.default])
);
