//This file will define the interface of how the api should respond
import { Message } from "../model/User";

export interface ApiResponse {
  success: boolean;
  message: String;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}
