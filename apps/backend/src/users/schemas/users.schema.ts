import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as bcrypt from "bcryptjs";

// Enums for reuse
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum UsageType {
  PERSONAL = "personal",
  WORK = "work",
}

// User schema with audit fields and indexes
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UsageType })
  usageType: UsageType;

  @Prop({
    required: function (this: User) {
      return this.usageType === UsageType.WORK;
    },
  })
  company?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ default: "https://default-avatar.com/image.png" })
  avatar: string;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({
    type: [{ type: "ObjectId", ref: "Project" }],
    default: [],
    index: true,
  })
  projects: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook for password hashing
UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(12); // 12 rounds for security
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(new Error("Failed to hash password: " + error.message));
  }
});
