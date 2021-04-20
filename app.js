require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
var cors = require("cors");
app.use(cors());
const mysqlConfig = require("./config/database");
const connection = mysql.createPool(mysqlConfig);

app.use(express.json());

//AUTH
app.get("/test_auth", authToken, async (req, res) => {
  res.send(req.user);
});

app.post("/login", async (req, res) => {
  if (!req.body.password || !req.body.login) return res.status(401).send();

  /* const login = req.body.login;
 
  const accessToken = generateAccessToken(user);
  //const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  res.json({ accessToken: accessToken });
*/

  connection.getConnection(function (error, con) {
    try {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "select * from teachers where login = '" + req.body.login + "'",
          async (error, rows, fields) => {
            con.release();
            if (rows) {
              if (
                await bcrypt.compare(req.body.password, rows[0]["password"])
              ) {
                var user = {
                  login: req.body.login,
                  password: req.body.password,
                  id_teacher: rows[0]["id_teacher"],
                };
                const accessToken = generateAccessToken(user);
                res.json({
                  teacher: rows[0],
                  accessToken: accessToken,
                });
              }
            }
          }
        );
      }
    } catch (err) {
      console.log("I can't connect to database");
    }
  });

  /*
    client
      .query("select id, password from users where login = " + "'" + login + "'")
      .then(async (results) => {
        if (results.rowCount != 0) {
          if (await bcrypt.compare(password, results.rows[0]["password"])) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            res.json({
              user_id: results.rows[0]["id"],
              auth_key: hashedPassword,
            });
          } else {
            res.status(401).send();
          }
        } else {
          res.status(401).send();
        }
      });
  */
});

function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);

    req.user = user;
    next();
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15111s",
  });
}
//AUTH

