const inquirer = require("inquirer");

const viewRole = (connection, runSearch) => {
  const query = "SELECT role.id, role.title AS 'Title', role.salary AS 'Salary', department.name AS 'Department' FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.title ASC";
  connection.query(query, (err, res) => {
      console.table(res);
      runSearch();
  });
};

const addRole = (connection, runSearch) => {

const query = "SELECT name FROM department ORDER BY name ASC";
connection.query(query, (err, res) => {
  var depts = [];
  const roleQuery = [
    {
      name: "title",
      type: "input",
      message: "Enter Role Title: "
    },
    {
      name: "salary",
      type: "input",
      message: "Enter Salary: "
    },
    {
      name: "dept",
      type: "list",
      message: "What department does this role belong to?",
      choices: depts
    }
  ]
  for (var i = 0; i < res.length; i++) {
    depts.push(res[i]);
  }
  inquirer
    .prompt(roleQuery)
    .then(({ title, salary, dept }) => { 
      if (!title || !salary || (isNaN(salary)) || !dept) {
        console.log("Missing information or salary not a number. Role not added.");
        runSearch();
      } else {
        const query = "SELECT id FROM department WHERE ?";
        connection.query(query, { name: dept }, (err, res) => {
          const query = "INSERT INTO role SET ?";
          connection.query(query,
            {
              title: title,
              salary: salary,
              department_id: res[0].id
            },
            (err, res) => {
              if (err) throw err;
              console.log(`Role ${title} inserted.`);
              runSearch();
            });
        });
      }
    });
});
}

const delRole = (connection, runSearch) => {
  const query = "SELECT title FROM role";
  connection.query(query, (err, res) => {
    if (res.length === 0) {
      console.log("No roles available to delete.")
      runSearch();
    } else {
      const titles = [];
      for (var i = 0; i < res.length; i++) {
        titles.push(res[i].title);
      }
      titles.push("Cancel");
      inquirer
        .prompt({
          name: "role",
          type: "list",
          message: "Select a Role. All related records will be deleted. Select 'Cancel' to quit.",
          choices: titles
        })
        .then(({ role }) => {
          if (role === "Cancel") {
            console.log("Deletion canceled.");
            runSearch();
          } else {
            var query = "DELETE FROM role WHERE ?";
            connection.query(query,
              { title: role },
              (err, res) => {
                if (err) throw err;
                console.log(`${role} deleted.`);
                runSearch();
              });
          }
        });
      }
    });
}
const updateRole = (connection, runSearch) => {
const query = "SELECT title FROM role ORDER BY title ASC";
connection.query(query, (err, res) => {
  const roles = [];
  for (var i = 0; i < res.length; i++) {
    roles.push(res[i].title);
  }
  inquirer
    .prompt({
      name: "role",
      type: "list",
      message: "What role would you like to update?",
      choices: roles
    })
    .then(({ role }) => {
      inquirer
        .prompt([{
          name: "newRole",
          type: "input",
          message: `Update the title for ${role}: `
        },
        {
          name: "newSalary",
          type: "input",
          message: `Update the salary for ${role}: `
        }]).then(({ newSalary, newRole }) => {
          const query = "SELECT title, salary FROM role WHERE ?";
          connection.query(query, { title: role }, (err, res) => {
            if (!newSalary)  {
              console.log("Salary will stay the same. No new information was entered.") ;
              newSalary = res[0].salary;
            }
            if (isNaN(newSalary)) {
              console.log("Salary will stay the same. There was a non-number input.")
              newSalary = res[0].salary;
            }
            if (!newRole) {
              newRole = res[0].title;
            }
            var query = "UPDATE role SET ? WHERE ?";
            connection.query(query,
              [{ title: newRole, salary: newSalary }, { title: role }],
              (err, res) => {
                if (err) throw err;
                console.log(`${role} updated.`);
                runSearch();
              });
          });
        });
    });
});
}

module.exports = {
  viewRole, addRole, updateRole, delRole
}