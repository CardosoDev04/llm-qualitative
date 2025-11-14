-- Table Definition
CREATE TABLE "public"."descriptive_codes" (
    "category_id" text NOT NULL,
    "category_plain_text" text NOT NULL,
    "category_description" text NOT NULL
);

-- Table Definition
CREATE TABLE "public"."participants" (
    "participant_id" int4 NOT NULL,
    "participant_country" text NOT NULL,
    "participant_position" text NOT NULL,
    "participant_experience" text NOT NULL,
    PRIMARY KEY ("participant_id")
);

-- Table Definition
CREATE TABLE "public"."questions" (
    "question_id" text NOT NULL,
    "question_text" text NOT NULL,
    PRIMARY KEY ("question_id")
);

-- Table Definition
CREATE TABLE "public"."response_descriptive_coding" (
    "participant_id" int4 NOT NULL,
    "question_id" text NOT NULL,
    "original_response" text NOT NULL,
    "invivo_codes" text NOT NULL,
    "descriptive_ids" text NOT NULL
);