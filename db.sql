create database if not exists `epic-bot`;

use `epic-bot`;

create table if not exists `locked_voice_channel` (
    id varchar(18) primary key
);

create table if not exists `time_spent_voice` (
    user varchar(18),
    guild varchar(18),
    amount int,

    primary key(user, guild)
);

create table if not exists `messages_sent` (
    user varchar(18),
    guild varchar(18),
    amount int,

    primary key(user, guild)
);