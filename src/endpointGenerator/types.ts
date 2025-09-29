export type File = {
  name: string;
  route: string;
  path: string;
  httpMethod: HttpMethod;
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
  OPTIONS = 'options',
  HEAD = 'head'
}