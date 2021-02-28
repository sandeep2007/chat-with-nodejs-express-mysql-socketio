const mysql = require('mysql2');

const config = {
    host: process.env.HOST,
    user: process.env.USER_NAME,
    password: (process.env.PASSWORD !== 'null' && process.env.PASSWORD !== '' ? process.env.PASSWORD : ''),
    database: process.env.DATABASE
};

class Database {
    constructor(external_config) {
        if (external_config) {
            config = external_config
        }
        //Object.assign(config);
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

module.exports = Database