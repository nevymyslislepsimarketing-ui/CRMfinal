const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Uživatel není autentizován' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Nemáte oprávnění k této akci',
        requiredRole: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

module.exports = checkRole;
