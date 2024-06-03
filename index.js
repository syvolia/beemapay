const express = require("express");

const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const Transaction = require("./models/transactionModel");

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`app is running on localhost:${port}`);
});
mongoose
  .connect("mongodb+srv://beemapaysy:josephsy27@cluster0.wwcjrpz.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("connected to db successfully"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Testing API
app.get('/getIntroMessage', (req, res) => res.json({message: 'Welcome to Beempay API!'}));

//STEP 1 getting access token

const getAccessToken = async (req, res, next) => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
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

  const shortCode = process.env.MPESA_PAYBILL;

  const validation = process.env.VALIDATION_URL;
  const confirmation = process.env.CONFIRMATION_URL;


  await axios
    .post(
      " https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl",
      {
        ShortCode: shortCode,
        ResponseType: "Completed",
        ConfirmationURL: confirmation ,
        ValidationURL: validation ,

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
const apiAuthorize = async () => {

  let consumerkey = process.env.CONSUMERKEY;
  let consumersecret = process.env.CONSUMERSECRET;



  try {
    const response = await axios.post(
      " https://test.hallopay.co.ke/api/v2/token",
      {
        consumerkey: consumerkey,
        consumersecret: consumersecret,
    
      },
   
    );

    console.log("+++++++++++++++++++++=====>>>:::",response);
    return response;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}
//mobileno carrier check
const checkCarrier = async (req_data) => {
  console.log("testing carrier");
  console.log(req_data);
  console.log("+++++++++++++++====>>>>",req_data);
  // const recipients = [];
  var phoneNumber = req_data.recipient;
  console.log(phoneNumber);

  let Twilioaccountsid = process.env.TWILIO_ACCOUNT_SID;
  let Twilioauthtoken= process.env.TWILIO_AUTH_TOKEN;
  const accountSid = Twilioaccountsid;
  const authToken = Twilioauthtoken;
  const client = require('twilio')(accountSid, authToken);

  client.lookups.v2.phoneNumbers(phoneNumber)
  .fetch({ type: ['carrier'] })
  .then(phone_number => {
    console.log('phone_number')
     console.log(phone_number) // All of the carrier info.
    // console.log(phone_number.carrier.name) // Just the carrier name.
    return phone_number.carrier.name;
  });
  if (phone_number.carrier.name="Safaricom") {
    return "SAFCOM";
} else if (phone_number.carrier.name="Airtel") {
    return "AIRTEL";
} else if (phone_number.carrier.name="Telkom") {
    return "TELKOM";
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
  var amount = req_data;
  // recipients.push(recipient);
  console.log(amount);
var token = apiAuthorize();
console.log(token)

  try {
    const response = await axios.post(
      " https://test.hallopay.co.ke/api/v2/transact",
      {
        clientCode: "1003",
        transactionID: Date.now(),
        serviceCode: "SAFCOM",
        accountNumber: checkCarrier(req_data),
        amount: amount,
        apiKey: "23dec805f3846ffe346cf475ed47ff52b1b7f4504865dc410156bdf060bbbfd8"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          
          "Authorization": "bearer"+ token

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
const confirmation = process.env.CONFIRMATION_URL;
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
    checkCarrier(req_data)
  .then((responseData) => {
    console.log(responseData);
    res.status(200).json("ok");
  })
  .catch((error) => {
    console.log(error);
    res.status(400).json(error);
  });

})})


