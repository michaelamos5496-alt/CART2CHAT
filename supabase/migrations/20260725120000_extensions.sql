-- Extensions required by the OrderFlow schema.
-- pgcrypto provides gen_random_uuid(), used as the default for every primary key.
create extension if not exists pgcrypto with schema extensions;
