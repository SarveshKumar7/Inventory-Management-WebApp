const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500; // ✅ Fixed syntax error

    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null // ✅ Fixed `ProcessingInstruction`
    });
};

module.exports = errorHandler;
