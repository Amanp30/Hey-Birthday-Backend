const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const { CustomError } = require("../../CustomError");
const {
  UserCollection,
  EventsCollection,
  BirthdaysCollection,
  client,
  UpcomingBirthdayCollection,
} = require("../../db");
const { capitalizeFirstLetter } = require("../../utilities/Functions");
const TimestampData = require("../../utilities/Timestamps");
const { upcomingBirthdays } = require("./upcomingAggretation");

exports.getAccountSettings = async (req, res, next) => {
  try {
    const AccountID = req.params.id;

    const result = await UserCollection.findOne(
      {
        _id: new ObjectId(AccountID),
      },
      {
        projection: {
          password: 0, // Exclude the password field
          accountStatus: 0, // Exclude the accountStatus field
        },
      }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateAccountDetails = (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    try {
      if (error) throw error;
      const AccountID = req.params.id;

      const data = JSON.parse(fields.data);
      TimestampData(data);
      delete data._id;

      data.firstName = capitalizeFirstLetter(data?.firstName.trim());
      data.lastName = capitalizeFirstLetter(data?.lastName.trim());
      data.dob = {
        date: Number(data?.dob?.date),
        month: Number(data?.dob?.month),
        year: Number(data?.dob?.year),
      };

      console.log(data);
      const result = await UserCollection.updateOne(
        {
          _id: new ObjectId(AccountID),
        },
        {
          $set: data,
        }
      );

      res.json({
        message: "Details updated.",
      });
    } catch (error) {
      next(error);
    }
  });
};

exports.newBirthday = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    if (error) return next(error);

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const { id } = req.params;
        const data = JSON.parse(fields.data);

        TimestampData(data);
        delete data._id;

        data.firstName = capitalizeFirstLetter(data?.firstName);
        data.lastName = capitalizeFirstLetter(data?.lastName);
        data.userid = new ObjectId(id);
        data.dob = {
          date: Number(data?.dob?.date),
          month: Number(data?.dob?.month),
          year: Number(data?.dob?.year),
        };

        await EventsCollection.insertOne(data, { session });

        await upcomingBirthdays(id, session, "Adding birthday failed");
        await session.commitTransaction();

        res.json({
          message: `${data?.firstName}'s birthday Added.`,
          result: data,
        });
      });
    } catch (error) {
      console.error(error);

      if (session.inTransaction()) session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  });
};

exports.getOneBirthday = async (req, res, next) => {
  try {
    const theID = req.params.id;

    const result = await EventsCollection.findOne(
      {
        _id: new ObjectId(theID),
      },
      {
        projection: {
          password: 0, // Exclude the password field
          accountStatus: 0, // Exclude the accountStatus field
        },
      }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateOneBirthday = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const theID = req.params.id;
        const userID = req.params.userid;
        const data = JSON.parse(fields.data);

        delete data._id;
        delete data.userid;

        data.firstName = capitalizeFirstLetter(data?.firstName);
        data.lastName = capitalizeFirstLetter(data?.lastName);
        data.dob = {
          date: Number(data?.dob?.date),
          month: Number(data?.dob?.month),
          year: Number(data?.dob?.year),
        };

        const result = await EventsCollection.updateOne(
          { _id: new ObjectId(theID) },
          { $set: data },
          { session: session }
        );

        await upcomingBirthdays(userID, session, "Update failed");

        await session.commitTransaction();

        res.json({ message: "Birthday details updated." });
      });
    } catch (error) {
      console.error(error);
      if (session.inTransaction()) {
        session.abortTransaction();
      }
      return next(error);
    } finally {
      session.endSession();
    }
  });
};

exports.deleteOneBirthday = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const theID = req.params.id;
        const userID = req.params.userid;

        const result = await EventsCollection.deleteOne(
          { _id: new ObjectId(theID), userid: new ObjectId(userID) },
          { session: session }
        );

        console.log(result);

        await upcomingBirthdays(userID, session, "Delete failed");

        await session.commitTransaction();

        res.json({ message: "Birthday deleted." });
      });
    } catch (error) {
      console.error(error);

      if (session.inTransaction()) {
        session.abortTransaction();
      }

      next(error);
    } finally {
      session.endSession();
    }
  });
};

exports.getBirthdayList = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.params.userid); // Convert user ID to ObjectId
    const query = { userid: userId }; // Define the query
    const birthdayList = await BirthdaysCollection.find(query).toArray(); // Retrieve the birthday list
    console.log(birthdayList);

    res.json(birthdayList); // Send the list as a JSON response
  } catch (error) {
    next(error); // Handle any errors by passing them to the next middleware
  }
};

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.params.userid);
    const query = { userid: userId };
    const birthdayList = await UpcomingBirthdayCollection.find(query).toArray();
    console.log(birthdayList);

    res.json(birthdayList);
  } catch (error) {
    next(error);
  }
};
