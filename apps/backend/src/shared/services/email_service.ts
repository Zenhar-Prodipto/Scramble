// src/shared/services/email.service.ts
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";

@Injectable()
export class EmailService {
  constructor(@InjectQueue("email") private emailQueue: Queue) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.emailQueue.add("welcome", { to: email, name });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    await this.emailQueue.add("password-reset", { to: email, resetToken });
  }

  async sendEmailVerification(
    email: string,
    verificationToken: string
  ): Promise<void> {
    await this.emailQueue.add("email-verification", {
      to: email,
      verificationToken,
    });
  }
}
