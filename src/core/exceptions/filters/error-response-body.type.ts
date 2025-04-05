type ErrorInfo = {
  message: string;
  field: string;
};

export type ErrorResponseBody = {
  errorsMessages: ErrorInfo[];
};
