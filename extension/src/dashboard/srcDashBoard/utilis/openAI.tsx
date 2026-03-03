import Groq from "groq-sdk";
import { GROQ_KEY } from "./constant"

const groq = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true});
export default groq;
