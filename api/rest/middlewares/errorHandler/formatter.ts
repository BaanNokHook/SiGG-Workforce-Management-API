import { ValidationError } from 'class-validator';

export function formatClassValidatorErrors(errors: ValidationError[]) {
  const messages = getErrorMessagesFromList(errors);

  if (messages)
    return messages.map(
      (msg) =>
        `${msg.props.length > 0 ? '[' + msg.props.join(':') + '] ' : ''}${
          msg.msg
        }`,
    );
  return;
}

function getErrorMessagesFromList(
  errors: ValidationError[],
  props: string[] = [],
) {
  const allMessages: { msg: string; props: string[] }[] = [];

  if (errors && errors.length > 0) {
    for (const err of errors) {
      const messages = getErrorMessages(err, props);

      if (messages) allMessages.push(...messages);
    }
  }
  return allMessages;
}

function getErrorMessages(err: ValidationError, props: string[] = []) {
  if (err.constraints) {
    const messages = Object.values(err.constraints).map((msg) => ({
      props,
      msg,
    }));

    return messages;
  }

  if (err.children.length > 0) {
    const messages = getErrorMessagesFromList(err.children, [
      ...props,
      err.property,
    ]);
    return messages;
  }
  return;
}
