const eventModel = require("../models/eventModel");
const validate = require("../validation/validator");

//const createEvent= async (req, res) => {
const createEvent = async function (req, res) {
  try {
    const requestBody = req.body;
    
    if (!validate.isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide Eventdetails",
        });
      return;
    }
    const { eventTitle, eventName, invitedUsers, userId } = requestBody;
    // Validation starts
    if (!validate.isValid(eventTitle)) {
      res
        .status(400)
        .send({ status: false, message: "eventTitle is required" });
      return;
    }
    if (!validate.isValid(eventName)) {
        res
          .status(400)
          .send({ status: false, message: "eventName is required" });
        return;
      }
    
    if (!validate.isValid(invitedUsers)) {
      res
        .status(400)
        .send({ status: false, message: "invitedUsers is required" });
      return;
    }
    
    // Validation ends
    const eventData = await eventModel.create({
        eventTitle, eventName, invitedUsers,createdBy:userId
    });
    res
      .status(201)
      .send({
        status: true,
        message: " EventCreated Successfully",
        data: eventData,
      });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};
//---------------------------------------- get events ----------------------------------------------------------//
const geteventsByUserID = async function (req, res) {
  try {
    const userIdFromToken = req.userId
    const filterQuery = { isDeleted: false ,createdBy:userIdFromToken };
    const queryParams = req.query;
    const { sort,eventName } = queryParams;
    if (validate.isValid(eventName)) {
      filterQuery["eventName"] = eventName;
    }
    const events = await eventModel
      .find(filterQuery)
      .sort({ eventTitle: sort?sort:1 })
      .select(
        "_id eventTitle invitedUsers eventName "
      );
    if (Array.isArray(events) && events.length === 0) {
      res.status(404).send({ status: false, message: "No events found" });
      return;
    }

    res.status(200).send({ status: true, message: "Eventlist", data: events });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
//----------------------------------------------Eventdetails by id------------------------------------------------//

const inviteEventDetails = async function (req, res) {
  try {
    const userIdFromToken = req.userId

    let eventData = await eventModel
      .find({ invitedUsers: userIdFromToken, isDeleted: false })
      .select({ _id:1, eventTitle: 1, eventName: 1, createdBy:1 });
    if (!eventData) {
      res
        .status(404)
        .send({
          status: false,
          msg: "Eventnot found for the requested eventId",
        });
    }
    console.log(eventData)
    res
      .status(200)
      .send({ status: true, message: "Success", data: eventData });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};


module.exports = { createEvent, geteventsByUserID, inviteEventDetails };
