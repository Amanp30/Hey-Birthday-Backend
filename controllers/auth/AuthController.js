const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const { CustomError } = require("../../CustomError");
const TimestampData = require("../../utilities/Timestamps");
const bcrypt = require("bcrypt");

const {
  UserCollection,
  client,
  BirthdaysCollection,
  UpcomingBirthdayCollection,
  ListsCollection,
  EventsCollection,
} = require("../../db");
const validateEmail = require("../../utilities/validation/validateEmail");
const validatePassword = require("../../utilities/validation/validatePassword");
const verifyPassword = require("../../utilities/Accounts");
const generateToken = require("../../utilities/Accounts/JWTToken");
const { upcomingBirthdays } = require("../appController/upcomingAggretation");

exports.SignUpController = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    const session = client.startSession();

    try {
      if (error) throw error;

      await session.withTransaction(async () => {
        const data = JSON.parse(fields.data);
        const userEmail = data.email.toLowerCase().trim();
        const userPassword = data.password.trim();

        // Validate email and password
        validateEmail(userEmail);
        validatePassword(userPassword);

        // Check if user already exists
        const isUserExist = await UserCollection.findOne({
          email: userEmail,
        });

        if (isUserExist) {
          throw new CustomError(
            "User with this email already exists. Try with another email."
          );
        }

        const hashedPassword = await bcrypt.hash(userPassword, 10);

        const userData = {
          email: userEmail,
          password: hashedPassword,
          firstName: "",
          lastName: "",
          dob: { date: Number(), month: Number(), year: Number() },
          accountStatus: "active",
          profilePicture: "/profile/dummy-avatar.jpg",
          country: "",
          mobno: { country: "", code: "", mobileno: "" },
          preferences: {
            theme: "Dark",
          },
        };

        // Add timestamps
        TimestampData(userData);

        // Insert user data
        const userDetails = await UserCollection.insertOne(userData, {
          session,
        });

        console.log(userDetails);

        const birthdays = await BirthdaysCollection.insertOne(
          {
            userid: new ObjectId(userDetails.insertedId),
            atoz: [],
          },
          { session }
        );
        const upcomingAggretation = await UpcomingBirthdayCollection.insertOne(
          {
            userid: new ObjectId(userDetails.insertedId),
            upcomingbday: [],
            todaybday: [],
          },
          { session }
        );

        res.status(201).json({
          message: "Account created successfully.",
          userData,
        });

        await session.commitTransaction();
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

exports.LoginController = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (error, fields) => {
    const session = client.startSession();

    try {
      if (error) throw error;

      await session.withTransaction(async () => {
        const userEmail = fields.email.toLowerCase().trim();
        const enteredPassword = fields.password.trim();

        // Find the user by email
        const user = await UserCollection.findOne(
          { email: userEmail },
          { session: session }
        );

        if (!user) {
          throw new CustomError("User not found", 401);
        }

        // Verify the entered password with the hashed password in the database
        const isPasswordValid = await verifyPassword(
          enteredPassword,
          user.password
        );

        if (!isPasswordValid) {
          throw new CustomError("Invalid password", 401);
        }

        // Password is valid, generate a JWT token
        const token = generateToken({
          userId: user._id,
        });

        console.log("the login user id is ", user._id);
        await upcomingBirthdays(user._id, session, "Login failed");

        // Respond with the JWT token and user data
        res.status(200).json({
          message: "Login successful.",
          token,
          theme: user.preferences.theme,
          userid: user._id,
          profilePicture: user.profilePicture,
          name: user.firstName,
          country: user.country,
          // user,
        });

        await session.commitTransaction();
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

exports.deleteAccount = async (req, res, next) => {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const userID = new ObjectId(req.params.userid);
      const thesession = { session: session };

      await UserCollection.deleteOne({ _id: userID }, thesession);
      await ListsCollection.deleteOne({ userid: userID }, thesession);
      await EventsCollection.deleteOne({ userid: userID }, thesession);
      await BirthdaysCollection.deleteOne({ userid: userID }, thesession);
      await UpcomingBirthdayCollection.deleteOne(
        { userid: userID },
        thesession
      );

      await session.commitTransaction();
      res.json({ message: "Account Deleted" });
    });
  } catch (error) {
    if (session.inTransaction()) {
      session.abortTransaction();
    }

    next(error);
  } finally {
    session.endSession();
  }
};
