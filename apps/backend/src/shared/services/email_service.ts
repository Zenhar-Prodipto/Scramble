import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(@InjectQueue("email") private emailQueue: Queue) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.emailQueue.add("welcome", { to: email, name });
    } catch (error) {
      this.logger.error(
        `Failed to queue welcome email: ${error.message}`,
        error.stack
      );
    }
  }
}
