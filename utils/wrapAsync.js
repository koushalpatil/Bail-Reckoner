module.exports = (fxn) => {
    return (req, res, next) => {
      try {
        const result = fxn(req, res, next);
        if (result && typeof result.catch === 'function') {
          result.catch(next);
        }
      } catch (err) {
        next(err);
      }
    };
  };
  