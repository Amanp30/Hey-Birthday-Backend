const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const { CustomError } = require("../../CustomError");
const { EventsCollection, ListsCollection, client } = require("../../db");
const {
  generateUniqueCode,
} = require("../../utilities/Functions/generateUniqueCodes");
const { upcomingBirthdays } = require("../appController/upcomingAggretation");
const TimestampData = require("../../utilities/Timestamps");
const isEmpty = require("is-empty");

exports.getListData = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.params.userid);
    const query = { userid: userId };

    const aggregationPipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: "$relationship",
          docs: {
            $push: "$$ROOT",
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const eventList = await EventsCollection.aggregate(
      aggregationPipeline
    ).toArray();

    res.json(eventList);
  } catch (error) {
    next(error);
  }
};

exports.newListData = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    if (error) {
      return next(error);
    }

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const userID = req.params.userid;
        const onlyDOBandNAME = Boolean(
          JSON.parse(fields.otherdata).onlynameordob
        );
        let uniqueCode, isAlready;

        do {
          uniqueCode = generateUniqueCode(8);
          isAlready = await ListsCollection.findOne({ code: uniqueCode });
        } while (isAlready);

        const AllObjectIDS = JSON.parse(fields.ids).map(
          (item) => new ObjectId(item)
        );

        const selectedFields = {
          firstName: 1,
          lastName: 1,
          dob: 1,
          _id: 0,
          important: { $literal: false },
          relationship: "Others",
          mobno: {
            code: "",
            country: "",
            mobileno: "",
          },
        };

        const projectQuery =
          onlyDOBandNAME === false
            ? {
                ...selectedFields,
                relationship: 1,
                mobno: 1,
                important: 1,
              }
            : selectedFields;

        const resultEvents = await EventsCollection.find(
          {
            _id: { $in: AllObjectIDS },
          },
          { session: session }
        )
          .project(projectQuery)
          .toArray();

        const data = {
          data: resultEvents,
          userid: new ObjectId(userID),
          name: JSON.parse(fields.otherdata).name,
          allowTimes: Number(JSON.parse(fields.otherdata).allowTimes),
          onlynameordob: onlyDOBandNAME,
          code: uniqueCode,
        };

        const result = await ListsCollection.insertOne(data, {
          session,
        });
        await session.commitTransaction();

        console.log(result);
        res.json({ message: "List created" });
      });
    } catch (error) {
      if (session.inTransaction()) {
        session.abortTransaction();
      }

      next(error);
    } finally {
      session.endSession();
    }
  });
};

exports.importListNow = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    if (error) {
      return next(error);
    }

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const code = req.params.code;
        const userID = req.params.userid;

        if (code.length !== 8) {
          throw new CustomError("Code length must be 8 characters.");
        }

        const resultData = await ListsCollection.findOne({ code: code });
        console.log("result code", resultData);
        if (!resultData) {
          throw new CustomError("Not a valid code or list deleted.");
        }

        if (resultData?.allowTimes === 0)
          throw new CustomError(
            "Importing the list failed because the limit has been exceeded"
          );

        if (isEmpty(resultData?.data))
          throw new CustomError("Data not in database");

        for (let i = 0; i < resultData?.data.length; i++) {
          const element = resultData?.data[i];
          element.userid = new ObjectId(userID);
          TimestampData(element);
          console.log({ fromloop: element });
        }
        await EventsCollection.insertMany(resultData.data, {
          session: session,
        });

        await upcomingBirthdays(
          userID,
          session,
          "Importing failed from aggregation"
        );

        const newAllowTimes = Number(resultData.allowTimes) - 1;

        console.log(newAllowTimes);
        console.log(resultData?._id);
        await ListsCollection.updateOne(
          { _id: resultData?._id },
          { $set: { allowTimes: newAllowTimes } }
        );

        await session.commitTransaction();

        res.json({ message: "Import done" });
      });
    } catch (error) {
      if (session.inTransaction()) {
        session.abortTransaction();
      }

      next(error);
    } finally {
      session.endSession();
    }
  });
};

exports.yourLists = async (req, res, next) => {
  try {
    const ListsResults = await ListsCollection.find({
      userid: new ObjectId(req.params.userid),
    })
      .project({ data: 0 })
      .toArray();

    res.json(ListsResults);
  } catch (error) {
    next(error);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const ListsResults = await ListsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ message: "List deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.increaseAllowLimit = async (req, res, next) => {
  try {
    console.log(req.params);
    const ListsResults = await ListsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { allowTimes: req.params.times } }
    );

    res.json({ message: "List deleted successfully." });
  } catch (error) {
    next(error);
  }
};
