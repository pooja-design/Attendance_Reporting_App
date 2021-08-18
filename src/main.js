const express = require("express");//import express
const { dirname } = require("path");
const path = require("path"); // import path
const app = express();
const fs = require('fs');//import file server to work with file system.
const multer = require('multer');//import multer(multipart/form-data) for uploading data
const port = process.env.PORT || 8000;//assigning port number to host the website.

const hbs = require('hbs');
const mongoose = require("mongoose");// import mongoose
const excelToJson = require('convert-excel-to-json');//middle-ware used to convert excel file  to json
const { fileURLToPath } = require('url');//import url


//global variables
var username = 'NULL';
var uname = "NULL";
var attclass = [];
var get_results = [];

//importing connection and schemas from different modules which are exported.
require("./db/connection");
const Teacher = require('./models/teachers_login');
const Student = require('./models/students_login');
const Bds = require('./models/bds');
const Cns = require('./models/cns');
const Ses = require('./models/ses');

//assigning path of the directories which are required.
const file_path = path.join(__dirname, "..")
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));// to use static files like css.
app.use(
    express.urlencoded({// method to recognize incoming request object as string.
        extended: false//false: string or array (if true : any type)
    })
)
app.listen(port, () => { // used to bind and listen the connections on the specified host and port.
    console.log(`server running at ${port}`)
})

const schema = new mongoose.Schema({
    _id: String,
    name: String,
    status: [String]
}, { _id: false });

//set the paths
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get('/', (req, res) => { //request to home page
    res.render('home');
})

app.get('/home.hbs', (req, res) => {
    res.render('home');
})
app.get('/login.hbs', (req, res) => {
    res.render('login');
})
app.get('/student_view.hbs', async (req, res, next) => {
    var alldetails = [];
    var statusarr = [];
    var totclass = [];
    var subarr = ["BD", "CNS", "SE"];
    var perarr = []
    try {
        const tot1 = await Bds.aggregate([{ $match: { _id: uname } }, { $project: { count: { $size: "$status" } } }]);

        tot1.forEach((item) => {
            totclass.push(item.count);
        })

        const use1 = await Bds.aggregate([{ $match: { _id: uname } }, { $project: { status: { $size: { $filter: { input: "$status", as: "item", cond: { $eq: ["$$item", "p"] } } } } } }]);
        alldetails.push(use1);

        const tot2 = await Cns.aggregate([{ $match: { _id: uname } }, { $project: { count: { $size: "$status" } } }]);
        tot2.forEach((item) => {
            totclass.push(item.count);
        })


        const use2 = await Cns.aggregate([{ $match: { _id: uname } }, { $project: { status: { $size: { $filter: { input: "$status", as: "item", cond: { $eq: ["$$item", "p"] } } } } } }]);
        alldetails.push(use2);


        const tot3 = await Ses.aggregate([{ $match: { _id: uname } }, { $project: { count: { $size: "$status" } } }]);
        tot3.forEach((item) => {
            totclass.push(item.count);
        })

        const use3 = await Ses.aggregate([{ $match: { _id: uname } }, { $project: { status: { $size: { $filter: { input: "$status", as: "item", cond: { $eq: ["$$item", "p"] } } } } } }]);
        alldetails.push(use3);


        alldetails.forEach((i) => {
            i.forEach((j) => {
                let val = j.status;
                attclass.push(j.status);
                let newobj = { "Attended": val }
                // console.log(newobj)
                statusarr.push(newobj);
            })
        })

        for (i = 0; i < totclass.length; i++) {
            var per = attclass[i] / totclass[i] * 100;
            perarr.push(per.toFixed(2));
        }

        for (i = 0; i < statusarr.length; i++) {
            statusarr[i]["Subject"] = subarr[i];
            statusarr[i]["Total"] = totclass[i];
            statusarr[i]["Percentage"] = perarr[i];
        }
        // console.log(statusarr[i]["Subject"],statusarr[i]["Total"] );

        res.render("student_view", {
            obj: statusarr
        });
    }
    catch (error) {
        res.status(400).send(error);
    }
});
app.get('/teachers_view.hbs', async (req, res) => {
    const users = new mongoose.model(username, schema);
    // module.exports = users;
    //local variables
    var attendance = [];
    var present = [];
    let count = [];
    var results = [];
    let c = 1;
    try {
        // console.log(username)
        const x = await users.find({})//find all the info in users collection
        const y = await users.aggregate([{ $project: { status: { $size: "$status" } } }])//count total number of classes conducted
        const z = await users.aggregate([{ $project: { status: { $size: { $filter: { input: "$status", as: "item", cond: { $eq: ["$$item", "p"] } } } } } }])//total no of classes the student has attended
        z.forEach(element2 => {
            count.push(c)
            c += 1;
            present.push(element2.status);
        })
        y.forEach(element => {
            attendance.push(element.status);
            z.forEach(element2 => {
                if (element._id === element2._id) {
                    let result = (element2.status / element.status) * 100;// finding the percentage of attendance
                    results.push(result)
                }
            });
        });
        // console.log(results)

        res.render("teachers_view", {//used to render a view and sends the rendered string to the client.
            name: username,
            obj: x,
            result: results,
            attendance: attendance,
            present: present,
            count: count
        })
        get_results = results;
    }
    catch (error) {// any error catch it
        res.status(400).send(error);
    }
});

