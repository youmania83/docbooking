import { NextResponse } from "next/server";

/**
 * Standard API response types
 */
interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, string>;
}

/**
 * Success response builder
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: statusCode }
  );
}

/**
 * Error response builder
 */
export function errorResponse(
  error: string,
  code: string = "ERROR",
  statusCode = 400,
  details?: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  message = "Resource created successfully"
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, 201);
}
