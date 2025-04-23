


const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
    }
};

const isManager = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Manager or Admin privileges required' });
    }
};

const isCashier = (req, res, next) => {
    if (req.user && (req.user.role === 'cashier' || req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Authenticated employee access required' });
    }
};


module.exports = {
    isAdmin,
    isManager,
    isCashier
};

