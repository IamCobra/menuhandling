
use postgres;

create table Dishes(
Id serial primary KEY,
Name VARCHAR(20),
Available BOOLEAN,
Price NUMERIC(5,2)
);

