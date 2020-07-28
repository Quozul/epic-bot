create database if not exists `epic-bot`;

use `epic-bot`;

drop table if exists `locked_voice_channel`;
create table if not exists `locked_voice_channel` (
    id varchar(18) primary key
);

-- unused
drop table if exists `time_spent_voice`;
create table if not exists `time_spent_voice` (
    user varchar(18),
    guild varchar(18),
    time datetime,
    action boolean, -- true for joined, false for left

    primary key(user, guild, time)
);

drop table if exists `messages_sent`;
create table if not exists `messages_sent` (
    user varchar(18),
    guild varchar(18),
    date date,
    amount int,

    primary key(user, guild, date)
);

drop table if exists `bot_interaction`;
create table if not exists `bot_interaction` (
    guild varchar(18),
    amount int,

    primary key(guild)
);

drop table if exists `guild_options`;
create table if not exists `guild_options` (
    guild varchar(18),
    name varchar(16),
    value varchar(16),
    
    primary key (guild, name)
);

drop table if exists `aliases`;
create table if not exists `aliases` (
    guild varchar(18),
    command varchar(64),
    alias varchar(32),
    
    primary key (guild, command)
);

-- unused
drop table if exists `disabled_commands`;
create table if not exists `disabled_commands` (
    guild varchar(18),
    command varchar(16),
    
    primary key (guild, command)
);

-- unused
drop table if exists `disabled_events`;
create table if not exists `disabled_events` (
    guild varchar(18),
    event varchar(16),
    
    primary key (guild, event)
);

-- unused
drop table if exists `playlist`;
create table if not exists `playlist` (
    guild varchar(18),
    id int auto_increment,
    url varchar(128),
    name varchar(128),
    
    primary key (guild, id)
);

drop table if exists `guild`;
create table if not exists `guild` (
    guild varchar(18) primary key,
    joined datetime default now(),
    status char(1) default 'i'
);