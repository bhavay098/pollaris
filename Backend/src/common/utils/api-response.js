// Standardized success-response helpers. Every controller returns through
// these so all successful responses share one consistent JSON shape:
// { success, message, data }.

class ApiResponse {
  // 200 OK with optional payload.
  static ok(res, message, data = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  // 201 Created for resources that were just persisted.
  static created(res, message, data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  // 204 No Content — no body is sent.
  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;