app.get('/teachers_view2.hbs', async (req, res) => {
    const users = new mongoose.model(username, schema);
    module.exports = users;
    var usn = [];
    var results = [];
    var attendance = [];
    try {
        const x = await users.find({})
        const y = await users.aggregate([{ $project: { status: { $size: "$status" } } }])
        const z = await users.aggregate([{ $project: { status: { $size: { $filter: { input: "$status", as: "item", cond: { $eq: ["$$item", "p"] } } } } } }])
        y.forEach(element => {
            attendance.push(element.status);
            z.forEach(element2 => {
                if (element._id === element2._id) {
                    let result = (element2.status / element.status) * 100;
                    if (result < 75) {
                        usn.push(element._id);
                        results.push(result);
                    }
                }
            });
        });

        res.render("teachers_view2", {
            name: username,
            result: results,
            usn: usn

        })
    }
    catch (error) {
        res.status(400).send(error);
    }
});

app.get('/teachers_chart.hbs', (req, res) => {
    var zero_20 = 0, twenty_40 = 0, forty_60 = 0, sixty_80 = 0, eighty_100 = 0;
    get_results.forEach(element => {
        if (element >= 0 && element <= 20) {
            zero_20 += 1;
        }
        else if (element > 20 && element <= 40) {
            twenty_40 += 1;
        }
        else if (element > 40 && element <= 60) {
            forty_60 += 1;
        }
        else if (element > 60 && element <= 80) {
            sixty_80 += 1;
        }
        else if (element > 80 && element <= 100) {
            eighty_100 += 1;
        }
    })
    res.render('teachers_chart', {
        name: username,
        first: zero_20,
        second: twenty_40,
        third: forty_60,
        fourth: sixty_80,
        fifth: eighty_100
    });
})

app.get('/teachers_view2.hbs', (req, res) => {
    res.render('teachers_view2');
})



app.get('/data.xlsx', (req, res) => {
    res.sendFile(file_path + '/Sample DB.xlsx');
})

app.post('/teacher', async (req, res) => { //teacher login authentication
    try {
        username = req.body.username;
        const password = req.body.password;
        const teacher = await Teacher.findOne({ username: username });
        if (teacher.username === username && teacher.password === password) {
            res.render('teachers_page');
        }
        else {
            res.render('login', {
                message: "Your password or username is Wrong!!"
            })
        }
    }
    catch (error) {
        res.render('login', {
            message: "User does not exists"
        })
    }
});
app.post('/student', async (req, res) => {
    try {
        uname = req.body.username;
        const password = req.body.password;
        const student = await Student.findOne({ username: uname });
        if (student.username === uname && student.password === password) {
            res.render('student_page')
        }
        else {
            res.render('login', {
                message: "Your password or username is Wrong!!"
            })
        }
    }
    catch (error) {
        res.render('login', {
            message: "User does not exists"
        })
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, file_path + '/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});
const upload = multer({ storage: storage });
app.post('/upload', upload.single("uploadfile"), (req, res) => {
    importExcelData2MongoDB(file_path + '/uploads/' + req.file.filename);
    res.render('teachers_page', {
        message: "Successfully Uploaded!"
    })
});

app.get('/pass.hbs', (req, res)=> {
    res.render('pass.hbs');
  })
  app.get('/teachers_pass.hbs', (req, res)=> {
    res.render('teachers_pass.hbs');
  })

  app.post("/change",async(req,res)=>{
      try {
          var stuname = req.body.stuname ;
          var newpass = req.body.newpassword ;
          var old_password=req.body.oldpsw;
          
          const student = await Student.findOne({ username: stuname });
          if (student.username === stuname && student.password === old_password) {
            var update= await Student.updateOne({username:stuname},{$set:{password:newpass}});
            console.log(update)
            
            res.render('pass.hbs',{
                message:"Password updated successfully"
            })
        }
        else{
            res.render('pass.hbs',{
                message1:"Username or password is wrong!"
            })
        }

      } catch (error) {
        res.render('pass.hbs',{
            message1:"Username or password is wrong"
        })
      }
  })

  app.post("/teachers_change",async(req,res)=>{
    try {
        var stuname = req.body.stuname ;
        var newpass = req.body.newpassword ;
        var old_password=req.body.oldpsw;

        const teacher = await Teacher.findOne({ username: stuname });
        if (teacher.username === stuname && teacher.password === old_password) {
          var update= await Teacher.updateOne({username:stuname},{$set:{password:newpass}});
          console.log(update)
          
          res.render('teachers_pass.hbs',{
              message:"Password updated successfully"
          })
      }
      else{
          res.render('teachers_pass.hbs',{
              message1:"Username or password is wrong!"
          })
      }

    } catch (error) {
      res.render('pass.hbs',{
          message1:"Username or password is wrong"
      })
    }
})


function importExcelData2MongoDB(filePath) {
    // -> Read Excel File to Json Data
    const excelData = excelToJson({
        source: fs.readFileSync(filePath),
        header: {
            rows: 1
        },
        columnToKey: {
            A: 'usn',
            B: 'name',
            C: 'status'
        }// fs.readFileSync return a Buffer
    });
    console.log(excelData);

    const users = new mongoose.model(username, schema);
    for (var i in excelData) {
        for (var j in excelData[i]) {
            console.log(excelData[i][j].name)
            users.updateOne({ _id: excelData[i][j].usn, name: excelData[i][j].name }, { $push: { status: excelData[i][j].status } }, { upsert: true }, (err, res) => {
                if (err) {
                    // console.log(err);
                }
            })
        }
    }
    fs.unlinkSync(filePath);
}