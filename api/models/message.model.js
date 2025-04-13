import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
 conversationId:{
    type: String,
    required: true,
 },
 userId:{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
 },
 desc:{
    type: String,
    required: true,
 },
},{
timestamps:true
});

export default mongoose.model("message",messageSchema)