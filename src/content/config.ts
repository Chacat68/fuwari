import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const friendsCollection = defineCollection({
	schema: z.object({
		name: z.string(),
		url: z.string().url(),
		avatar: z.string().url(),
		description: z.string(),
		order: z.number().optional().default(0),
	}),
});

const projectsCollection = defineCollection({
	schema: z.object({
		name: z.string(),
		url: z.string().url(),
		cover: z.string().url(),
		description: z.string(),
		order: z.number().optional().default(0),
	}),
});

const specCollection = defineCollection({
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
	}),
});

const momentsCollection = defineCollection({
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		updated: z.date().optional(),
		order: z.number().optional().default(0),
		image: z.string().optional(),
	}),
});

export const collections = {
	posts: postsCollection,
	friends: friendsCollection,
	projects: projectsCollection,
	spec: specCollection,
	moments: momentsCollection,
};
