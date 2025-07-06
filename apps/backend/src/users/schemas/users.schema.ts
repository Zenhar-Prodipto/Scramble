import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, enum: ["personal", "work"] })
  usageType!: string;

  @Prop({
    required: function (this: User) {
      return this.usageType === "work";
    },
  })
  company?: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ["male", "female", "other"] })
  gender!: string;

  @Prop({ default: "https://default-avatar.com/image.png" })
  avatar?: string;

  @Prop({ default: Date.now })
  lastLogin?: Date;

  @Prop({
    type: [{ type: "ObjectId", ref: "Project" }],
    default: [],
    index: true,
  })
  projects!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const bcrypt = await import("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
