export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
    });
  }
  next();
};
