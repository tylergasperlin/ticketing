import mongoose from 'mongoose';
import { Password } from '../services/password';
// properties for new user
interface IUserAttrs {
    email: string;
    password: string;
}

// properties for user model
interface IUserModel extends mongoose.Model<IUserDoc> {
    build(attrs: IUserAttrs): IUserDoc;
}

// properties for user document that you want to use
interface IUserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.set("toJSON", {
    transform: (doc: any, returned: any) => {
      returned.id = returned._id;
      delete returned._id;
      delete returned.password; // remove password field in returned object
      delete returned.__v;
    },
  });
  
// if you use an arrow function 'this' would reference the entire docuemnt instead of the function
// pre save = a middleware function within mongoose. Every time you try to save something run this function
// mongoose does not support async await very well so we use the done callback to handle async code

//* Pre save hook run everytime we save runs every time
userSchema.pre("save", async function () {
    // we have to pass in done as mongose does not know when the async function endds
    if (this.isModified("password")) {
      const hashed = await Password.toHash(
        this.get("password")
      );
      this.set("password", hashed);
    }
  });

// add a static method to the user schema for type checking
userSchema.static("build", (attrs: IUserAttrs) => {
    return new User(attrs);
  });

// IUserModels adds typing to the static methods
const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export { User }