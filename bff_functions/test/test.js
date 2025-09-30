import { HttpMethod } from "../../src/endpointGenerator/types";

export function handler(req, res) {
    res.send("this is /test/test");
}

export const config = {
    httpMethod: 'post',
    endpoints: []
}