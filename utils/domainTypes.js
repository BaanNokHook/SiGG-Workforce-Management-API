// @flow

export type ResponseMessage = {
  success: Failure,
  failure: Failure,
}

export type Message = {
  th: string,
}

export type ResponseMessageMatcher = {
  fromPath: string[],
  title: Message,
  message: Message,
}
