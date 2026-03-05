export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;

  static ok<T>(data: T): ApiResponse<T> {
    const res = new ApiResponse<T>();
    res.success = true;
    res.data = data;
    return res;
  }

  static error(message: string): ApiResponse<null> {
    const res = new ApiResponse<null>();
    res.success = false;
    res.message = message;
    return res;
  }
}
