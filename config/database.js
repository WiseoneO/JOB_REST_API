const mongoose = require("mongoose");

const connectDatabse = () => {mongoose.connect(process.env.DB_LOCAL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con =>{
    console.log(`mongoDB database connected with host: ${con.connection.host}`);
    })

}

module.exports = connectDatabse;