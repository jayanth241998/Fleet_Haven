const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

var LicenseSchema = mongoose.Schema({
    category: String,
    expiryDate: String
}, { _id: false });

var LocationSchema = mongoose.Schema({
    lat:String,
    lng:String,
}, { _id: false })

var DriverSchema = mongoose.Schema({
    userId: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    nationalId: {
        type: String
    },
    address: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: 1,
        trim: true
    },
    password:{
        type: String,
        minlength:6
    },
    phoneNumber: {
        type: String
    },
    distanceTraveled: {
        type: Number, default: 0
    },
    license: [LicenseSchema],
    lat:{
        type: String,
        default: ""
    },
    lng:{ 
        type: String,
        default: ""
    }
});

let SALT = 10

DriverSchema.pre('save', function(next) {

    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(SALT, function(err,salt) {
            if(err) return next(err);

            bcrypt.hash(user.password, salt , function(err ,hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
        })
    }else {
        next()
    }
})

// DriverSchema.pre("save", function(next) {
//     bcrypt.hash(this.password, SALT, function(err, hash) {
//       if (err) return next(err);
//       this.password = hash;
//       next();
//     });
// })

DriverSchema.methods.ComparePassword = function(candidatePassword, checkPassword){
    console.log(candidatePassword, this.password)
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err) return checkPassword(err)
        checkPassword(null, isMatch)
    })
}

const Driver  = module.exports = mongoose.model('Driver', DriverSchema);
 