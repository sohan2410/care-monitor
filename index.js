const express = require("express");
const app = express();
const port = 8100 || process.env.PORT;
const fs = require("fs");
var moment = require("moment-timezone");
app.use(express.json());

app.get("/calc", (req, res) => {
  // reading clinical_metrics.json using fs
  fs.readFile("./clinical_metrics.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    //storing data in file variable
    var file = JSON.parse(jsonString);

    //storing heart rate data in data variable
    const data = file.clinical_data.HEART_RATE.data;

    // a result variable to calculate min and max measurement withing 15 minutes time interval
    var result = [];

    //first taking 0th index of on_date
    var j = 0;
    //runing a for loop from index 1 to length-1
    for (var i = 1; i < data.length; i++) {
      var a = data[j].on_date,
        b = data[i].on_date;

      //calculating time difference using moment-timezone
      const difference = moment(b, "YYYY-MM-DDTHH:mm:ss.Z").diff(
        moment(a, "YYYY-MM-DDTHH:mm:ss.Z")
      );

      if (difference > 900000) {
        //storing from_date to_date to find low and high measurement
        const myArray = data.slice(j, i);

        //function to find min value
        var low = Math.min.apply(
            null,
            myArray.map(function (item) {
              return item.measurement;
            })
          ),
          //function to find max value
          high = Math.max.apply(
            null,
            myArray.map(function (item) {
              return item.measurement;
            })
          );

        //pushing the required value in result
        result.push({
          from_date: a,
          to_date: data[i - 1].on_date,
          measurement: { low, high },
        });
        j = i + 1;
        i = i + 2;
      }
    }
    //sending file and result as object
    res.send({
      ...file,
      data: result,
    });
  });
});

app.listen(port, () => {
  console.log(`Running on port ${port} `);
});
