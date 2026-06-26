function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function activityLogger(req, res, next) {
  const methodsToLog = ['POST', 'PUT', 'DELETE'];

  if (!methodsToLog.includes(req.method)) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400 && req.authUser) {
      const timestamp = formatDateTime(new Date());
      const userId = req.authUser.sub;
      const role = req.authUser.role;
      const method = req.method;
      const endpoint = req.originalUrl || req.url;

      console.log(`[${timestamp}]`);
      console.log(`User ID : ${userId}`);
      console.log(`Role    : ${role}`);
      console.log(`Method  : ${method}`);
      console.log(`Endpoint: ${endpoint}`);
    }
  });

  next();
}

module.exports = {
  activityLogger
};
