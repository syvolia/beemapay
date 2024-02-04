const express = require("express");

const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const Transaction = require("./models/transactionModel");

const port = 8001;

app.listen(port, () => {
  console.log(`app is running on localhost:${port}`);
});
mongoose
  .connect("mongodb+srv://beemapaysy:josephsy27@cluster0.wwcjrpz.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("whats the problem honey"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


//Testing API
app.get('/getIntroMessage', (req, res) => res.json({message: 'Welcome to Beempay API!'}));

//STEP 1 getting access token

const getAccessToken = async (req, res, next) => {
  const key = "A4oazZ3YiyDbWywHLFxW0eJfGPKoVw7i";
  const secret = "36YRbv2OXll5Nkmh";
  const auth = new Buffer.from(`${key}:${secret}`).toString("base64");

  await axios
    .get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )
    .then((res) => {
      //   resp.status(200).json(res.data);
      token = res.data.access_token;
       console.log(token);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

//STEP 2 //registerUrl
app.post("/registerUrl", getAccessToken, async (req, res) => {
  console.log("testing register");
  const shortCode = "8889900";


  const validation = "https://plankton-app-xqfhf.ondigitalocean.app/validation";
  const confirmation = "https://plankton-app-xqfhf.ondigitalocean.app/confirmation";



  await axios
    .post(
      " https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl",
      {
        ShortCode: "8889900",
        ResponseType: "Completed",
        ConfirmationURL: "https://plankton-app-xqfhf.ondigitalocean.app/confirmation" ,
        ValidationURL: "https://plankton-app-xqfhf.ondigitalocean.app/validation" ,

      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((resp) => {
      res.json(resp.data);
      const data = resp.data;
      console.log(resp.data);
    })
    .catch((err) => {
      res.json(err);
      console.log(err.message);
    });
});
function checkKenyanCarrier(phoneNumber) {
  // Define regular expressions for Safaricom, Airtel, and Orange
  console.log("testing phoneNumber");
  const safaricomRegex = /^(?:\+254|254|0)((1|7)(?:(?:[0-9][0-9])|(?:[0-9][0-9][0-9]))[0-9]{6})$/;
  const airtelRegex = /^(?:254|\+254|0)?(7(?:(?:[3][0-9])|(?:5[0-6])|(8[0-9]))[0-9]{6})$/;
  const orangeRegex = /^(?:254|\+254|0)?(77[0-6][0-9]{6})$/;

  // Test the phone number against each regex
  if (safaricomRegex.test(phoneNumber)) {
      return "Safaricom";
  } else if (airtelRegex.test(phoneNumber)) {
      return "Airtel";
  } else if (orangeRegex.test(phoneNumber)) {
      return "Orange";
  } else {
      return "Unknown Carrier";
  }
}
// a function to send airtime
const sendAirtime = async (req_data) => {
    console.log("testing airtime");
    console.log(req_data);
    console.log("+++++++++++++++====>>>>",req_data);
    // const recipients = [];
    // var recipient = req_data;
    // recipients.push(recipient);
    let amount = req_data.amount;
    let mobileno = req_data.recipient
    console.log(amount)
    console.log(recipient);
    const phoneCarrier = checkKenyanCarrier(mobileno)
   

    try {
      const response = await axios.post(
        "https://lotuseastafrica.com:2053/v3/airtimebuypinless",
        {
          username: "beema",
          operator: phoneCarrier,
          amount: amount,
          mobileno: mobileno,
          key: "LqGXKsR9j5f64VWAz44iwoIPpSiBW3uXfaFUgZh9kgM"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("+++++++++++++++++++++=====>>>:::",response.data);
      return response.data;
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }
//STEP 3 confirmation url
const confirmation = "https://plankton-app-xqfhf.ondigitalocean.app/confirmation";
app.post(`/confirmation`, (req, res) => {
  console.log("am testing new changes")
  console.log(res)
  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
  console.log(req)
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>req.body",req.body)
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:::::::::::req.body.Body",req.body.Body)
  //if (!req.body.Body.stkCallback.CallbackMetadata) {
   // console.log(req.body.Body.stkCallback.ResultDesc);
    //res.status(200).json("ok");
   // return;
  //}
  console.log(">>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
  const amount = req.body.TransAmount;
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>amount",amount)
  const code = req.body.TransID;
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>code",code)
  const phone1 = req.body.BillRefNumber;

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>,phone1",phone1)
  const phone = phone1;
  // saving the transaction to db
  console.log({
    phone,
    code,
    amount,
  });
  const transaction = new Transaction();

transaction.customer_number = phone;
transaction.mpesa_ref = code;
transaction.amount = amount;

transaction
  .save()
  .then((data) => {
    console.log({ message: "transaction saved successfully", data });
    var req_data = {
      recipient: transaction.customer_number,
      amount: transaction.amount
    };
   sendAirtime(req_data)
  .then((responseData) => {
    console.log(responseData);
    res.status(200).json("ok");
  })
  .catch((error) => {
    console.log(error);
    res.status(400).json(error);
  });

})})
