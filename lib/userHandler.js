
const Database = require('./Database');
const conn = new Database()

const dateFormat = require('dateformat');
const fn = require('./functions');

let obj = {};

const userTableName = process.env.USER_TABLE_NAME;
const encryptionKey = process.env.APP_SECRET_KEY;
const tokenColumn = process.env.USER_TOKEN_COLUMN;

obj.verifyToken = async (token, socket) => {
    let date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    let userData = await conn.query("SELECT t1.name,t1.image,'" + date + "' as last_seen,t1." + tokenColumn + ",t1.id,t1.email from " + userTableName + " as t1 WHERE t1." + tokenColumn + "='" + token + "' LIMIT 1");

    if (!fn.isEmpty(userData)) {
        checkUserToken = await conn.query("select id from socket_users where token='" + token + "'");
        if (fn.isEmpty(checkUserToken)) {
            await conn.query("Insert into socket_users(token,socket_id,date_created) values('" + token + "','" + socket.id + "','" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "')");
        }
        else {
            await conn.query("update socket_users set socket_id='" + socket.id + "' where token='" + token + "'");
        }
        obj.lastSeen(userData[0]['id'], 'LOGIN');
        return userData[0];
    }
    return false;
}

obj.userList = (data, callback) => {
    conn.query("select (select date_created from last_seen where user_id=t1.id order by date_created DESC LIMIT 1) as last_seen,(select t5.date_created from chat as t5 where (sender_id=t1.id and t5.receiver_id='" + data.userId + "') or (sender_id='" + data.userId + "' and t5.receiver_id=t1.id) order by date_created DESC LIMIT 1) as last_chat,IF(t2.id,'ONLINE','OFFLINE') as is_online,(select COUNT(*) from chat where sender_id=t1.id and receiver_id='" + data.userId + "' and is_seen=0) as unread_message,t1.id,t1.email,t1.name,t1.image,t2.socket_id from " + userTableName + " as t1 left join socket_users as t2 on t2.token=t1." + tokenColumn + " where t1.id!='" + data.userId + "' and t1.email!='' order by FIELD(is_online,'ONLINE','OFFLINE'),unread_message DESC,last_chat DESC").then((userList) => {
        callback(userList);
    });
}

obj.userChatInput = (data, callback) => {
    let date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    conn.query("select t1.socket_id from socket_users as t1 join " + userTableName + " as t2 on t2." + tokenColumn + "=t1.token where t2.id='" + data.receiverId + "' LIMIT 1").then((userdata) => {

        // conn.query(`insert into chat(sender_id, receiver_id, message, date_created) values('${data.senderId}', '${data.receiverId}', TO_BASE64(AES_ENCRYPT('${data.message.replace(/[']/g, "\\'")}', '${encryptionKey}')), '${date}')`).then((data1) => {
        //     // console.log(data1.insertId);
        //     callback(null, { id: data1.insertId, senderId: data.senderId, receiverId: data.receiverId, date_created: date, message: data.message, toSocket: userdata[0].socket_id });
        //     //callback(data);
        // }).catch((err) => {
        //     callback(err, null);
        // });
        //let message = base64encode(AES.encrypt(data.message, convertCryptKey(encryptionKey)));

        conn.query("insert into chat(sender_id, receiver_id, message, date_created) values(?,?,AES_ENCRYPT(?, ?),?)", [data.senderId, data.receiverId, data.message, encryptionKey, date]).then((data1) => {
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

obj.seenMessage = (data, callback) => {
    conn.query("select t1.socket_id from socket_users as t1 join " + userTableName + " as t2 on t2." + tokenColumn + "=t1.token where t2.id='" + data.senderId + "' LIMIT 1").then((senderData) => {
        conn.query("update chat set is_seen='1' where sender_id='" + data.senderId + "' and receiver_id = '" + data.receiverId + "'").then((data1) => {
            if (!fn.isEmpty(senderData)) {
                callback({ senderId: data.senderId, receiverId: data.receiverId, senderSocketId: senderData[0].socket_id });
            }
            else {
                callback({ senderId: data.senderId, receiverId: data.receiverId, senderSocketId: null });
            }
        });
    })
}

obj.getUserSocketId = (userId, callback) => {
    conn.query("select t1.socket_id from socket_users as t1 join " + userTableName + " as t2 on t2." + tokenColumn + " = t1.token where t2.id = '" + userId + "' LIMIT 1").then((data) => {
        if (!fn.isEmpty(data)) {
            callback(null, data[0]);
        }
        else {
            callback('not found', null);
        }

    }).catch((err) => {
        callback(err, null);
    });
};

obj.userChatList = (data, callback) => {
    conn.query("select t1.id,CAST(AES_DECRYPT(t1.message, '" + encryptionKey + "') AS CHAR) as message,t1.date_created,t1.receiver_id as receiverId,t1.sender_id as senderId,t1.is_seen from chat as t1 where (t1.sender_id='" + data.senderId + "' and t1.receiver_id='" + data.receiverId + "') or (t1.sender_id='" + data.receiverId + "' and t1.receiver_id='" + data.senderId + "') order by t1.date_created desc LIMIT 50").then((data1) => {
        //console.log(data1)
        conn.query("update chat set is_seen='1' where receiver_id='" + data.senderId + "' and sender_id='" + data.receiverId + "'").then(() => {
            callback(data1);
        });
    });
    // conn.query("select t1.id,CAST(FROM_BASE64(t1.message) AS CHAR) as message,t1.date_created,t1.receiver_id as receiverId,t1.sender_id as senderId,t1.is_seen from chat as t1 where (t1.sender_id='" + data.senderId + "' and t1.receiver_id='" + data.receiverId + "') or (t1.sender_id='" + data.receiverId + "' and t1.receiver_id='" + data.senderId + "') order by t1.date_created desc LIMIT 50").then((data1) => {
    //     //console.log(data1)
    //     conn.query("update chat set is_seen='1' where receiver_id='" + data.senderId + "' and sender_id='" + data.receiverId + "'").then(() => {
    //         callback(data1);
    //     });
    // });
}

obj.deleteUserToken = (socket, callback) => {
    obj.lastSeen(socket.userData.id, 'LOGOUT');
    conn.query("delete from socket_users where socket_id='" + socket.id + "'").then((data) => {

        if (callback) {
            callback(data);
        }
    });
}

obj.lastSeen = (userId, userAction) => {
    let date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    conn.query(`insert into last_seen(user_id,action,date_created) values('${userId}','${userAction}','${date}')`)
}

module.exports = obj;