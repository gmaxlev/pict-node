import * as temp from "temp";
import { all } from "./api/all";
import { strings } from "./api/strings";
import { text } from "./api/text";

temp.track();

export { all, strings, text };