app.post("/assigned_students", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from assigned_students", function (
          error,
          rows,
          fields
        ) {
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/groups", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from groups", function (
          error,
          rows,
          fields
        ) {
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/students", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from students", function (
          error,
          rows,
          fields
        ) {
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/practice_results", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from practice_results", function (
          error,
          rows,
          fields
        ) {
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/organizations", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from organizations", function (
          error,
          rows,
          fields
        ) {
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/teachers", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "select id_teacher, full_name_teacher, phone_teacher from teachers",
          function (error, rows, fields) {
            con.release();
            res.json(rows);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/terms_n_types", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from terms_n_types", function (
          error,
          rows,
          fields
        ) {
          for (var i = 0; i < rows.length; i++) {
            var date = new Date(rows[i]["date_start"]);
            var month = date.getMonth();
            var day = date.getDate().toString();
            month += 1;
            month = month.toString();

            if (month.length == 1) {
              month = "0" + month.toString();
            }

            if (day.length == 1) {
              day = "0" + day;
              console.log(day);
            }
            rows[i]["date_start"] =
              date.getFullYear() + "-" + month + "-" + day;
          }
          for (var i = 0; i < rows.length; i++) {
            var date = new Date(rows[i]["date_end"]);
            var month = date.getMonth();
            var day = date.getDate().toString();
            month += 1;
            month = month.toString();

            if (month.length == 1) {
              month = "0" + month.toString();
            }

            if (day.length == 1) {
              day = "0" + day;
              console.log(day);
            }
            rows[i]["date_end"] = date.getFullYear() + "-" + month + "-" + day;
          }
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/visits", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("select * from visits", function (
          error,
          rows,
          fields
        ) {
          con.release();
          for (var i = 0; i < rows.length; i++) {
            var date = new Date(rows[i]["visit_date"]);
            var month = date.getMonth();
            var day = date.getDate().toString();
            month += 1;
            month = month.toString();

            if (month.length == 1) {
              month = "0" + month.toString();
            }

            if (day.length == 1) {
              day = "0" + day;
              console.log(day);
            }
            rows[i]["visit_date"] =
              date.getFullYear() + "-" + month + "-" + day;
          }
          console.log(rows);
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/visits_chart", authToken, async (req, res) => {
  try {
    const months = [2, 3, 4];
    const visits = [0, 0, 0];
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "select * from visits where id_teacher = " + req.user.id_teacher,
          function (error, rows, fields) {
            con.release();
            for (var i = 0; i < rows.length; i++) {
              console.log(new Date(rows[i]["visit_date"]).getMonth() + 1);
              switch (new Date(rows[i]["visit_date"]).getMonth() + 1) {
                case months[0]:
                  visits[0]++;
                  break;
                case months[1]:
                  visits[1]++;
                  break;
                case months[2]:
                  visits[2]++;
                  break;
              }
            }

            res.json(visits);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/students_left", authToken, async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        console.log(req.body);
        var sqlString =
          "SELECT * FROM assigned_students left join visits on assigned_students.id_student = visits.id_student where assigned_students.id_rukovod_col =";
        if (req.body.id_teacher !== undefined) {
          sqlString += req.body.id_teacher;
        } else {
          sqlString += req.user.id_teacher;
        }
        connection.query(sqlString, function (error, rows, fields) {
          var left = 0;
          for (var i = 0; i < rows.length; i++) {
            if (!rows[i]["visit_date"]) {
              left++;
            }
          }

          console.log({
            left: left,
            visited: rows.length - left,
          });
          con.release();
          res.json({
            left: left,
            visited: rows.length - left,
          });
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/full_student_info", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "SELECT * FROM ((assigned_students inner join students on assigned_students.id_student = students.id_student) inner join organizations on assigned_students.id_organization = organizations.id_organization) where students.group_ =" +
            '"' +
            req.body.group +
            '"',
          function (error, rows, fields) {
            con.release();
            res.json(rows);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/all_groups", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "SELECT group_ FROM students group by group_",
          function (error, rows, fields) {
            con.release();
            res.json(rows);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/students_of_teacher", authToken, async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        if (req.body.id_teacher) {
          connection.query(
            "SELECT * FROM assigned_students inner join teachers on teachers.id_teacher = assigned_students.id_rukovod_col inner join students on students.id_student = assigned_students.id_student inner join organizations on organizations.id_organization = assigned_students.id_organization left  join visits on visits.id_student = students.id_student where teachers.id_teacher = " +
              req.body.id_teacher,
            function (error, rows, fields) {
              con.release();
              res.json(rows);
            }
          );
        } else {
          connection.query(
            "SELECT * FROM assigned_students inner join teachers on teachers.id_teacher = assigned_students.id_rukovod_col inner join students on students.id_student = assigned_students.id_student inner join organizations on organizations.id_organization = assigned_students.id_organization left  join visits on visits.id_student = students.id_student where teachers.id_teacher = " +
              req.user.id_teacher,
            function (error, rows, fields) {
              con.release();
              res.json(rows);
            }
          );
        }
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/register", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "SELECT * FROM teachers where login = '" + req.body.login + "'",
          function (error, rows, fields) {
            console.log(req.body);
            if (Object.keys(rows).length === 0) {
              connection.query(
                "SELECT * FROM register_codes where code = '" +
                  req.body.code +
                  "'",
                async function (error, rows, fields) {
                  if (rows.length == 1) {
                    console.log("success");
                    const hashedPassword = await bcrypt.hash(
                      req.body.password,
                      10
                    );
                    connection.query(
                      `Insert into teachers (login, password,phone_teacher,otdel, avatar_url,full_name_teacher) values ('${req.body.login}','${hashedPassword}',${req.body.phone_teacher},'${req.body.otdel}','${req.body.avatar_url}', '${req.body.full_name_teacher}')`,
                      function (error, rows, fields) {
                        console.log(error);
                        res.sendStatus(200);
                      }
                    );
                  }
                }
              );
            }
            con.release();
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/profile", authToken, async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          "SELECT * FROM teachers where id_teacher= " + req.user.id_teacher,
          function (error, rows, fields) {
            con.release();

            res.json(rows);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/profile_save", authToken, async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query(
          `update teachers set full_name_teacher = '${req.body.full_name_teacher}', phone_teacher = ${req.body.phone_teacher}, otdel = '${req.body.otdel}', about = '${req.body.about}', avatar_url = '${req.body.avatar_url}' where id_teacher = ${req.user.id_teacher} `,
          function (error, rows, fields) {
            con.release();
            if (!error) res.status(200).send();
            else res.status(401).send();
            console.log(error);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/all_teachers", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        connection.query("SELECT * FROM teachers", function (
          error,
          rows,
          fields
        ) {
          con.release();
          res.json(rows);
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/filtered_visits", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
      } else {
        var condition = "";
        console.log(req.body.group);
        if (req.body.group && req.body.group != "") {
          condition += " where students.group_ = '" + req.body.group + "'";
        } else if (req.body.teacher && req.body.teacher != "") {
          condition +=
            " where teachers.full_name_teacher = '" + req.body.teacher + "'";
        }
        console.log(
          "SELECT visits.visit_date, teachers.full_name_teacher, teachers.avatar_url, teachers.id_teacher,visits.note, students.full_name_student,students.id_student FROM teachers inner JOIN visits on visits.id_teacher = teachers.id_teacher inner JOIN students on visits.id_student =students.id_student" +
            condition
        );
        connection.query(
          "SELECT visits.visit_date, teachers.full_name_teacher,teachers.avatar_url, teachers.id_teacher,visits.note, students.full_name_student,students.id_student FROM teachers inner JOIN visits on visits.id_teacher = teachers.id_teacher inner JOIN students on visits.id_student =students.id_student" +
            condition,
          function (error, rows, fields) {
            for (var i = 0; i < rows.length; i++) {
              var date = new Date(rows[i]["visit_date"]);
              var month = date.getMonth();
              var day = date.getDate().toString();
              month += 1;
              month = month.toString();

              if (month.length == 1) {
                month = "0" + month.toString();
              }

              if (day.length == 1) {
                day = "0" + day;
                console.log(day);
              }
              rows[i]["visit_date"] =
                date.getFullYear() + "-" + month + "-" + day;
            }
            con.release();
            res.json(rows);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

/////////////////////////////////////////////TABLES CHANGE///////////////////////////////////////////
app.post("/insert", async (req, res) => {
  try {
    const jsonObj = JSON.parse(JSON.stringify(req.body))["rows"];
    var sqlString = "";
    var sqlVars = "";
    for (var key in jsonObj) {
      if (jsonObj.hasOwnProperty(key)) {
        if (jsonObj[key].length > 0) {
          if (key.includes("phone") || key.includes("id")) {
            sqlVars += jsonObj[key] + ",";
          } else {
            sqlVars += "'" + jsonObj[key] + "',";
          }

          sqlString += key + ",";
        }
      }
    }
    sqlVars = sqlVars.substring(0, sqlVars.length - 1);
    sqlString = sqlString.substring(0, sqlString.length - 1);

    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query(
          "insert into " +
            req.body.table +
            "(" +
            sqlString +
            ") values (" +
            sqlVars +
            ")",
          function (error, result) {
            console.log(
              "insert into " +
                req.body.table +
                "(" +
                sqlString +
                ") values (" +
                sqlVars +
                ")"
            );
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.status(200).send();
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/delete", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        console.log(
          `delete from ${req.body.table} where ${req.body.id} = '${req.body.value}'`
        );
        connection.query(
          `delete from ${req.body.table} where ${req.body.id} = '${req.body.value}'`,
          function (error, rows, fields) {
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.status(200).send();
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/update", async (req, res) => {
  try {
    const jsonObj = JSON.parse(JSON.stringify(req.body))["rows"];
    var sqlString = "";
    for (var key in jsonObj) {
      if (jsonObj.hasOwnProperty(key)) {
        console.log(key);
        if (jsonObj[key].length > 0) {
          sqlString += key + "='" + jsonObj[key] + "',";
        }
      }
    }

    sqlString = sqlString.substring(0, sqlString.length - 1);

    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query(
          `update ${req.body.table} set ${sqlString} where ${req.body.id} = ${req.body.value} `,
          function (error, result) {
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.status(200).send();
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/delete", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        console.log(
          `delete from ${req.body.table} where ${req.body.id} = '${req.body.value}'`
        );
        connection.query(
          `delete from ${req.body.table} where ${req.body.id} = '${req.body.value}'`,
          function (error, rows, fields) {
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.status(200).send();
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/reviews", authToken, async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query("select * from reviews", function (
          error,
          rows,
          fields
        ) {
          con.release();
          if (error) {
            console.log(error);
            res.status(500).send();
          } else {
            console.log(rows);
            res.json(rows);
          }
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/teachers_ids", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query(
          "select id_teacher, full_name_teacher from teachers",
          function (error, rows, fields) {
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/insert_review", async (req, res) => {
  try {
    console.log(req.body.review);
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query(
          `insert into reviews (review, mark, date,id_student, id_organization) values('${req.body.review.review}',${req.body.review.mark},'${req.body.review.date}',${req.body.review.id_student},${req.body.review.id_organization}) `,
          function (error, rows, fields) {
            con.release();
            if (error) {
              res.status(500).send();
            } else {
              res.json(rows);
              console.log(rows);
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.post("/organization_ids", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query(
          "select id_organization, organization from organizations",
          function (error, rows, fields) {
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.json(rows);
              console.log(rows);
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/students_ids", async (req, res) => {
  try {
    connection.getConnection(function (error, con) {
      if (!!error) {
        con.release();
        res.status(500).send();
      } else {
        connection.query(
          "select id_student, full_name_student from students",
          function (error, rows, fields) {
            con.release();
            if (error) {
              console.log(error);
              res.status(500).send();
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});
app.listen(3333);
