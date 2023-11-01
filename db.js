const { MongoClient } = require("mongodb");
const { MONGO_URI } = require("./ConfigVariables");

const client = new MongoClient(MONGO_URI);
const dbName = "birthday-reminder";

const db = client.db(dbName);

const collections = {
  user: "users",
  eventdata: "eventdatas",
  birthdays: "birthdays",
  upcomingbirthdays: "upcomingbirthdays",
  lists: "lists",
};

// collections
const UserCollection = db.collection(collections.user);
const EventsCollection = db.collection(collections.eventdata);
const BirthdaysCollection = db.collection(collections.birthdays);
const UpcomingBirthdayCollection = db.collection(collections.upcomingbirthdays);
const ListsCollection = db.collection(collections.lists);

module.exports = {
  client,
  UserCollection,
  EventsCollection,
  BirthdaysCollection,
  UpcomingBirthdayCollection,
  ListsCollection,
};
