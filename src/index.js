const express = require('express');
const route = require('./routes/route');
const mongoose= require('mongoose');
const app = express();


app.use(express.json());

mongoose.connect("mongodb+srv://project_5:FgUPMerTJLd90g7X@cluster0.6fzkxm9.mongodb.net/group49Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route)

 
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});