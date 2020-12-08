const Database = require('./Database');
const conn = new Database()

const dateFormat = require('dateformat');
const fn = require('./functions');

let obj = {};

const userTableName = process.env.USER_TABLE_NAME;

obj.verifyToken = async (token, socket) => {
    let userData = await conn.query("SELECT t1.auth_key,t1.id,t1.email from " + userTableName + " as t1 WHERE t1.auth_key='" + token + "' LIMIT 1");

    if (!fn.isEmpty(userData)) {
        checkUserToken = await conn.query("select id from socket_users where token='" + token + "'");
        if (fn.isEmpty(checkUserToken)) {
            await conn.query("Insert into socket_users(token,socket_id,date_created) values('" + token + "','" + socket.id + "','" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "')");
        }
        else {
            await conn.query("update socket_users set socket_id='" + socket.id + "' where token='" + token + "'");
        }
        return userData[0];
    }
    return false;
}

obj.userList = (data, callback) => {
    conn.query("select (select t5.date_created from chat as t5 where (sender_id=t1.id and t5.receiver_id='" + data.userId + "') or (sender_id='" + data.userId + "' and t5.receiver_id=t1.id) order by date_created DESC LIMIT 1) as last_chat,IF(t2.id,'ONLINE','OFFLINE') as is_online,(select COUNT(*) from chat where sender_id=t1.id and receiver_id='" + data.userId + "' and is_seen=0) as unread_message,t1.*,t2.socket_id from " + userTableName + " as t1 left join socket_users as t2 on t2.token=t1.auth_key where t1.id!='" + data.userId + "' and t1.email!='' order by FIELD(is_online,'ONLINE','OFFLINE'),unread_message DESC,last_chat DESC").then((userList) => {
        callback(userList);
    });
}

obj.userChatInput = (data, callback) => {
    let date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    conn.query("select t1.socket_id from socket_users as t1 join " + userTableName + " as t2 on t2.auth_key=t1.token where t2.id='" + data.receiverId + "' LIMIT 1").then((userdata) => {

        conn.query("insert into chat(sender_id, receiver_id, message, date_created) values('" + data.senderId + "', '" + data.receiverId + "', '" + data.message + "', '" + date + "')").then((data1) => {
            // console.log(data1.insertId);
            callback(null, { id: data1.insertId, senderId: data.senderId, receiverId: data.receiverId, date_created: date, message: data.message, toSocket: userdata[0].socket_id });
            //callback(data);
        }).catch((err) => {
            callback(err, null);
        });
    }).catch((err) => {
        callback(err, null);
    });

}

obj.seenMessage = (data) => {
    conn.query("update chat set is_seen='1' where sender_id='" + data.senderId + "' and receiver_id = '" + data.receiverId + "'");
}

obj.userChatList = (data, callback) => {
    conn.query("select t1.id,t1.message,t1.date_created,t1.receiver_id as receiverId,t1.sender_id as senderId from chat as t1 where (t1.sender_id='" + data.senderId + "' and t1.receiver_id='" + data.receiverId + "') or (t1.sender_id='" + data.receiverId + "' and t1.receiver_id='" + data.senderId + "') order by t1.date_created desc LIMIT 50").then((data1) => {
        conn.query("update chat set is_seen='1' where receiver_id='" + data.senderId + "' and sender_id='" + data.receiverId + "'").then(() => {
            callback(data1);
        });

    });
}

obj.deleteUserToken = (socket, callback) => {
    conn.query("delete from socket_users where socket_id='" + socket.id + "'").then((data) => {
        if (callback) {
            callback(data);
        }
    });
}

module.exports = obj;