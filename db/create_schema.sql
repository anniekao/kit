drop table if exists users cascade;
drop table if exists social_media cascade;
drop table if exists user_social_url cascade;
drop table if exists network_event cascade;
drop table if exists user_event cascade;
drop table if exists contact cascade;

create table users
(
  id serial primary key not null,
  first_name varchar (255) not null,
  last_name varchar(255) not null,
  email varchar(255) not null,
  phone varchar(255) not null,
  occupation varchar(255) not null,
  bio text,
  qr_code varchar(255) not null,
  company varchar(255) not null
);

create table social_media
(
  id serial primary key not null,
  name varchar (255) not null
);

create table user_social_url
(
  id serial primary key not null,
  user_id integer references users(id) on delete cascade,
  social_media_id integer references social_media(id) on delete cascade,
  client_auth_id varchar (255)
);

create table network_event
(
  id serial primary key not null,
  name varchar (255) not null,
  location varchar (255) not null,
  date date not null,
  start_time time not null,
  end_time time not null
);

create table user_event
(
  id serial primary key not null,
  user_id integer references users(id) on delete cascade,
  network_event_id integer references network_event(id) on delete cascade
);

create table contact
(
  id serial primary key not null,
  user_id integer references users(id) on delete cascade,
  user_event_id integer references user_event(id) on delete cascade
);


