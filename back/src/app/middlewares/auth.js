const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const authConfig = require('./../../config/auth');
const User = require('./../models/User');

module.exports = async (req, res, next) => {




	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: 'Token not provided', status: false });
	}

	const [ , token ] = authHeader.split(' ');

	try {
		const decoded = await promisify(jwt.verify)(token, authConfig.secretKey);

		req.userId = decoded._id;
		req.userName = decoded.name;
		req.userRole = decoded.role;

		const user = await User.findById({_id: req.userId});
		
		if (user.userBlocked(user)) {
			return res.status(403).json({ message: 'Forbidden', status: false });
		}

		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid Token', status: false });
	}
};
