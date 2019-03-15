
const sql = require('sqlite3')
const db = new sql.Database('ratings.db');

db.serialize(() => {
    db.run('create table ratings (name TEXT, rating INT)');

    db.run('insert into ratings values ("ravi srinivasan", 1500)');
    db.run('insert into ratings values ("praney", 1600)');
    db.run('insert into ratings values ("saanvi", 1400)');

    db.each("select * from ratings", (err, row) => {
        console.log(row.name + ' has rating ' + row.rating);
    });
});
