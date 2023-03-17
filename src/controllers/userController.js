const jwt = require("jsonwebtoken");
const encrypt = require("../Encryption/Encrypt");
const validate = require("../validation/validator");
const userModel = require("../models/userModel");

//---------------------------------------------------------------------------------------
const createUser = async function (req, res) {
  try {
    const requestBody = req.body;
    const { title, name, email, password, address } = requestBody;
    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide user details",
      });
      return;
    }

    if (!validate.isValid(title)) {
      res.status(400).send({ status: false, message: "Title is required" });
      return;
    }

    if (!validate.isValidTitle(title)) {
      res.status(400).send({
        status: false,
        message: `Title should be among Mr, Mrs, Miss`,
      });
      return;
    }

    if (!validate.isValid(name)) {
      res.status(400).send({ status: false, message: `name is required` });
      return;
    }

    if (!validate.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }
    if (!validate.validateEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }
    const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property

    if (isEmailAlreadyUsed) {
      res.status(400).send({
        status: false,
        message: `${email} email address is already registered`,
      });
      return;
    }

    if (!validate.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }
    if (!validate.validatePassword(password)) {
      res.status(400).send({
        status: false,
        message: "password should be between 8 and 15 characters",
      });
      return;
    }
    const hashPassword = await encrypt.hashPassword(password);
    requestBody.password = hashPassword;

    if (address) {
      if (!validate.isValidRequestBody(address)) {
        res
          .status(400)
          .send({ status: false, message: "Please provide address details" });
        return;
      }

      if (address.pincode) {
        if (typeof requestBody.address.pincode != "number")
          return res.status(400).send({
            status: false,
            message: `pincode of address should be number`,
          });
      }
    }
    const createUserData = await userModel.create(req.body);
    res.status(201).send({
      status: true,
      msg: "successfully created",
      data: createUserData,
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};
//---------------------------------------------------------------------------------------------------------------//

const loginUser = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login details",
      });
      return;
    }

    // Extract params
    let { email, password } = requestBody;

    // Validation
    if (!validate.isValid(email) && !validate.isValid(password)) {
      res
        .status(400)
        .send({
          status: false,
          message: `Email and password both are required`,
        });
      return;
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      res
        .status(401)
        .send({ status: false, message: `Invalid login credentials` });
      return;
    }
    const comparePassword = await encrypt.comparePassword(
      password,
      user.password
    );

    if (!comparePassword) {
      res
        .status(401)
        .send({ status: false, message: `Invalid login credentials` });
      return;
    }
    const token = await jwt.sign(
      {
        userId: user._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1800,
      },
      "calladomeAssing"
    );

    res.header("x-api-key", token);
    res.status(200).send({ status: true, message: `user login successfully` });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const logOutUser = async function (req, res) {
  try {
    const tokenUserId = req.userId;
    const token = await jwt.sign(
      {
        userId: tokenUserId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1, //new token generate with 1sec exp time
      },
      "calladomeAssing"
    );

    res.header("x-api-key", token);
    res.status(200).send({ status: true, message: `user logOut` });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const changeUserPassword = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide details",
      });
      return;
    }

    // Extract params
    let { email, password, newPassword } = requestBody;

    // Validation starts
    if (!validate.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!validate.validateEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }

    if (!validate.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }

    const user = await userModel.findOne({ email });
    console.log(user.password);
    const comparePassword = await encrypt.comparePassword(
      password,
      user.password
    );

    if (!comparePassword) {
      res.status(401).send({
        status: false,
        message: `Invalid user credentials, Can't change password `,
      });
      return;
    }
    const hashNewPassword = await encrypt.hashPassword(newPassword);

    const changePassword = await userModel.findOneAndUpdate(
      { email: email },
      { password: hashNewPassword }
    );
    res
      .status(200)
      .send({ status: true, message: `changed user password successfully` });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const resetUserPassword = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide details",
      });
      return;
    }

    // Extract params
    const { email } = requestBody;

    // Validation starts
    if (!validate.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      res.status(401).send({ status: false, message: `Invalid user email..` });
      return;
    }
    const token = await jwt.sign(
      {
        userId: user._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1800,
      },
      "resetPassWordToken"
    );

    res.header("x-api-key", token);
    res
      .status(200)
      .send({
        status: true,
        message: `reset password token velid for only 30 minutes `,
      });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
const updateUserpassword = async function (req, res) {
  try {
    const tokenUserId = req.userId;
    const requestBody = req.body;
    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide valid details",
      });
      return;
    }

    // Extract params
    const userId = req.param.userId;
    const { newPassword } = requestBody;

    // Validation starts
    if (!validate.isValid(userId)) {
      res.status(400).send({ status: false, message: `userId is required` });
      return;
    }

    if (!validate.isValid(newPassword)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }
    if (!validate.validatePassword(newPassword)) {
      res.status(400).send({
        status: false,
        message: "password should be between 8 and 15 characters",
      });
      return;
    }

    if (tokenUserId !== userId) {
      res.status(400).send({ status: false, message: `unauthorised user` });
      return;
    }
    // Validation ends
    const hashNewPassword = await encrypt.hashPassword(newPassword);

    const user = await userModel.findOneAndUpdate(
      { email: email },
      { password: hashNewPassword }
    );
    res
      .status(200)
      .send({ status: true, message: `user password updated successfully` });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports = {
  createUser,
  loginUser,
  logOutUser,
  changeUserPassword,
  resetUserPassword,
  updateUserpassword,
};
