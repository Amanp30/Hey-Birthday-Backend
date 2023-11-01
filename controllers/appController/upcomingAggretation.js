const { ObjectId } = require("mongodb");
const { CustomError } = require("../../CustomError");
const {
  EventsCollection,
  UpcomingBirthdayCollection,
  BirthdaysCollection,
} = require("../../db");

exports.upcomingBirthdays = async (
  id,
  session,
  message = "Some error occurred"
) => {
  try {
    const date = new Date();
    const today = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    console.log({ month, today });

    const todaysBirthdays = {
      todaybday: [
        {
          $match: {
            "dob.date": today,
            "dob.month": month,
            userid: new ObjectId(id),
          },
        },
        { $sort: { important: -1, firstName: 1 } },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
          },
        },
      ],
    };

    const upcomingBdays = {
      upcomingbday: [
        {
          $match: {
            userid: new ObjectId(id),
          },
        },
        {
          $addFields: {
            todayDate: date,
            dateToCompare: {
              $dateFromParts: {
                year: year,
                month: "$dob.month",
                day: "$dob.date",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $gt: ["$dateToCompare", "$todayDate"],
            },
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            relationship: 1,
            dob: 1,
            important: 1,
            dateToCompare: 1,
            daysLeft: {
              $dateDiff: {
                startDate: "$todayDate",
                endDate: "$dateToCompare",
                unit: "day",
              },
            },
          },
        },
        { $sort: { dateToCompare: 1, firstName: 1, important: -1 } },
        { $limit: 15 },
      ],
    };

    const atozList = {
      atoz: [
        {
          $match: {
            userid: new ObjectId(id),
          },
        },
        {
          $group: {
            _id: {
              $substr: ["$firstName", 0, 1],
            },
            docs: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $group: {
            _id: null,
            atoz: {
              $push: {
                letter: "$_id",
                docs: "$docs",
              },
            },
          },
        },
        {
          $project: {
            atoz: 1,
            _id: 0,
          },
        },
      ],
    };

    const agg = [
      {
        $facet: {
          ...upcomingBdays,
          ...todaysBirthdays,
          ...atozList,
        },
      },
    ];

    const cursor = EventsCollection.aggregate(agg, { session: session });
    const result = await cursor.toArray();

    console.log("Aggregation Result:", result[0]);
    const atozUpdate = result[0].atoz[0] ? result[0].atoz[0] : { atoz: [] };

    await BirthdaysCollection.updateOne(
      { userid: new ObjectId(id) },
      { $set: atozUpdate },
      { session: session }
    );

    await UpcomingBirthdayCollection.updateOne(
      { userid: new ObjectId(id) },
      {
        $set: {
          upcomingbday: result[0].upcomingbday,
          todaybday: result[0].todaybday,
        },
      },
      { session: session }
    );
  } catch (error) {
    console.error("Error during aggregation and update:", error);
    throw new CustomError(message);
  }
};
