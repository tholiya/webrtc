import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    type: {
        type: String
    },
    mobile: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    meetingId:{
        type: String
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
