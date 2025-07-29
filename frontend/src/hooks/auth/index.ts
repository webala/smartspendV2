// Export all auth hooks from a single location for cleaner imports
export {
  useRegister,
  useLogin,
  useLogout,
  useProfile,
  useAuthStatus,
  AUTH_KEYS,
} from "./useAuth";
