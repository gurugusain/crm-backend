import { ROLE_PERMISSIONS } from "../config/permissions.js";

export function authorize(requiredPermission) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ message: "Forbidden" });

    const allowed = ROLE_PERMISSIONS[role] || [];
    if (!allowed.includes(requiredPermission)) {
      return res.status(403).json({
        message: "Insufficient permissions",
        required: requiredPermission,
      });
    }

    next();
  };
}
