CREATE TABLE `amenities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spot_id` text,
	`water` integer DEFAULT false,
	`shade` integer DEFAULT false,
	`flat_ground` integer DEFAULT false,
	`cell_signal` integer DEFAULT false,
	`fire_pit` integer DEFAULT false,
	`pet_friendly` integer DEFAULT false,
	`toilet` integer DEFAULT false,
	`electricity` integer DEFAULT false,
	`wifi` integer DEFAULT false,
	FOREIGN KEY (`spot_id`) REFERENCES `spots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`spot_id` text,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`spot_id`) REFERENCES `spots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spots` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`type` text DEFAULT 'wild' NOT NULL,
	`region` text NOT NULL,
	`image_url` text,
	`average_rating` real DEFAULT 0,
	`reviews_count` integer DEFAULT 0,
	`status` text DEFAULT 'pending',
	`legal_status` text DEFAULT 'tolerated',
	`risk_level` text DEFAULT 'low',
	`created_at` integer,
	`created_by` text
);
