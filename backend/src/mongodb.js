const mongoose=require('mongoose')

mongoose.connect("mongodb+srv://khanmuhammadrayyan17:nBJPFX5JhtdlN0B6@cluster0.aowkj.mongodb.net/POS?retryWrites=true&w=majority")
.then(()=>{
    console.log("MongoDB Connected Succesfully!");
})
.catch(()=>{
    console.log("Failed to Connect!")
})

const LogInSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})


const collection=new mongoose.model("users",LogInSchema)

module.exports=collection