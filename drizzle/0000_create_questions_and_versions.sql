CREATE TABLE `question_versions` (
	`id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`version` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`locales` json NOT NULL,
	`config` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `question_versions_question_version` UNIQUE(`question_id`,`version`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` varchar(36) NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` varchar(64) NOT NULL,
	`locales` json NOT NULL,
	`draft_config` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `question_versions` ADD CONSTRAINT `question_versions_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE cascade ON UPDATE no action;