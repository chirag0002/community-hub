const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// connect to MongoDB
mongoose.connect(process.env.DB);

// define schemas
const userSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        maxlength: 64,
        required: true
    },
    email: {
        type: String,
        unique: true,
        maxlength: 128
    }, 
    password: {
        type: String,
        maxlength: 64
    },
    created_at:Date
});


const communitySchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        maxlength: 128,
        minlength: 2
    },
    slug: {
        type: String,
        unique: true,
        maxlength: 255
    }, 
    owner: {
        type: String,
        ref: 'User'
    },
    created_at:Date,
    updated_at:Date 
});


const roleSchema = new mongoose.Schema({
    id: { 
        type: String, 
        unique: true 
    },
    name: { 
        type: String, 
        maxlength: 64, 
        unique: true 
    },
    created_at:Date,
    updated_at:Date 
  });
  

  const memberSchema = new mongoose.Schema({
    id: { 
        type: String,
        unique: true 
    },
    community: { 
        type: String, 
        ref: 'Community'
    },
    user: { 
        type: String, 
        ref: 'User'
    },
    role: { 
        type: String,
        ref: 'Role'
    },
    created_at:Date
  });

// create mongoose models based on the defined schemas
const User = mongoose.model('User', userSchema);
const Community = mongoose.model('Community', communitySchema);
const Role = mongoose.model('Role', roleSchema);
const Member = mongoose.model('Member', memberSchema);

module.exports = {
    User,
    Community,
    Role,
    Member
}