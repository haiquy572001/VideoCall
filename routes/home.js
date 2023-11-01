const express = require("express");
const router = express.Router();
var apn = require("node-apn");
var fcm = require("fcm-notification");
var Key = "./AuthKey_WGJWF4XLKG.p8";
var FCM = new fcm("./serviceAccount.json");

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

router.post("/initiate-call", (req, res) => {
  const { user, hasVideo, type } = req.body;
  if (user && hasVideo && type) {
    if (user.platform === "iOS") {
      let deviceToken = user.APN;
      var options = {
        token: {
          key: Key,
          keyId: "WGJWF4XLKG",
          teamId: "GKAD59KHHF",
        },
        production: false,
      };

      var apnProvider = new apn.Provider(options);

      var note = new apn.Notification();

      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.badge = 1;
      note.sound = "ping.aiff";
      // note.alert = "You have a new message";
      note.priority = 10;
      note.pushType = "voip";
      note.payload = {
        aps: {
          content_available: 1,
          "mutable-content": 1,
          priority: "high",
        },
        custom: {
          callerName: user.deviceName,
          uuid: user.userId,
          handle: user.userId.split("-")[0],
          type: type,
          hasVideo: "true",
          token: user.token,
        },
      };
      note.topic = "com.sucodev.template.voip";

      apnProvider.send(note, deviceToken).then((result) => {
        if (result.failed && result.failed.length > 0) {
          console.log("RESULT", result.failed[0].response);
          res.status(400).send(result.failed[0].response);
        } else {
          res.status(200).send(result);
        }
      });
    } else if (user.platform === "ANDROID") {
      const FCMtoken = user.token;

      const message = {
        data: {
          uuid: user.userId,
          callerName: user.deviceName,
          handle: user.userId.split("-")[0],
          handleType: "number",
          hasVideo: hasVideo.toString(),
          type: type,
        },
        token: FCMtoken,
        webpush: {
          headers: {
            Urgency: "high",
          },
        },
        android: {
          priority: "high",
        },
      };

      FCM.send(message, function (err, response) {
        if (err) {
          res.status(400).send(response);
        } else {
          res.status(200).send(response);
        }
      });
    }
  }
});
router.post("/update-call", (req, res) => {
  const { callerInfo, type } = req.body;

  const message = {
    data: {
      uuid: callerInfo.uuid,
      callerName: callerInfo.callerName,
      handle: callerInfo.handle,
      handleType: "number",
      hasVideo: callerInfo.hasVideo.toString(),
      type: type,
    },
    token: callerInfo.token,
    webpush: {
      headers: {
        Urgency: "high",
      },
    },
    android: {
      priority: "high",
    },
  };

  console.log(message);

  FCM.send(message, function (err, response) {
    if (err) {
      res.status(400).send(response);
    } else {
      res.status(200).send(response);
    }
  });
});

module.exports = router;
