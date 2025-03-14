export const sendSuccess = (res, status, data, message = "Success") => {
    res.status(status).json({ success: true, message, data });
  };
  
  export const sendError = (res, status, message) => {
    res.status(status).json({ success: false, message });
  };